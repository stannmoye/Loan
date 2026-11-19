import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../db/pool.js';
import { assertDifferentApprover } from '../domain/loan-product.js';
import type { CreateLoanProductInput } from '../domain/loan-product.js';

function domainError(message: string, statusCode = 409): Error {
  const error = new Error(message);
  Object.assign(error, { statusCode });
  return error;
}

export async function listPublishedProducts(countryCode: string, currencyCode: string) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT p.id, p.code, p.name, p.description, c.code AS currency,
            v.minimum_amount, v.maximum_amount, v.minimum_duration_days,
            v.maximum_duration_days, v.interest_model, v.annual_interest_rate_bps,
            v.repayment_frequency, v.version_number
       FROM loan_products p
       JOIN loan_product_versions v ON v.loan_product_id = p.id AND v.status = 'published'
       JOIN currencies c ON c.code = v.currency_code
       JOIN loan_product_countries pc ON pc.loan_product_id = p.id AND pc.country_code = ? AND pc.enabled = 1
       JOIN countries co ON co.code = pc.country_code AND co.enabled = 1
       JOIN country_currencies cc ON cc.country_code = co.code AND cc.currency_code = v.currency_code AND cc.enabled = 1
      WHERE p.status = 'active' AND v.currency_code = ?
        AND (v.effective_from IS NULL OR v.effective_from <= CURRENT_TIMESTAMP(6))
        AND (v.effective_until IS NULL OR v.effective_until > CURRENT_TIMESTAMP(6))
      ORDER BY p.display_order, p.name`,
    [countryCode, currencyCode],
  );
  return rows;
}

export async function createDraftProduct(input: CreateLoanProductInput, actorId: string) {
  const countryCodes = [...new Set(input.countryCodes)];
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [categoryRows] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM loan_categories WHERE code = ? AND enabled = 1 FOR SHARE', [input.categoryCode]);
    const [typeRows] = await connection.execute<RowDataPacket[]>(
      'SELECT id, category_id FROM loan_product_types WHERE code = ? AND enabled = 1 FOR SHARE', [input.productTypeCode]);
    if (!categoryRows[0] || !typeRows[0] || typeRows[0].category_id !== categoryRows[0].id) {
      throw domainError('Unknown product category/type combination', 422);
    }
    const [countryRows] = await connection.execute<RowDataPacket[]>(
      `SELECT code FROM countries WHERE code IN (${countryCodes.map(() => '?').join(',')}) AND enabled = 1 FOR SHARE`,
      countryCodes);
    if (countryRows.length !== new Set(input.countryCodes).size) throw domainError('One or more countries are not enabled for lending', 422);
    const [currencyRows] = await connection.execute<RowDataPacket[]>(
      'SELECT code FROM currencies WHERE code = ? AND enabled = 1 FOR SHARE', [input.currency]);
    if (!currencyRows[0]) throw domainError('Currency is not enabled', 422);
    const [countryCurrencyRows] = await connection.execute<RowDataPacket[]>(
      `SELECT country_code FROM country_currencies WHERE country_code IN (${countryCodes.map(() => '?').join(',')}) AND currency_code = ? AND enabled = 1 FOR SHARE`,
      [...countryCodes, input.currency]);
    if (countryCurrencyRows.length !== new Set(input.countryCodes).size) throw domainError('Currency is not enabled for every selected country', 422);

    const [productResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO loan_products (code, name, description, category_id, product_type_id, status, created_by)
       VALUES (?, ?, ?, ?, ?, 'draft', ?)`,
      [input.code, input.name, input.description ?? null, categoryRows[0].id, typeRows[0].id, actorId],
    );
    await connection.execute(
      `INSERT INTO loan_product_versions
       (loan_product_id, version_number, status, currency_code, minimum_amount, maximum_amount,
        minimum_duration_days, maximum_duration_days, interest_model, annual_interest_rate_bps,
        repayment_frequency, requires_collateral, requires_guarantor, risk_review_required, created_by)
       VALUES (?, 1, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productResult.insertId, input.currency, input.minimumAmount, input.maximumAmount,
       input.minimumDurationDays, input.maximumDurationDays, input.interestModel,
       input.annualInterestRateBps, input.repaymentFrequency, input.requiresCollateral,
       input.requiresGuarantor, input.riskReviewRequired, actorId],
    );
    for (const countryCode of countryCodes) {
      await connection.execute(
        `INSERT INTO loan_product_countries (loan_product_id, country_code, enabled, created_by)
         VALUES (?, ?, 1, ?)`, [productResult.insertId, countryCode, actorId]);
    }
    await writeAudit(connection, actorId, 'loan_product.draft_created', 'loan_product', String(productResult.insertId), {
      productCode: input.code, currency: input.currency, countries: countryCodes,
    });
    await connection.commit();
    return { id: productResult.insertId, code: input.code, status: 'draft', version: 1 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function writeAudit(connection: PoolConnection, actorId: string, action: string,
  entityType: string, entityId: string, metadata: object) {
  await connection.execute(
    `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, metadata_json)
     VALUES (?, ?, ?, ?, ?)`, [actorId, action, entityType, entityId, JSON.stringify(metadata)]);
}


export async function submitProductForApproval(productId: number, actorId: string) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [products] = await connection.execute<RowDataPacket[]>(
      `SELECT p.id, p.status, v.id AS version_id, v.status AS version_status, v.risk_review_required
         FROM loan_products p JOIN loan_product_versions v ON v.loan_product_id = p.id AND v.version_number = 1
        WHERE p.id = ? FOR UPDATE`, [productId]);
    const product = products[0];
    if (!product || product.status !== 'draft' || product.version_status !== 'draft') {
      throw domainError('Only a draft product with a draft version can be submitted');
    }
    if (!product.risk_review_required) throw domainError('Risk review must be enabled before publication', 422);
    const [pending] = await connection.execute<RowDataPacket[]>(
      `SELECT id FROM loan_product_approval_requests WHERE loan_product_id = ? AND status = 'pending' FOR UPDATE`, [productId]);
    if (pending.length) throw domainError('This product already has a pending approval request');
    const [insert] = await connection.execute<ResultSetHeader>(
      `INSERT INTO loan_product_approval_requests (loan_product_id, product_version_id, submitted_by) VALUES (?, ?, ?)`,
      [productId, product.version_id, actorId]);
    await writeAudit(connection, actorId, 'loan_product.submitted_for_approval', 'loan_product', String(productId), { approvalRequestId: insert.insertId });
    await connection.commit();
    return { approvalRequestId: insert.insertId, productId, status: 'pending' };
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

export async function decideProductApproval(productId: number, actorId: string, decision: 'approve' | 'reject', note?: string) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [requests] = await connection.execute<RowDataPacket[]>(
      `SELECT ar.id, ar.product_version_id, ar.submitted_by, ar.status, p.status AS product_status, v.status AS version_status, v.risk_review_required
         FROM loan_product_approval_requests ar
         JOIN loan_products p ON p.id = ar.loan_product_id
         JOIN loan_product_versions v ON v.id = ar.product_version_id
        WHERE ar.loan_product_id = ? AND ar.status = 'pending' FOR UPDATE`, [productId]);
    const request = requests[0];
    if (!request) throw domainError('No pending approval request exists for this product');
    try { assertDifferentApprover(request.submitted_by, actorId); }
    catch (error) { throw domainError((error as Error).message, 403); }
    if (request.product_status !== 'draft' || request.version_status !== 'draft' || !request.risk_review_required) {
      throw domainError('Product state is not eligible for approval');
    }
    if (decision === 'approve') {
      const [eligibility] = await connection.execute<RowDataPacket[]>(
        `SELECT pc.country_code
           FROM loan_product_countries pc
           JOIN countries co ON co.code = pc.country_code AND co.enabled = 1
           JOIN loan_product_versions v ON v.loan_product_id = pc.loan_product_id AND v.id = ?
           JOIN currencies cu ON cu.code = v.currency_code AND cu.enabled = 1
           JOIN country_currencies cc ON cc.country_code = pc.country_code AND cc.currency_code = v.currency_code AND cc.enabled = 1
          WHERE pc.loan_product_id = ? AND pc.enabled = 1 FOR SHARE`,
        [request.product_version_id, productId]);
      const [scope] = await connection.execute<RowDataPacket[]>(
        'SELECT COUNT(*) AS country_count FROM loan_product_countries WHERE loan_product_id = ? AND enabled = 1', [productId]);
      if (!scope[0] || eligibility.length !== Number(scope[0].country_count) || eligibility.length === 0) {
        throw domainError('Country or currency eligibility changed; update the product scope before approval', 422);
      }
      const [versionUpdate] = await connection.execute<ResultSetHeader>(
        `UPDATE loan_product_versions SET status = 'published', effective_from = CURRENT_TIMESTAMP(6) WHERE id = ? AND status = 'draft'`,
        [request.product_version_id]);
      const [productUpdate] = await connection.execute<ResultSetHeader>(
        `UPDATE loan_products SET status = 'active' WHERE id = ? AND status = 'draft'`, [productId]);
      if (versionUpdate.affectedRows !== 1 || productUpdate.affectedRows !== 1) {
        throw domainError('Product state changed during approval; no publication was completed');
      }
    }
    const [decisionUpdate] = await connection.execute<ResultSetHeader>(
      `UPDATE loan_product_approval_requests SET status = ?, decided_by = ?, decided_at = CURRENT_TIMESTAMP(6), decision_note = ? WHERE id = ? AND status = 'pending'`,
      [decision === 'approve' ? 'approved' : 'rejected', actorId, note ?? null, request.id]);
    if (decisionUpdate.affectedRows !== 1) throw domainError('Approval request was already decided');
    await writeAudit(connection, actorId, decision === 'approve' ? 'loan_product.approved' : 'loan_product.rejected', 'loan_product', String(productId), { approvalRequestId: request.id, note: note ?? null });
    await connection.commit();
    return { productId, status: decision === 'approve' ? 'active' : 'draft' };
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}


export async function listPendingProductApprovals(limit = 50) {
  const boundedLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT ar.id AS approval_request_id, ar.loan_product_id, ar.product_version_id,
            ar.submitted_by, ar.submitted_at, p.code, p.name, c.code AS currency,
            v.minimum_amount, v.maximum_amount, v.minimum_duration_days,
            v.maximum_duration_days, v.interest_model, v.annual_interest_rate_bps
       FROM loan_product_approval_requests ar
       JOIN loan_products p ON p.id = ar.loan_product_id
       JOIN loan_product_versions v ON v.id = ar.product_version_id
       JOIN currencies c ON c.code = v.currency_code
      WHERE ar.status = 'pending'
      ORDER BY ar.submitted_at ASC
      LIMIT ?`, [boundedLimit]);
  return rows;
}
