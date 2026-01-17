import { authRouter } from "~/server/api/routers/auth";
import { billingRouter } from "~/server/api/routers/billing";
import { companyFinancialRouter } from "~/server/api/routers/companyFinancial";
import { companyProfileRouter } from "~/server/api/routers/companyProfile";
import { healthRouter } from "~/server/api/routers/health";
import { userRouter } from "~/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  billing: billingRouter,
  companyFinancial: companyFinancialRouter,
  companyProfile: companyProfileRouter,
  health: healthRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.example.hello();
 */
export const createCaller = createCallerFactory(appRouter);
