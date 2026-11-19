import { z } from 'zod';

const decimalAmount = z.string().regex(/^(0|[1-9]\d{0,14})(\.\d{1,4})?$/, 'Enter a valid positive decimal amount');

function toMinorPrecision(value: string): bigint {
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole!) * 10_000n + BigInt((fraction + '0000').slice(0, 4));
}

export const createCustomerLoanApplicationSchema = z.object({
  productId: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  currencyCode: z.string().regex(/^[A-Z]{3}$/),
  requestedAmount: decimalAmount,
  requestedDurationDays: z.number().int().positive().max(36525),
  applicantDeclarationVersion: z.string().trim().min(1).max(64),
  declarationAccepted: z.literal(true),
}).strict().superRefine((value, context) => {
  if (toMinorPrecision(value.requestedAmount) <= 0n) {
    context.addIssue({ code: 'custom', path: ['requestedAmount'], message: 'Requested amount must be greater than zero' });
  }
});

export const applicationIdSchema = z.string().uuid();

export const customerApplicationStatuses = [
  'draft', 'submitted', 'under_review', 'awaiting_documents',
  'approved_conditionally', 'declined', 'withdrawn', 'cancelled',
  'funding_pending', 'funded',
] as const;

export type CustomerApplicationStatus = typeof customerApplicationStatuses[number];
export type CreateCustomerLoanApplicationInput = z.infer<typeof createCustomerLoanApplicationSchema>;

export function canCustomerWithdraw(status: CustomerApplicationStatus): boolean {
  return status === 'draft' || status === 'submitted' || status === 'awaiting_documents';
}
