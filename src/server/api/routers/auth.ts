import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "~/lib/validations/auth";

// Token expiry time: 1 hour
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Get base URL for email links
 */
async function getBaseUrl(): Promise<string> {
  // Try to get host from request headers
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${protocol}://${host}`;
  }

  // Fallback to VERCEL_URL or localhost
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Auth router for user registration and password reset
 * Login is handled by NextAuth Credentials provider
 */
export const authRouter = createTRPCRouter({
  /**
   * Register a new user with email and password
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input;

      // Dynamic import to avoid circular dependency
      const { hash } = await import("bcryptjs");
      const { eq } = await import("drizzle-orm");
      const { users } = await import("~/server/db/schema");

      // Check if email already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cette adresse email est déjà utilisée",
        });
      }

      // Hash password with bcrypt (cost factor 12)
      const hashedPassword = await hash(password, 12);

      // Create user
      const [newUser] = await ctx.db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          name: name ?? null,
        })
        .returning({ id: users.id, email: users.email });

      if (!newUser) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Une erreur est survenue lors de la création du compte",
        });
      }

      return {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
        },
      };
    }),

  /**
   * Request password reset - sends email with reset link
   * Always returns success to prevent email enumeration
   */
  requestPasswordReset: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      // Dynamic imports to avoid circular dependency
      const { eq } = await import("drizzle-orm");
      const { users, passwordResetTokens } = await import(
        "~/server/db/schema"
      );
      const { sendPasswordResetEmail } = await import(
        "~/server/services/email/resend"
      );

      // Find user by email
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      // Always return success (no email enumeration)
      if (!user) {
        return { success: true };
      }

      // Delete any existing reset tokens for this user
      await ctx.db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, user.id));

      // Generate secure token
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

      // Store token
      await ctx.db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expires,
      });

      // Send reset email
      try {
        const baseUrl = await getBaseUrl();
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;
        await sendPasswordResetEmail(email, resetUrl);
      } catch (error) {
        console.error("Failed to send password reset email:", error);
        // Still return success to prevent email enumeration
      }

      return { success: true };
    }),

  /**
   * Reset password with valid token
   */
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { token, password } = input;

      // Dynamic imports
      const { eq, and, gt } = await import("drizzle-orm");
      const { hash } = await import("bcryptjs");
      const { users, passwordResetTokens, sessions } = await import(
        "~/server/db/schema"
      );

      // Find valid token (not expired)
      const resetToken = await ctx.db.query.passwordResetTokens.findFirst({
        where: and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expires, new Date())
        ),
      });

      if (!resetToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.",
        });
      }

      // Hash new password
      const hashedPassword = await hash(password, 12);

      // Update user password
      await ctx.db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, resetToken.userId));

      // Invalidate all existing sessions for this user
      await ctx.db
        .delete(sessions)
        .where(eq(sessions.userId, resetToken.userId));

      // Delete used token
      await ctx.db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, resetToken.id));

      return { success: true };
    }),
});
