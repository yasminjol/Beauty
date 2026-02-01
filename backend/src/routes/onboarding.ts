import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';

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
   * POST /api/onboarding/client
   * Client onboarding endpoint
   * Required fields: name (in user), preferredCategories, preferredDistanceMin, preferredDistanceMax, preferredPriceMin, preferredPriceMax
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
      preferredCategories?: typeof schema.SERVICE_CATEGORIES[number][];
      preferredDistanceMin?: number;
      preferredDistanceMax?: number;
      preferredPriceMin?: number;
      preferredPriceMax?: number;
    };
    const { preferredCategories, preferredDistanceMin, preferredDistanceMax, preferredPriceMin, preferredPriceMax } = body;

    app.logger.info(
      {
        userId,
        preferredCategories,
        preferredDistanceMin,
        preferredDistanceMax,
        preferredPriceMin,
        preferredPriceMax,
      },
      'Client onboarding started'
    );

    try {
      // Validate categories
      if (!Array.isArray(preferredCategories) || preferredCategories.length === 0) {
        app.logger.warn({ userId }, 'Client onboarding failed: no categories selected');
        return reply.status(400).send({ error: 'At least one service category must be selected' });
      }

      // Validate that all selected categories are valid
      const validCategories = schema.SERVICE_CATEGORIES;
      const invalidCategories = preferredCategories.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        app.logger.warn({ userId, invalidCategories }, 'Invalid categories provided');
        return reply.status(400).send({ error: 'Invalid service categories provided' });
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
            preferredCategories,
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
            preferredCategories,
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
   * Required fields: name (in user), businessName, serviceAddress, serviceCategories (max 2 for free plan)
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
      businessName?: string;
      serviceAddress?: string;
      serviceCategories?: typeof schema.SERVICE_CATEGORIES[number][];
      subscriptionPlan?: 'free' | 'premium';
    };
    const { businessName, serviceAddress, serviceCategories, subscriptionPlan = 'free' } = body;

    app.logger.info(
      {
        userId,
        businessName,
        serviceAddress,
        serviceCategories,
        subscriptionPlan,
      },
      'Provider onboarding started'
    );

    try {
      // Validate required fields
      if (!businessName || businessName.trim().length === 0) {
        app.logger.warn({ userId }, 'Provider onboarding failed: business name missing');
        return reply.status(400).send({ error: 'Business name is required' });
      }

      if (!serviceAddress || serviceAddress.trim().length === 0) {
        app.logger.warn({ userId }, 'Provider onboarding failed: service address missing');
        return reply.status(400).send({ error: 'Service address is required' });
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
            serviceAddress,
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
            serviceAddress,
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
      const fileExtension = data.filename.split('.').pop();
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
