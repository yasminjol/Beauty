import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/auth-schema.js';

// Simple in-memory OTP store (in production, use Redis or database)
interface OTPRecord {
  otp: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OTPRecord>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOTPEmail(email: string, otp: string): Promise<void> {
  // In production, integrate with email service (Resend, SendGrid, etc.)
  // For now, log to console
  console.log(`[OTP] Email to ${email}: Your verification code is ${otp}`);
  return Promise.resolve();
}

export function registerOTPRoutes(app: App) {
  /**
   * POST /api/otp/send
   * Sends OTP to the provided email
   * Body: { email: string }
   */
  app.fastify.post('/api/otp/send', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { email } = request.body as { email?: string };

    if (!email) {
      app.logger.warn('OTP send request without email');
      return reply.status(400).send({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return reply.status(400).send({ error: 'Invalid email format' });
    }

    try {
      // Generate OTP
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store OTP
      otpStore.set(email, {
        otp,
        email,
        expiresAt,
        attempts: 0,
      });

      // Send OTP email
      await sendOTPEmail(email, otp);

      app.logger.info({ email }, 'OTP sent successfully');
      return reply.send({ message: 'OTP sent to email' });
    } catch (error) {
      app.logger.error({ email, error }, 'Failed to send OTP');
      return reply.status(500).send({ error: 'Failed to send OTP' });
    }
  });

  /**
   * POST /api/otp/verify
   * Verifies the OTP code provided by the user
   * Body: { email: string; code: string }
   */
  app.fastify.post('/api/otp/verify', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { email, code } = request.body as { email?: string; code?: string };

    if (!email || !code) {
      app.logger.warn('OTP verify request missing email or code');
      return reply.status(400).send({ error: 'Email and code are required' });
    }

    try {
      // Get stored OTP
      const record = otpStore.get(email);

      if (!record) {
        app.logger.warn({ email }, 'No OTP found for email');
        return reply.status(400).send({ error: 'No OTP found. Please request a new one.' });
      }

      // Check if OTP expired
      if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        app.logger.warn({ email }, 'OTP expired');
        return reply.status(400).send({ error: 'OTP expired. Please request a new one.' });
      }

      // Check attempt limit
      if (record.attempts >= 5) {
        otpStore.delete(email);
        app.logger.warn({ email }, 'Too many failed OTP attempts');
        return reply.status(429).send({ error: 'Too many failed attempts. Please request a new OTP.' });
      }

      // Verify OTP
      if (code !== record.otp) {
        record.attempts += 1;
        app.logger.warn({ email, attempts: record.attempts }, 'Invalid OTP code');
        return reply.status(400).send({ error: 'Invalid OTP code' });
      }

      // OTP verified successfully
      otpStore.delete(email);
      app.logger.info({ email }, 'OTP verified successfully');
      return reply.send({ message: 'OTP verified successfully' });
    } catch (error) {
      app.logger.error({ email, error }, 'Error verifying OTP');
      return reply.status(500).send({ error: 'Failed to verify OTP' });
    }
  });

  /**
   * POST /api/otp/resend
   * Resends OTP to the provided email
   * Body: { email: string }
   */
  app.fastify.post('/api/otp/resend', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { email } = request.body as { email?: string };

    if (!email) {
      return reply.status(400).send({ error: 'Email is required' });
    }

    try {
      // Generate new OTP
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Update OTP record
      otpStore.set(email, {
        otp,
        email,
        expiresAt,
        attempts: 0,
      });

      // Send OTP email
      await sendOTPEmail(email, otp);

      app.logger.info({ email }, 'OTP resent successfully');
      return reply.send({ message: 'OTP resent to email' });
    } catch (error) {
      app.logger.error({ email, error }, 'Failed to resend OTP');
      return reply.status(500).send({ error: 'Failed to resend OTP' });
    }
  });
}
