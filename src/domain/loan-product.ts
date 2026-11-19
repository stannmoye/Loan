import { z } from 'zod';

const money = z.string().regex(/^(0|[1-9]\d{0,11})(\.\d{1,4})?$/, 'Use a non-negative decimal string with up to 4 decimal places');
const currency = z.string().regex(/^[A-Z]{3}$/);

function decimalToTenThousandths(value: string): bigint {
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole!) * 10_000n + BigInt((fraction + '0000').slice(0, 4));
}

export const createLoanProductSchema = z.object({
  code: z.string().regex(/^[A-Z0-9][A-Z0-9_-]{1,47}$/),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(4000).optional(),
  categoryCode: z.string().regex(/^[a-z0-9][a-z0-9-]{1,63}$/),
  productTypeCode: z.string().regex(/^[a-z0-9][a-z0-9-]{1,63}$/),
  currency: currency,
  minimumAmount: money,
  maximumAmount: money,
  minimumDurationDays: z.number().int().positive().max(36525),
  maximumDurationDays: z.number().int().positive().max(36525),
  interestModel: z.enum(['fixed', 'variable', 'zero_interest']),
  annualInterestRateBps: z.number().int().min(0).max(100_000),
  repaymentFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'bullet']),
  countryCodes: z.array(z.string().regex(/^[A-Z]{2}$/)).min(1).max(100)
    .refine((codes) => new Set(codes).size === codes.length, 'Country codes must be unique'),
  requiresCollateral: z.boolean().default(false),
  requiresGuarantor: z.boolean().default(false),
  riskReviewRequired: z.boolean().default(true),
}).strict().superRefine((value, ctx) => {
  if (decimalToTenThousandths(value.minimumAmount) <= 0n) {
    ctx.addIssue({ code: 'custom', path: ['minimumAmount'], message: 'Minimum amount must be greater than zero' });
  }
  if (decimalToTenThousandths(value.minimumAmount) > decimalToTenThousandths(value.maximumAmount)) {
    ctx.addIssue({ code: 'custom', path: ['maximumAmount'], message: 'Maximum amount must be at least the minimum amount' });
  }
  if (value.minimumDurationDays > value.maximumDurationDays) {
    ctx.addIssue({ code: 'custom', path: ['maximumDurationDays'], message: 'Maximum duration must be at least the minimum duration' });
  }
  if (value.interestModel === 'zero_interest' && value.annualInterestRateBps !== 0) {
    ctx.addIssue({ code: 'custom', path: ['annualInterestRateBps'], message: 'Zero-interest products must have a 0 bps rate' });
  }
});

export type CreateLoanProductInput = z.infer<typeof createLoanProductSchema>;

export function assertPublishable(input: CreateLoanProductInput): void {
  if (input.riskReviewRequired === false) {
    throw new Error('Risk review cannot be disabled for publication in this release');
  }
}

export function assertDifferentApprover(submittedBy: string, decidedBy: string): void {
  if (submittedBy === decidedBy) throw new Error('Maker-checker violation: the submitting administrator cannot approve this product');
}
