import { z } from 'zod';

const countryCode = z.string().regex(/^[A-Z]{2}$/, 'Use an uppercase two-letter country code');
const locale = z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, 'Use a language tag such as en or en-NG');

export const customerOnboardingSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  declaredResidenceCountryCode: countryCode,
  preferredLocale: locale.default('en'),
  privacyNoticeAccepted: z.literal(true),
  termsOfServiceAccepted: z.literal(true),
}).strict();

export const updateCustomerProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(120).optional(),
  declaredResidenceCountryCode: countryCode.optional(),
  preferredLocale: locale.optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one supported profile field must be provided',
});

export type CustomerOnboardingInput = z.infer<typeof customerOnboardingSchema>;
export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;

export type CustomerProfile = {
  email: string;
  emailVerified: true;
  displayName: string;
  declaredResidenceCountryCode: string;
  preferredLocale: string;
};
