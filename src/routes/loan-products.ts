import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createLoanProductSchema } from '../domain/loan-product.js';
import { requirePermission } from '../plugins/admin-auth.js';
import { createDraftProduct, decideProductApproval, listPendingProductApprovals, listPublishedProducts, submitProductForApproval } from '../services/loan-products.js';

function parseProductId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

const countryCurrencyQuery = z.object({
  country: z.string().regex(/^[A-Z]{2}$/),
  currency: z.string().regex(/^[A-Z]{3}$/),
});

export async function loanProductRoutes(app: FastifyInstance) {
  app.get('/api/v1/loan-products', async (request, reply) => {
    const parsed = countryCurrencyQuery.safeParse(request.query);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid country or currency' });
    const products = await listPublishedProducts(parsed.data.country, parsed.data.currency);
    return { data: products };
  });

  app.post('/api/v1/admin/loan-products', async (request, reply) => {
    const actorId = await requirePermission(request, 'loan_products:write');
    const parsed = createLoanProductSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid product configuration', details: parsed.error.flatten() });
    const result = await createDraftProduct(parsed.data, actorId);
    return reply.code(201).send({ data: result });
  });

  app.get('/api/v1/admin/loan-product-approvals', async (request, reply) => {
    await requirePermission(request, 'loan_products:approve');
    const query = z.object({ limit: z.coerce.number().int().min(1).max(100).default(50) }).safeParse(request.query);
    if (!query.success) return reply.code(400).send({ error: 'Invalid approval queue query' });
    return { data: await listPendingProductApprovals(query.data.limit) };
  });

  app.post<{ Params: { productId: string } }>('/api/v1/admin/loan-products/:productId/submit', async (request, reply) => {
    const actorId = await requirePermission(request, 'loan_products:submit');
    const productId = parseProductId(request.params.productId);
    if (productId === null) return reply.code(400).send({ error: 'Invalid product ID' });
    const result = await submitProductForApproval(productId, actorId);
    return reply.code(202).send({ data: result });
  });

  app.post<{ Params: { productId: string }; Body: { decision: 'approve' | 'reject'; note?: string } }>('/api/v1/admin/loan-products/:productId/decision', async (request, reply) => {
    const actorId = await requirePermission(request, 'loan_products:approve');
    const productId = parseProductId(request.params.productId);
    if (productId === null) return reply.code(400).send({ error: 'Invalid product ID' });
    const body = z.object({ decision: z.enum(['approve', 'reject']), note: z.string().trim().max(2000).optional() }).strict()
      .superRefine((value, context) => {
        if (value.decision === 'reject' && (!value.note || value.note.length < 5)) {
          context.addIssue({ code: 'custom', path: ['note'], message: 'A rejection reason of at least 5 characters is required' });
        }
      }).safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: 'Invalid approval decision', details: body.error.flatten() });
    const result = await decideProductApproval(productId, actorId, body.data.decision, body.data.note);
    return { data: result };
  });
}
