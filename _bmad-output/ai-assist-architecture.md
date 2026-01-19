# Architecture Technique - Assistant IA pour Réponses Longues

**Date:** 2026-01-18
**Version:** MVP 1.0
**Source:** Brainstorming Session

---

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │  WizardQuestion │  │  AIChatPanel    │  │  PreviewPanel               │ │
│  │  (container)    │  │  (conversation) │  │  (texte généré)             │ │
│  └────────┬────────┘  └────────┬────────┘  └──────────────┬──────────────┘ │
│           │                    │                          │                 │
│           └────────────────────┼──────────────────────────┘                 │
│                                │                                            │
│                    ┌───────────┴───────────┐                               │
│                    │   useAIAssistant()    │  ← Custom Hook                │
│                    └───────────┬───────────┘                               │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │      tRPC Client        │
                    └────────────┬────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────────────┐
│                              BACKEND                                        │
│                    ┌───────────┴───────────┐                               │
│                    │   aiAssistant Router  │                               │
│                    └───────────┬───────────┘                               │
│                                │                                            │
│           ┌────────────────────┼────────────────────┐                      │
│           │                    │                    │                      │
│  ┌────────┴────────┐  ┌───────┴───────┐  ┌────────┴────────┐              │
│  │ generateQuestion│  │ processAnswer │  │ generateText   │              │
│  └────────┬────────┘  └───────┬───────┘  └────────┬────────┘              │
│           │                   │                   │                        │
│           └───────────────────┼───────────────────┘                        │
│                               │                                            │
│                    ┌──────────┴──────────┐                                 │
│                    │   AI Provider       │  (Claude API)                   │
│                    └──────────┬──────────┘                                 │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │      Database         │
                    │  (conversations,      │
                    │   sections, answers)  │
                    └───────────────────────┘
```

---

## Nouveaux Composants Frontend

### 1. AIChatPanel

```typescript
// src/components/wizard/ai-chat-panel.tsx

interface AIChatPanelProps {
  projectId: string;
  moduleId: string;
  questionId: string;
  mode: "guided" | "expert";
  context: AIContext;
  onTextGenerated: (text: string) => void;
  onValidate: () => void;
}

interface AIContext {
  title: string;
  departmentName: string;
  needType: string;
  urgencyLevel: string;
  previousAnswers: Record<string, AnswerValue>;
}

export function AIChatPanel({
  projectId,
  moduleId,
  questionId,
  mode,
  context,
  onTextGenerated,
  onValidate,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ... implementation
}
```

### 2. AIMessageBubble

```typescript
// src/components/wizard/ai-message-bubble.tsx

interface AIMessageBubbleProps {
  message: AIMessage;
  onOptionSelect?: (option: string) => void;
  onValidate?: () => void;
  onModify?: () => void;
}

interface AIMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  type: "question" | "response" | "validation" | "suggestion";
  options?: AIOption[];
  generatedText?: string;
  timestamp: Date;
}

interface AIOption {
  id: string;
  label: string;
  value: string;
}
```

### 3. ModeSwitch

```typescript
// src/components/wizard/mode-switch.tsx

interface ModeSwitchProps {
  mode: "guided" | "expert";
  onChange: (mode: "guided" | "expert") => void;
  disabled?: boolean;
}

export function ModeSwitch({ mode, onChange, disabled }: ModeSwitchProps) {
  return (
    <div className="flex rounded-lg bg-muted p-1">
      <button
        className={cn(
          "px-4 py-2 rounded-md transition-colors",
          mode === "guided" && "bg-background shadow"
        )}
        onClick={() => onChange("guided")}
        disabled={disabled}
      >
        💬 Guidé
      </button>
      <button
        className={cn(
          "px-4 py-2 rounded-md transition-colors",
          mode === "expert" && "bg-background shadow"
        )}
        onClick={() => onChange("expert")}
        disabled={disabled}
      >
        📝 Expert
      </button>
    </div>
  );
}
```

---

## Custom Hook: useAIAssistant

```typescript
// src/hooks/use-ai-assistant.ts

interface UseAIAssistantOptions {
  projectId: string;
  moduleId: string;
  questionId: string;
  context: AIContext;
}

