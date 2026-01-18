export {
  openai,
  isOpenAIConfigured,
  analyzeDocumentForExpiryDate,
  type DocumentAnalysisResult,
} from "./openai";

export {
  isAIConfigured,
  getConfiguredProvider,
  getProviderDisplayName,
  isProviderAvailable,
  createCompletion,
  createCompletionWithProvider,
  type AIProvider,
  type AIMessage,
  type CompletionOptions,
  type CompletionResponse,
} from "./ai-provider";

export {
  isAssistantConfigured,
  getAssistantProviderInfo,
  sendMessageToAssistant,
  generateGreetingMessage,
  generateSectionDraft,
  reformulateText,
  generateFollowUpQuestions,
  extractDocumentInfo,
  generateSuggestedCriteria,
  type ChatMessage,
  type AssistantResponse,
  type GeneratableSection,
  type FollowUpQuestion,
  type ExtractedDocumentInfo,
  type SuggestedCriterion,
  type SuggestedCriteriaResponse,
} from "./demand-assistant";
