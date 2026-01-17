import { serve } from "inngest/next";
import { inngest } from "~/server/inngest/client";
import { parseRCFunction } from "~/server/inngest/functions/parse-rc";

/**
 * Inngest webhook endpoint (Story 4.1)
 * Handles all background job events
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [parseRCFunction],
});