interface UseAIAssistantReturn {
  // State
  messages: AIMessage[];
  generatedText: string;
  isLoading: boolean;
  mode: "guided" | "expert";

  // Actions
  setMode: (mode: "guided" | "expert") => void;
  sendMessage: (content: string) => Promise<void>;
  selectOption: (optionId: string) => Promise<void>;
  validateResponse: () => Promise<void>;
  modifyResponse: () => void;
  applySuggestion: (suggestionId: string) => Promise<void>;
  finishConversation: () => Promise<void>;
  askQuestion: (question: string) => Promise<void>;

  // Suggestions (Mode Expert)
  suggestions: AISuggestion[];
  missingPoints: string[];
  strengths: string[];
}

export function useAIAssistant({
  projectId,
  moduleId,
  questionId,
  context,
}: UseAIAssistantOptions): UseAIAssistantReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [generatedText, setGeneratedText] = useState("");
  const [mode, setMode] = useState<"guided" | "expert">("guided");

  const utils = api.useUtils();

  // Initialize conversation with first AI question
  const initMutation = api.aiAssistant.initConversation.useMutation();

  // Process user response
  const respondMutation = api.aiAssistant.processResponse.useMutation();

  // Generate suggestion text
  const suggestMutation = api.aiAssistant.generateSuggestion.useMutation();

  // Analyze text (Mode Expert)
  const analyzeMutation = api.aiAssistant.analyzeText.useMutation();

  // ... implementation
}
```

---

## tRPC Router: aiAssistant

```typescript
// src/server/api/routers/aiAssistant.ts

export const aiAssistantRouter = createTRPCRouter({
  /**
   * Initialize conversation with first AI question
   */
  initConversation: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      questionId: z.string(),
      context: z.object({
        title: z.string(),
        departmentName: z.string().optional(),
        needType: z.string().optional(),
        urgencyLevel: z.string().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      // Build prompt with context
      const prompt = buildInitialPrompt(input);

      // Generate first question via AI
      const response = await generateAIResponse(prompt);

      // Parse response for question + options + example
      const parsed = parseAIResponse(response);

      // Save to conversation history
      await saveConversationMessage(ctx, input.projectId, {
        role: "assistant",
        content: parsed.question,
        options: parsed.options,
        example: parsed.example,
      });

      return parsed;
    }),

  /**
   * Process user response and generate next question
   */
  processResponse: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      questionId: z.string(),
      userResponse: z.string(),
      conversationHistory: z.array(z.object({
        role: z.enum(["assistant", "user"]),
        content: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // Build prompt with conversation history
      const prompt = buildResponsePrompt(input);

      // Generate integrated text + next question
      const response = await generateAIResponse(prompt);

      // Parse response
      const parsed = parseAIResponse(response);

      // Save messages
      await saveConversationMessage(ctx, input.projectId, {
        role: "user",
        content: input.userResponse,
      });
      await saveConversationMessage(ctx, input.projectId, {
        role: "assistant",
        content: parsed.question,
        generatedText: parsed.integratedText,
      });

      return {
        integratedText: parsed.integratedText,
        nextQuestion: parsed.question,
        options: parsed.options,
        isComplete: parsed.isComplete,
      };
    }),

  /**
   * Generate suggestion text (Mode Expert)
   */
  generateSuggestion: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      suggestionType: z.string(),
      currentText: z.string(),
      context: z.object({...}),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = buildSuggestionPrompt(input);
      const response = await generateAIResponse(prompt);

      return {
        insertedText: response.text,
        position: response.position, // "append" | "inline" | index
      };
    }),

  /**
   * Analyze text in real-time (Mode Expert)
   */
  analyzeText: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      currentText: z.string(),
      context: z.object({...}),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = buildAnalysisPrompt(input);
      const response = await generateAIResponse(prompt);

      return {
        strengths: response.strengths,
        suggestions: response.suggestions,
        missingPoints: response.missingPoints,
      };
    }),

  /**
   * User asks a question to AI
   */
  askQuestion: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      question: z.string(),
      currentText: z.string(),
      context: z.object({...}),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = buildUserQuestionPrompt(input);
      const response = await generateAIResponse(prompt);

      return {
        answer: response.answer,
        suggestion: response.suggestion,
      };
    }),
});
```

---

## Schema Database

### Nouvelle table: ai_conversations

```typescript
// src/server/db/schema/aiConversations.ts

