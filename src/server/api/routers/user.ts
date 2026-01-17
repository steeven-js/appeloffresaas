import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { headers } from "next/headers";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { emailSchema } from "~/lib/validations/auth";

// Token expiry time: 1 hour
const EMAIL_CHANGE_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Get base URL for email links
 */
async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${protocol}://${host}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * User router for profile management
 */
export const userRouter = createTRPCRouter({
  /**
   * Get current user profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { eq } = await import("drizzle-orm");
    const { users } = await import("~/server/db/schema");

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Utilisateur non trouvé",
      });
    }

    return user;
  }),

  /**
   * Update user profile (name only)
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { eq } = await import("drizzle-orm");
      const { users } = await import("~/server/db/schema");

      await ctx.db
        .update(users)
        .set({
          name: input.name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.session.user.id));

      return { success: true };
    }),

  /**
   * Request email change - sends verification email to new address
   */
  requestEmailChange: protectedProcedure
    .input(
      z.object({
        newEmail: emailSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { newEmail } = input;

      const { eq } = await import("drizzle-orm");
      const { users, emailChangeTokens } = await import("~/server/db/schema");
      const { sendEmailChangeVerification } = await import(
        "~/server/services/email/resend"
      );

      // Check if new email is same as current
      if (newEmail === ctx.session.user.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La nouvelle adresse email doit être différente",
        });
      }

      // Check if new email is already used by another user
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, newEmail),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cette adresse email est déjà utilisée",
        });
      }

      // Delete any existing email change tokens for this user
      await ctx.db
        .delete(emailChangeTokens)
        .where(eq(emailChangeTokens.userId, ctx.session.user.id));

      // Generate secure token
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + EMAIL_CHANGE_EXPIRY_MS);

      // Store token with new email
      await ctx.db.insert(emailChangeTokens).values({
        userId: ctx.session.user.id,
        newEmail,
        token,
        expires,
      });

      // Send verification email to new address
      try {
        const baseUrl = await getBaseUrl();
        const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
        await sendEmailChangeVerification(newEmail, verifyUrl);
      } catch (error) {
        console.error("Failed to send email change verification:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Impossible d'envoyer l'email de vérification",
        });
      }

      return { success: true };
    }),

  /**
   * Verify email change with token
   */
  verifyEmailChange: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token invalide"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { token } = input;

      const { eq, and, gt } = await import("drizzle-orm");
      const { users, emailChangeTokens, sessions } = await import(
        "~/server/db/schema"
      );

      // Find valid token (not expired)
      const changeToken = await ctx.db.query.emailChangeTokens.findFirst({
        where: and(
          eq(emailChangeTokens.token, token),
          gt(emailChangeTokens.expires, new Date())
        ),
      });

      if (!changeToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Ce lien de vérification est invalide ou a expiré. Veuillez en demander un nouveau.",
        });
      }

      // Check if new email is still available
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, changeToken.newEmail),
      });

      if (existingUser) {
        // Delete the token since it's no longer valid
        await ctx.db
          .delete(emailChangeTokens)
          .where(eq(emailChangeTokens.id, changeToken.id));

        throw new TRPCError({
          code: "CONFLICT",
          message: "Cette adresse email est maintenant utilisée par un autre compte",
        });
      }

      // Update user email
      await ctx.db
        .update(users)
        .set({
          email: changeToken.newEmail,
          emailVerified: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, changeToken.userId));

      // Invalidate all existing sessions for this user (force re-login)
      await ctx.db
        .delete(sessions)
        .where(eq(sessions.userId, changeToken.userId));

      // Delete used token
      await ctx.db
        .delete(emailChangeTokens)
        .where(eq(emailChangeTokens.id, changeToken.id));

      return { success: true, newEmail: changeToken.newEmail };
    }),
});
