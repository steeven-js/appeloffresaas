import { serve } from "inngest/next";
import { inngest } from "~/server/inngest/client";

/**
 * Inngest webhook endpoint
 * Handles all background job events
 * Note: Functions will be added as features are implemented
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [],
});
