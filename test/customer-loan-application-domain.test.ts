import { describe, expect, it } from 'vitest';
import {
  applicationIdSchema,
  canCustomerWithdraw,
  createCustomerLoanApplicationSchema,
} from '../src/domain/customer-loan-application.js';

describe('customer loan application contracts', () => {
  const valid = {
    productId: 12,
    currencyCode: 'NGN',
    requestedAmount: '125000.50',
    requestedDurationDays: 180,
    applicantDeclarationVersion: 'application-declaration-v1',
    declarationAccepted: true,
  };

  it('accepts a well-formed application request without accepting customer identity fields', () => {
    expect(createCustomerLoanApplicationSchema.safeParse(valid).success).toBe(true);
    expect(createCustomerLoanApplicationSchema.safeParse({ ...valid, customerId: 'attacker' }).success).toBe(false);
    expect(createCustomerLoanApplicationSchema.safeParse({ ...valid, status: 'approved' }).success).toBe(false);
  });

  it('requires affirmative declaration and validates exact decimal amount precision', () => {
    expect(createCustomerLoanApplicationSchema.safeParse({ ...valid, declarationAccepted: false }).success).toBe(false);
    expect(createCustomerLoanApplicationSchema.safeParse({ ...valid, requestedAmount: '0' }).success).toBe(false);
    expect(createCustomerLoanApplicationSchema.safeParse({ ...valid, requestedAmount: '1.12345' }).success).toBe(false);
    expect(createCustomerLoanApplicationSchema.safeParse({ ...valid, requestedAmount: '1.0001' }).success).toBe(true);
  });

  it('validates UUID application identifiers', () => {
    expect(applicationIdSchema.safeParse('a48d7f98-4da7-4550-a1a3-38c32ed5b4e6').success).toBe(true);
    expect(applicationIdSchema.safeParse('not-a-uuid').success).toBe(false);
  });

  it('permits withdrawal only before a final or funding decision', () => {
    expect(canCustomerWithdraw('draft')).toBe(true);
    expect(canCustomerWithdraw('submitted')).toBe(true);
    expect(canCustomerWithdraw('awaiting_documents')).toBe(true);
    expect(canCustomerWithdraw('under_review')).toBe(false);
    expect(canCustomerWithdraw('approved_conditionally')).toBe(false);
    expect(canCustomerWithdraw('funded')).toBe(false);
  });
});
