import { pgTable, text, timestamp, jsonb, numeric, boolean } from 'drizzle-orm/pg-core';
import { user } from './auth-schema.js';

/**
 * Service categories for the platform
 * Used by both clients (preferences) and providers (offered services)
 */
export const SERVICE_CATEGORIES = [
  'braids',
  'locs',
  'barber',
  'wigs',
  'nails',
  'lashes',
] as const;

/**
 * OTP Verification table
 * Stores temporary OTP codes for email verification
 */
export const otpVerification = pgTable('otp_verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(), // email address
  value: text('value').notNull(), // 6-digit OTP code
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const clientProfiles = pgTable('client_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  phoneNumber: text('phone_number'),
  locationEnabled: boolean('location_enabled').default(false),
  preferredCategories: jsonb('preferred_categories').$type<typeof SERVICE_CATEGORIES[number][]>(),
  preferredDistanceMin: numeric('preferred_distance_min', { precision: 10, scale: 2 }),
  preferredDistanceMax: numeric('preferred_distance_max', { precision: 10, scale: 2 }),
  preferredPriceMin: numeric('preferred_price_min', { precision: 10, scale: 2 }),
  preferredPriceMax: numeric('preferred_price_max', { precision: 10, scale: 2 }),
  onboardingComplete: boolean('onboarding_complete').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const providerProfiles = pgTable('provider_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  businessName: text('business_name').notNull(),
  country: text('country').notNull(),
  stateProvince: text('state_province').notNull(),
  phoneNumber: text('phone_number').notNull(),
  streetAddress: text('street_address').notNull(),
  zipCode: text('zip_code').notNull(),
  serviceProvisionMethod: text('service_provision_method').notNull(), // 'at_my_location' | 'travel_to_clients' | 'both'
  serviceCategories: jsonb('service_categories').$type<typeof SERVICE_CATEGORIES[number][]>().notNull().default([]),
  subscriptionPlan: text('subscription_plan').notNull().default('free'), // 'free' or 'premium'
  idVerificationStatus: text('id_verification_status').notNull().default('not-submitted'), // 'not-submitted', 'pending-approval', 'approved', 'rejected'
  idDocumentUrl: text('id_document_url'),
  idDocumentKey: text('id_document_key'), // Storage key for the uploaded document
  onboardingComplete: boolean('onboarding_complete').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});
