import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client - serverless, REST-based
 *
 * Required env vars for runtime:
 * - UPSTASH_REDIS_REST_URL: Redis REST API endpoint
 * - UPSTASH_REDIS_REST_TOKEN: API authentication token
 *
 * Setup: https://console.upstash.com → Create Redis database → REST API tab
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});
