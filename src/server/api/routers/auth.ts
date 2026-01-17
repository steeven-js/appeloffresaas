import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { registerSchema } from "~/lib/validations/auth";

/**
 * Auth router for user registration
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
});
