import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { env } from "~/env";

/**
 * AI Provider types
 */
export type AIProvider = "openai" | "anthropic";

/**
 * Unified message format for both providers
 */
export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Completion options
 */
export interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

/**
 * Completion response
 */
export interface CompletionResponse {
  content: string;
  tokenCount?: number;
  model: string;
  provider: AIProvider;
}

/**
 * OpenAI client instance
 */
const openaiClient = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

/**
 * Anthropic client instance
 */
const anthropicClient = env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  : null;

/**
 * Get the configured AI provider
 */
export function getConfiguredProvider(): AIProvider {
  return env.AI_PROVIDER ?? "openai";
}

/**
 * Check if the AI assistant is configured
 */
export function isAIConfigured(): boolean {
  const provider = getConfiguredProvider();
  if (provider === "anthropic") {
    return !!env.ANTHROPIC_API_KEY;
  }
  return !!env.OPENAI_API_KEY;
}

/**
 * Get the model name for the current provider
 */
function getModelName(provider: AIProvider): string {
  if (provider === "anthropic") {
    return "claude-sonnet-4-20250514";
  }
  return "gpt-4o-mini";
}

/**
 * Create a chat completion using OpenAI
 */
async function createOpenAICompletion(
  messages: AIMessage[],
  options: CompletionOptions
): Promise<CompletionResponse> {
  if (!openaiClient) {
    throw new Error("OpenAI n'est pas configuré. Veuillez configurer OPENAI_API_KEY.");
  }

  const systemMessage = messages.find((m) => m.role === "system");
  const nonSystemMessages = messages.filter((m) => m.role !== "system");

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    ...(systemMessage ? [{ role: "system" as const, content: systemMessage.content }] : []),
    ...nonSystemMessages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  ];

  const response = await openaiClient.chat.completions.create({
    model: getModelName("openai"),
    messages: openaiMessages,
    max_tokens: options.maxTokens ?? 1000,
    temperature: options.temperature ?? 0.7,
    ...(options.jsonMode ? { response_format: { type: "json_object" as const } } : {}),
  });

  return {
    content: response.choices[0]?.message?.content ?? "",
    tokenCount: response.usage?.total_tokens,
    model: response.model,
    provider: "openai",
  };
}

/**
 * Create a chat completion using Anthropic Claude
 */
async function createAnthropicCompletion(
  messages: AIMessage[],
  options: CompletionOptions
): Promise<CompletionResponse> {
  if (!anthropicClient) {
    throw new Error("Anthropic n'est pas configuré. Veuillez configurer ANTHROPIC_API_KEY.");
  }

  const systemMessage = messages.find((m) => m.role === "system");
  const nonSystemMessages = messages.filter((m) => m.role !== "system");

  // Build the user/assistant messages for Claude
  const anthropicMessages: Anthropic.MessageParam[] = nonSystemMessages.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  // Add JSON mode instruction to system message if needed
  let systemPrompt = systemMessage?.content ?? "";
  if (options.jsonMode) {
    systemPrompt += "\n\nIMPORTANT: Tu dois repondre UNIQUEMENT avec un JSON valide, sans texte supplementaire avant ou apres.";
  }

  const response = await anthropicClient.messages.create({
    model: getModelName("anthropic"),
    max_tokens: options.maxTokens ?? 1000,
    system: systemPrompt || undefined,
    messages: anthropicMessages,
  });

  // Extract text content from Claude response
  const textContent = response.content.find((c) => c.type === "text");
  const content = textContent?.type === "text" ? textContent.text : "";

  return {
    content,
    tokenCount: response.usage.input_tokens + response.usage.output_tokens,
    model: response.model,
    provider: "anthropic",
  };
}

/**
 * Create a chat completion using the configured provider
 */
export async function createCompletion(
  messages: AIMessage[],
  options: CompletionOptions = {}
): Promise<CompletionResponse> {
  const provider = getConfiguredProvider();

  if (provider === "anthropic") {
    return createAnthropicCompletion(messages, options);
  }
  return createOpenAICompletion(messages, options);
}

/**
 * Create a chat completion with a specific provider (override default)
 */
export async function createCompletionWithProvider(
  provider: AIProvider,
  messages: AIMessage[],
  options: CompletionOptions = {}
): Promise<CompletionResponse> {
  if (provider === "anthropic") {
    return createAnthropicCompletion(messages, options);
  }
  return createOpenAICompletion(messages, options);
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: AIProvider): string {
  return provider === "anthropic" ? "Claude (Anthropic)" : "GPT-4o (OpenAI)";
}

/**
 * Check if a specific provider is available
 */
export function isProviderAvailable(provider: AIProvider): boolean {
  if (provider === "anthropic") {
    return !!env.ANTHROPIC_API_KEY;
  }
  return !!env.OPENAI_API_KEY;
}
