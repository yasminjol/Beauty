import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import crypto from 'crypto';

/**
 * Generate a random 6-digit OTP code
 */
function generateOTP(): string {
  return Math.floor(Math.random() * 900000 + 100000).toString();
}

/**
 * Generate a unique ID for verification records
 */
function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

export function registerOnboardingRoutes(app: App) {
  const requireAuth = app.requireAuth();

  /**
   * GET /api/categories
   * Returns the list of available service categories
   * Public endpoint - no authentication required
   */
  app.fastify.get('/api/categories', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<{ categories: typeof schema.SERVICE_CATEGORIES }> => {
    app.logger.info('Fetching service categories');
    return { categories: schema.SERVICE_CATEGORIES };
  });

  /**
   * POST /api/otp/send
   * Sends OTP code to email
   * Body: { email: string }
   * Returns: { success: true, message: "OTP sent to email" }
   */
  app.fastify.post('/api/otp/send', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<{ success: boolean; message: string } | void> => {
    const body = request.body as { email?: string };
    const email = body?.email;

    app.logger.info({ email }, 'OTP send requested');

    try {
      if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        app.logger.warn({ email }, 'Invalid email format');
        return reply.status(400).send({ error: 'Valid email address is required' });
      }

      // Generate OTP code
      const otpCode = generateOTP();

      // Calculate expiration time (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Delete any existing OTP for this email
      await app.db.delete(schema.otpVerification).where(eq(schema.otpVerification.identifier, email));

      // Store OTP in database
      await app.db.insert(schema.otpVerification).values({
        id: generateId('otp'),
        identifier: email,
        value: otpCode,
        expiresAt,
      });

      app.logger.info({ email, expiresAt }, 'OTP generated and stored');

      // Log OTP for development (in production, would send via email service)
      app.logger.info({ email, otpCode }, 'OTP code generated - send to user via email');

      return {
        success: true,
        message: `OTP sent to ${email}`,
      };
    } catch (error) {
      app.logger.error({ err: error, email }, 'Failed to send OTP');
      throw error;
    }
  });

  /**
   * POST /api/otp/verify
   * Verifies OTP code
   * Body: { email: string, code: string }
   * Returns: { success: true } on success
   * Returns 400 with "Invalid or expired code" on failure
   */
  app.fastify.post('/api/otp/verify', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<{ success: boolean } | void> => {
    const body = request.body as { email?: string; code?: string };
    const { email, code } = body;

    app.logger.info({ email }, 'OTP verification requested');

    try {
      if (!email || !code) {
        app.logger.warn({ email }, 'Email or code missing');
        return reply.status(400).send({ error: 'Email and code are required' });
      }

      // Find OTP record
      const otpRecords = await app.db
        .select()
        .from(schema.otpVerification)
        .where(eq(schema.otpVerification.identifier, email));

      if (otpRecords.length === 0) {
        app.logger.warn({ email }, 'No OTP found for email');
        return reply.status(400).send({ error: 'Invalid or expired code' });
      }

      const otpRecord = otpRecords[0];

      // Check if OTP is expired
      if (new Date() > otpRecord.expiresAt) {
        app.logger.warn({ email }, 'OTP has expired');
        // Delete expired OTP
        await app.db.delete(schema.otpVerification).where(eq(schema.otpVerification.id, otpRecord.id));
        return reply.status(400).send({ error: 'Invalid or expired code' });
      }

      // Check if code matches
      if (otpRecord.value !== code) {
        app.logger.warn({ email, providedCode: code }, 'OTP code mismatch');
        return reply.status(400).send({ error: 'Invalid or expired code' });
      }

      // Delete the OTP record after successful verification
      await app.db.delete(schema.otpVerification).where(eq(schema.otpVerification.id, otpRecord.id));

      app.logger.info({ email }, 'OTP verified successfully');

      return { success: true };
    } catch (error) {
      app.logger.error({ err: error, email }, 'Failed to verify OTP');
      throw error;
    }
  });

  /**
   * POST /api/onboarding/client
   * Client onboarding endpoint
   * Required fields: name (string), phoneNumber (string), locationEnabled (boolean)
   * Optional fields: preferredCategories, preferredDistanceMin, preferredDistanceMax, preferredPriceMin, preferredPriceMax
   * Creates or updates client profile and marks onboarding as complete
   */
  app.fastify.post('/api/onboarding/client', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<{ message: string; profile: any } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { userId } = session.user;
    const body = request.body as {
      name?: string;
      phoneNumber?: string;
      locationEnabled?: boolean;
      preferredCategories?: typeof schema.SERVICE_CATEGORIES[number][];
      preferredDistanceMin?: number;
      preferredDistanceMax?: number;
      preferredPriceMin?: number;
      preferredPriceMax?: number;
    };
    const {
      name,
      phoneNumber,
      locationEnabled = false,
      preferredCategories,
      preferredDistanceMin,
      preferredDistanceMax,
      preferredPriceMin,
      preferredPriceMax,
    } = body;

    app.logger.info(
      {
        userId,
        name,
        phoneNumber,
        locationEnabled,
        preferredCategories,
      },
      'Client onboarding started'
    );

    try {
      // Validate required fields
      if (!name || name.trim().length === 0) {
        app.logger.warn({ userId }, 'Client onboarding failed: name missing');
        return reply.status(400).send({ error: 'Name is required' });
      }

      if (!phoneNumber || phoneNumber.trim().length === 0) {
        app.logger.warn({ userId }, 'Client onboarding failed: phone number missing');
        return reply.status(400).send({ error: 'Phone number is required' });
      }

      // Validate categories if provided
      if (preferredCategories !== undefined) {
        if (!Array.isArray(preferredCategories)) {
          app.logger.warn({ userId }, 'Client onboarding failed: invalid categories format');
          return reply.status(400).send({ error: 'Preferred categories must be an array' });
        }

        if (preferredCategories.length > 0) {
          // Validate that all selected categories are valid
          const validCategories = schema.SERVICE_CATEGORIES;
          const invalidCategories = preferredCategories.filter(cat => !validCategories.includes(cat));
          if (invalidCategories.length > 0) {
            app.logger.warn({ userId, invalidCategories }, 'Invalid categories provided');
            return reply.status(400).send({ error: 'Invalid service categories provided' });
          }
        }
      }

      // Validate distance range if provided
      if (preferredDistanceMin !== undefined && preferredDistanceMax !== undefined) {
        if (preferredDistanceMin < 0 || preferredDistanceMax < 0 || preferredDistanceMin > preferredDistanceMax) {
          app.logger.warn({ userId, preferredDistanceMin, preferredDistanceMax }, 'Invalid distance range');
          return reply.status(400).send({ error: 'Invalid distance range' });
        }
      }

      // Validate price range if provided
      if (preferredPriceMin !== undefined && preferredPriceMax !== undefined) {
        if (preferredPriceMin < 0 || preferredPriceMax < 0 || preferredPriceMin > preferredPriceMax) {
          app.logger.warn({ userId, preferredPriceMin, preferredPriceMax }, 'Invalid price range');
          return reply.status(400).send({ error: 'Invalid price range' });
        }
      }

      // Check if profile already exists
      const existingProfile = await app.db
        .select()
        .from(schema.clientProfiles)
        .where(eq(schema.clientProfiles.userId, userId));

      let profile;
      if (existingProfile.length > 0) {
        // Update existing profile
        [profile] = await app.db
          .update(schema.clientProfiles)
          .set({
            phoneNumber,
            locationEnabled,
            preferredCategories: preferredCategories || null,
            preferredDistanceMin: preferredDistanceMin?.toString(),
            preferredDistanceMax: preferredDistanceMax?.toString(),
            preferredPriceMin: preferredPriceMin?.toString(),
            preferredPriceMax: preferredPriceMax?.toString(),
            onboardingComplete: true,
            updatedAt: new Date(),
          })
          .where(eq(schema.clientProfiles.userId, userId))
          .returning();
        app.logger.info({ userId, profileId: profile.id }, 'Client profile updated');
      } else {
        // Create new profile
        [profile] = await app.db
          .insert(schema.clientProfiles)
          .values({
            id: `client_${userId}`,
            userId,
            phoneNumber,
            locationEnabled,
            preferredCategories: preferredCategories || null,
            preferredDistanceMin: preferredDistanceMin?.toString(),
            preferredDistanceMax: preferredDistanceMax?.toString(),
            preferredPriceMin: preferredPriceMin?.toString(),
            preferredPriceMax: preferredPriceMax?.toString(),
            onboardingComplete: true,
          })
          .returning();
        app.logger.info({ userId, profileId: profile.id }, 'Client profile created');
      }

      return {
        message: 'Client onboarding completed successfully',
        profile,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to complete client onboarding');
      throw error;
    }
  });

  /**
   * POST /api/onboarding/provider
   * Provider onboarding endpoint
   * Required fields: name (string), businessName, country, stateProvince, phoneNumber, streetAddress, zipCode, serviceProvisionMethod, serviceCategories
   * serviceProvisionMethod: 'at_my_location' | 'travel_to_clients' | 'both'
   * serviceCategories: array of strings, max 2 for free plan
   * Creates or updates provider profile
   */
  app.fastify.post('/api/onboarding/provider', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<{ message: string; profile: any } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { userId } = session.user;
    const body = request.body as {
      name?: string;
      businessName?: string;
      country?: string;
      stateProvince?: string;
      phoneNumber?: string;
      streetAddress?: string;
      zipCode?: string;
      serviceProvisionMethod?: string;
      serviceCategories?: typeof schema.SERVICE_CATEGORIES[number][];
      subscriptionPlan?: 'free' | 'premium';
    };
    const {
      name,
      businessName,
      country,
      stateProvince,
      phoneNumber,
      streetAddress,
      zipCode,
      serviceProvisionMethod,
      serviceCategories,
      subscriptionPlan = 'free',
    } = body;

    app.logger.info(
      {
        userId,
        name,
        businessName,
        country,
        stateProvince,
        phoneNumber,
        streetAddress,
        zipCode,
        serviceProvisionMethod,
        serviceCategories,
        subscriptionPlan,
      },
      'Provider onboarding started'
    );

    try {
      // Validate required fields
      if (!name || name.trim().length === 0) {
        app.logger.warn({ userId }, 'Provider onboarding failed: name missing');
        return reply.status(400).send({ error: 'Name is required' });
      }

      if (!businessName || businessName.trim().length === 0) {
        app.logger.warn({ userId }, 'Provider onboarding failed: business name missing');
        return reply.status(400).send({ error: 'Business name is required' });
      }

      if (!country || country.trim().length === 0) {
        app.logger.warn({ userId }, 'Provider onboarding failed: country missing');
        return reply.status(400).send({ error: 'Country is required' });
      }

      if (!stateProvince || stateProvince.trim().length === 0) {
        app.logger.warn({ userId }, 'Provider onboarding failed: state/province missing');
        return reply.status(400).send({ error: 'State/Province is required' });
      }

      if (!phoneNumber || phoneNumber.trim().length === 0) {
        app.logger.warn({ userId }, 'Provider onboarding failed: phone number missing');
        return reply.status(400).send({ error: 'Phone number is required' });
      }

      if (!streetAddress || streetAddress.trim().length === 0) {
        app.logger.warn({ userId }, 'Provider onboarding failed: street address missing');
        return reply.status(400).send({ error: 'Street address is required' });
      }

      if (!zipCode || zipCode.trim().length === 0) {
        app.logger.warn({ userId }, 'Provider onboarding failed: zip code missing');
        return reply.status(400).send({ error: 'Zip code is required' });
      }

      // Validate service provision method
      const validMethods = ['at_my_location', 'travel_to_clients', 'both'];
      if (!serviceProvisionMethod || !validMethods.includes(serviceProvisionMethod)) {
        app.logger.warn({ userId, serviceProvisionMethod }, 'Invalid service provision method');
        return reply.status(400).send({
          error: 'Service provision method must be "at_my_location", "travel_to_clients", or "both"',
        });
      }

      // Validate categories
      if (!Array.isArray(serviceCategories) || serviceCategories.length === 0) {
        app.logger.warn({ userId }, 'Provider onboarding failed: no categories selected');
        return reply.status(400).send({ error: 'At least one service category must be selected' });
      }

      // Validate that all selected categories are valid
      const validCategories = schema.SERVICE_CATEGORIES;
      const invalidCategories = serviceCategories.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        app.logger.warn({ userId, invalidCategories }, 'Invalid categories provided');
        return reply.status(400).send({ error: 'Invalid service categories provided' });
      }

      // Enforce category limit for free plan
      if (subscriptionPlan === 'free' && serviceCategories.length > 2) {
        app.logger.warn(
          { userId, selectedCount: serviceCategories.length },
          'Free plan limited to 2 service categories'
        );
        return reply.status(400).send({
          error: 'Free subscription plan allows maximum 2 service categories. Please upgrade to premium or select fewer categories.',
        });
      }

      // Check if profile already exists
      const existingProfile = await app.db
        .select()
        .from(schema.providerProfiles)
        .where(eq(schema.providerProfiles.userId, userId));

      let profile;
      if (existingProfile.length > 0) {
        // Update existing profile
        [profile] = await app.db
          .update(schema.providerProfiles)
          .set({
            businessName,
            country,
            stateProvince,
            phoneNumber,
            streetAddress,
            zipCode,
            serviceProvisionMethod,
            serviceCategories,
            subscriptionPlan,
            onboardingComplete: true,
            updatedAt: new Date(),
          })
          .where(eq(schema.providerProfiles.userId, userId))
          .returning();
        app.logger.info({ userId, profileId: profile.id }, 'Provider profile updated');
      } else {
        // Create new profile
        [profile] = await app.db
          .insert(schema.providerProfiles)
          .values({
            id: `provider_${userId}`,
            userId,
            businessName,
            country,
            stateProvince,
            phoneNumber,
            streetAddress,
            zipCode,
            serviceProvisionMethod,
            serviceCategories,
            subscriptionPlan,
            onboardingComplete: true,
            idVerificationStatus: 'not-submitted',
          })
          .returning();
        app.logger.info({ userId, profileId: profile.id }, 'Provider profile created');
      }

      return {
        message: 'Provider onboarding completed successfully',
        profile,
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to complete provider onboarding');
      throw error;
    }
  });

  /**
   * POST /api/onboarding/provider/id-upload
   * Provider ID document upload endpoint
   * Accepts multipart form data with idDocument file
   * Stores the document and marks verification status as pending-approval
   */
  app.fastify.post('/api/onboarding/provider/id-upload', async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<{ message: string; profile: any; verificationStatus: string } | void> => {
    const session = await requireAuth(request, reply);
    if (!session) return;

    const { userId } = session.user;

    app.logger.info({ userId }, 'Provider ID upload started');

    try {
      // Get the multipart data
      const data = await request.file({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

      if (!data) {
        app.logger.warn({ userId }, 'No file provided for ID upload');
        return reply.status(400).send({ error: 'No file provided' });
      }

      let buffer: Buffer;
      try {
        buffer = await data.toBuffer();
      } catch (err) {
        app.logger.warn({ userId, filename: data.filename }, 'File size exceeds limit');
        return reply.status(413).send({ error: 'File too large (maximum 10MB)' });
      }

      // Validate file type (allow only images and PDFs)
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedMimeTypes.includes(data.mimetype)) {
        app.logger.warn({ userId, mimetype: data.mimetype }, 'Invalid file type for ID upload');
        return reply.status(400).send({
          error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or PDF file.',
        });
      }

      // Generate unique key for storage
      const timestamp = Date.now();
      const key = `id-documents/${userId}/${timestamp}-${data.filename}`;

      // Upload to storage
      const uploadedKey = await app.storage.upload(key, buffer);
      app.logger.info({ userId, key: uploadedKey }, 'ID document uploaded to storage');

      // Generate signed URL for the document
      const { url } = await app.storage.getSignedUrl(uploadedKey);

      // Check if provider profile exists
      const existingProfile = await app.db
        .select()
        .from(schema.providerProfiles)
        .where(eq(schema.providerProfiles.userId, userId));

      if (existingProfile.length === 0) {
        app.logger.warn({ userId }, 'Provider profile not found for ID upload');
        return reply.status(404).send({ error: 'Provider profile not found. Please complete provider onboarding first.' });
      }

      // Update profile with ID document info and set verification status to pending
      const [profile] = await app.db
        .update(schema.providerProfiles)
        .set({
          idDocumentUrl: url,
          idDocumentKey: uploadedKey,
          idVerificationStatus: 'pending-approval',
          updatedAt: new Date(),
        })
        .where(eq(schema.providerProfiles.userId, userId))
        .returning();

      app.logger.info(
        { userId, profileId: profile.id, verificationStatus: 'pending-approval' },
        'ID document uploaded and verification status updated'
      );

      return {
        message: 'ID document uploaded successfully',
        profile,
        verificationStatus: 'pending-approval',
      };
    } catch (error) {
      app.logger.error({ err: error, userId }, 'Failed to upload ID document');
      throw error;
    }
  });
}
