import { describe, expect, it } from 'vitest';
import { customerOnboardingSchema, updateCustomerProfileSchema } from '../src/domain/customer-account.js';


describe('customer onboarding and profile validation', () => {
  it('requires a declared country and affirmative privacy and terms acknowledgements', () => {
    expect(customerOnboardingSchema.safeParse({
      displayName: 'Sample Customer',
      declaredResidenceCountryCode: 'NG',
      preferredLocale: 'en-NG',
      privacyNoticeAccepted: true,
      termsOfServiceAccepted: true,
    }).success).toBe(true);
    expect(customerOnboardingSchema.safeParse({
      displayName: 'Sample Customer',
      declaredResidenceCountryCode: 'NG',
      preferredLocale: 'en-NG',
      privacyNoticeAccepted: false,
      termsOfServiceAccepted: true,
    }).success).toBe(false);
  });

  it('rejects identity claims or unsupported fields supplied in onboarding/profile payloads', () => {
    expect(customerOnboardingSchema.safeParse({
      displayName: 'Sample Customer',
      declaredResidenceCountryCode: 'NG',
      privacyNoticeAccepted: true,
      termsOfServiceAccepted: true,
      email: 'forged@example.test',
      subject: 'forged-subject',
    }).success).toBe(false);
    expect(updateCustomerProfileSchema.safeParse({ email: 'forged@example.test' }).success).toBe(false);
    expect(updateCustomerProfileSchema.safeParse({ displayName: 'Updated Customer' }).success).toBe(true);
    expect(updateCustomerProfileSchema.safeParse({}).success).toBe(false);
  });
});
