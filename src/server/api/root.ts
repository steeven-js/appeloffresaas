import { authRouter } from "~/server/api/routers/auth";
import { billingRouter } from "~/server/api/routers/billing";
import { companyCertificationsRouter } from "~/server/api/routers/companyCertifications";
import { companyDocumentsRouter } from "~/server/api/routers/companyDocuments";
import { companyFinancialRouter } from "~/server/api/routers/companyFinancial";
import { companyProfileRouter } from "~/server/api/routers/companyProfile";
import { companyProjectReferencesRouter } from "~/server/api/routers/companyProjectReferences";
import { companyTeamMembersRouter } from "~/server/api/routers/companyTeamMembers";
import { demandChatRouter } from "~/server/api/routers/demandChat";
import { demandDocumentsRouter } from "~/server/api/routers/demandDocuments";
import { demandProjectsRouter } from "~/server/api/routers/demandProjects";
import { healthRouter } from "~/server/api/routers/health";
import { userRouter } from "~/server/api/routers/user";
import { wizardRouter } from "~/server/api/routers/wizard";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  billing: billingRouter,
  companyCertifications: companyCertificationsRouter,
  companyDocuments: companyDocumentsRouter,
  companyFinancial: companyFinancialRouter,
  companyProfile: companyProfileRouter,
  companyProjectReferences: companyProjectReferencesRouter,
  companyTeamMembers: companyTeamMembersRouter,
  demandChat: demandChatRouter,
  demandDocuments: demandDocumentsRouter,
  demandProjects: demandProjectsRouter,
  health: healthRouter,
  user: userRouter,
  wizard: wizardRouter,
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