export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => demandProjects.id),
  moduleId: varchar("module_id", { length: 50 }).notNull(),
  questionId: varchar("question_id", { length: 50 }).notNull(),

  messages: jsonb("messages").$type<AIMessage[]>().default([]),
  generatedText: text("generated_text"),

  mode: varchar("mode", { length: 10 }).default("guided"), // "guided" | "expert"
  status: varchar("status", { length: 20 }).default("active"), // "active" | "completed"

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Extension: demandProjects

```typescript
// Ajouter au schema existant

export const demandProjects = pgTable("demand_projects", {
  // ... existing fields ...

  // Nouveau: préférences IA par utilisateur
  aiPreferences: jsonb("ai_preferences").$type<{
    defaultMode: "guided" | "expert";
    showExamples: boolean;
    autoSuggestions: boolean;
  }>().default({
    defaultMode: "guided",
    showExamples: true,
    autoSuggestions: true,
  }),
});
```

---

## Flux de Données

### Mode Guidé - Séquence

```
1. User entre dans question longue
   │
   ▼
2. useAIAssistant.initConversation()
   │ → POST /api/trpc/aiAssistant.initConversation
   │ → AI génère première question contextuelle
   │
   ▼
3. UI affiche question + options + exemple
   │
   ▼
4. User répond (texte ou sélection)
   │
   ▼
5. useAIAssistant.processResponse()
   │ → POST /api/trpc/aiAssistant.processResponse
   │ → AI intègre réponse dans texte + génère question suivante
   │
   ▼
6. UI affiche texte intégré + boutons Valider/Modifier
   │
   ▼
7. User valide
   │ → Save section.content
   │ → Update preview
   │
   ▼
8. Loop → étape 3 (ou fin si "C'est bon")
```

### Mode Expert - Séquence

```
1. User entre dans question longue (Mode Expert)
   │
   ▼
2. User tape dans textarea
   │
   ▼
3. Debounce 500ms → useAIAssistant.analyzeText()
   │ → POST /api/trpc/aiAssistant.analyzeText
   │ → AI analyse et retourne strengths/suggestions/missing
   │
   ▼
4. UI affiche analyse en temps réel
   │
   ▼
5. User clique suggestion
   │ → useAIAssistant.generateSuggestion()
   │ → AI génère texte à insérer
   │
   ▼
6. UI insère texte (avec undo possible)
   │
   ▼
7. User valide
   │ → Save section.content
   │ → Update preview
```

---

## Considérations Performance

### Caching

```typescript
// Cache des exemples dynamiques par needType
const examplesCache = new Map<string, string[]>();

// Cache des questions initiales par moduleId
const questionsCache = new Map<string, AIQuestion>();
```

### Debouncing (Mode Expert)

```typescript
// Analyse déclenchée après 500ms d'inactivité
const debouncedAnalyze = useDebouncedCallback(
  (text: string) => analyzeMutation.mutate({ currentText: text }),
  500
);
```

### Streaming (Optionnel MVP+)

```typescript
// Pour réponses longues, utiliser streaming
const response = await ai.messages.stream({
  model: "claude-sonnet-4-20250514",
  messages: [...],
  stream: true,
});

for await (const chunk of response) {
  onChunk(chunk.content);
}
```

---

## Fichiers à Créer

| Fichier | Description |
|---------|-------------|
| `src/components/wizard/ai-chat-panel.tsx` | Panneau conversation IA |
| `src/components/wizard/ai-message-bubble.tsx` | Bulle de message |
| `src/components/wizard/mode-switch.tsx` | Switch Guidé/Expert |
| `src/components/wizard/ai-validation-buttons.tsx` | Boutons Valider/Modifier |
| `src/components/wizard/ai-suggestions-panel.tsx` | Panel suggestions (Expert) |
| `src/hooks/use-ai-assistant.ts` | Hook principal |
| `src/server/api/routers/aiAssistant.ts` | Router tRPC |
| `src/server/db/schema/aiConversations.ts` | Schema DB |
| `src/lib/ai/prompts.ts` | Templates de prompts |
| `src/lib/ai/response-parser.ts` | Parser réponses IA |

