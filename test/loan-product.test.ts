import { describe, expect, it } from 'vitest';
import { createLoanProductSchema, assertDifferentApprover, assertPublishable } from '../src/domain/loan-product.js';

const valid = {
  code: 'PERSONAL_STD', name: 'Personal loan', categoryCode: 'personal-consumer',
  productTypeCode: 'personal-loan', currency: 'USD', minimumAmount: '100.00', maximumAmount: '5000.00',
  minimumDurationDays: 30, maximumDurationDays: 730, interestModel: 'fixed', annualInterestRateBps: 1200,
  repaymentFrequency: 'monthly', countryCodes: ['US'], requiresCollateral: false,
  requiresGuarantor: false, riskReviewRequired: true,
};

describe('loan product configuration validation', () => {
  it('accepts a valid product configuration', () => expect(createLoanProductSchema.safeParse(valid).success).toBe(true));
  it('rejects inverted amount ranges', () => expect(createLoanProductSchema.safeParse({ ...valid, minimumAmount: '9000', maximumAmount: '1000' }).success).toBe(false));
  it('rejects inverted duration ranges', () => expect(createLoanProductSchema.safeParse({ ...valid, minimumDurationDays: 900, maximumDurationDays: 30 }).success).toBe(false));
  it('rejects a zero-interest product with a non-zero rate', () => expect(createLoanProductSchema.safeParse({ ...valid, interestModel: 'zero_interest', annualInterestRateBps: 100 }).success).toBe(false));
  it('requires risk review to remain enabled for publication', () => {
    const parsed = createLoanProductSchema.parse({ ...valid, riskReviewRequired: false });
    expect(() => assertPublishable(parsed)).toThrow(/Risk review cannot be disabled/);
  });
  it('rejects non-ISO currency codes', () => expect(createLoanProductSchema.safeParse({ ...valid, currency: 'US DOLLAR' }).success).toBe(false));
  it('rejects duplicate country scopes', () => expect(createLoanProductSchema.safeParse({ ...valid, countryCodes: ['US', 'US'] }).success).toBe(false));
});

describe('maker-checker approval policy', () => {
  it('allows a different administrator to approve', () => expect(() => assertDifferentApprover('admin-a', 'admin-b')).not.toThrow());
  it('prevents the submitting administrator from approving', () => expect(() => assertDifferentApprover('admin-a', 'admin-a')).toThrow(/Maker-checker violation/));
});
