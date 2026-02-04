import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';
import { emailOTP } from 'better-auth/plugins';
import { registerOnboardingRoutes } from './routes/onboarding.js';

// Combine schemas for full database type support
const schema = { ...appSchema, ...authSchema };

// Create application with combined schema
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Enable authentication with OTP support for mandatory OTP verification
app.withAuth({
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        // Log OTP for development - in production use actual email service
        app.logger.info({ email, otp, type }, 'OTP verification code');
        // Email sending would go here via resend service
      },
    }),
  ],
});

// Enable storage for ID document uploads
app.withStorage();

// Register routes - add your route modules here
// IMPORTANT: Always use registration functions to avoid circular dependency issues
registerOnboardingRoutes(app);

await app.run();
app.logger.info('Application running');
