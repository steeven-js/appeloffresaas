# Structure des Fichiers - Wizard de Rédaction

**Date:** 2026-01-18

---

## 1. Fichiers à Créer

```
src/
├── components/
│   └── wizard/
│       ├── wizard-container.tsx        # Container principal du wizard
│       ├── wizard-sidebar.tsx          # Navigation modules
│       ├── wizard-progress-bar.tsx     # Barre de progression
│       ├── wizard-question.tsx         # Rendu d'une question
│       ├── wizard-preview.tsx          # Preview temps réel
│       ├── wizard-module-complete.tsx  # Modal validation fin de module
│       ├── wizard-answer-card.tsx      # Card réponse validée
│       ├── questions/
│       │   ├── question-text.tsx       # Input texte simple
│       │   ├── question-textarea.tsx   # Textarea avec hints
│       │   ├── question-radio.tsx      # Choix unique
│       │   ├── question-checkbox.tsx   # Choix multiples
│       │   ├── question-select.tsx     # Select avec option "Autre"
│       │   ├── question-number.tsx     # Input numérique
│       │   └── question-date.tsx       # Sélecteur date
│       └── index.ts                    # Exports
│
├── lib/
│   └── wizard/
│       ├── wizard-config.ts            # Configuration des modules/questions
│       ├── wizard-types.ts             # Types TypeScript
│       ├── wizard-prompts.ts           # Prompts IA par module
│       ├── wizard-utils.ts             # Utilitaires (calcul progression, etc.)
│       └── index.ts
│
├── hooks/
│   └── use-wizard.ts                   # Hook principal gestion wizard
│
└── server/
    └── api/
        └── routers/
            └── wizard.ts               # Router tRPC pour le wizard
```

---

## 2. Fichiers à Modifier

### 2.1 Schema DB (`src/server/db/schema.ts`)

```typescript
// AJOUTER au schema demandProjects:

export const demandProjects = createTable("demand_project", {
  // ... champs existants ...

  // NOUVEAU: État du Wizard
  wizardState: json("wizard_state").$type<{
    currentModule: number;
    currentQuestion: number;
    startedAt: string;
    lastActivityAt: string;
    modules: Record<string, {
      status: "pending" | "in_progress" | "completed";
      startedAt?: string;
      completedAt?: string;
      validatedAt?: string;
      answeredQuestions: string[];
    }>;
  }>(),

  // NOUVEAU: Mode d'interaction
  interactionMode: varchar("interaction_mode", { length: 20 })
    .default("wizard"), // "wizard" | "chat" | "manual"
});

// MODIFIER le type DemandSection:
export interface DemandSection {
  id: string;
  title: string;
  content: string;
  isDefault: boolean;
  isRequired: boolean;
  order: number;
  // NOUVEAU:
  answers?: Array<{
    questionId: string;
    questionLabel: string;
    value: string | string[] | number | boolean;
    answeredAt: string;
  }>;
  generatedAt?: string;
  validatedAt?: string;
  generationCount?: number;
}
```

### 2.2 Router Projets (`src/server/api/routers/demandProjects.ts`)

```typescript
// AJOUTER ces nouvelles procédures:

// Sauvegarder une réponse wizard
saveWizardAnswer: protectedProcedure
  .input(z.object({
    projectId: z.string(),
    moduleId: z.string(),
    questionId: z.string(),
    questionLabel: z.string(),
    value: z.union([z.string(), z.array(z.string()), z.number(), z.boolean()]),
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Vérifier ownership
    // 2. Mettre à jour sections[moduleId].answers[]
    // 3. Mettre à jour wizardState
    // 4. Retourner le projet mis à jour
  }),

// Générer le texte d'un module
generateModuleContent: protectedProcedure
  .input(z.object({
    projectId: z.string(),
    moduleId: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Récupérer les answers du module
    // 2. Charger le prompt d'assemblage
    // 3. Appeler l'IA
    // 4. Retourner le texte généré (sans sauvegarder)
  }),

// Valider un module
validateModule: protectedProcedure
  .input(z.object({
    projectId: z.string(),
    moduleId: z.string(),
    content: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Sauvegarder content dans sections[moduleId].content
    // 2. Mettre à jour wizardState.modules[moduleId].status = "completed"
    // 3. Incrémenter generationCount si régénération
    // 4. Retourner le projet mis à jour
  }),

// Obtenir l'état courant du wizard
getWizardState: protectedProcedure
  .input(z.object({ projectId: z.string() }))
  .query(async ({ ctx, input }) => {
    // Retourner wizardState + sections avec answers
  }),
```

### 2.3 Page Demande (`src/app/(auth)/demandes/[id]/page.tsx`)

```typescript
// MODIFIER pour supporter le mode wizard:

export default function DemandPage({ params, searchParams }) {
  const mode = searchParams.mode || "workspace"; // "wizard" | "workspace" | "chat"

  return (
    <>
      {mode === "wizard" && <WizardContainer projectId={params.id} />}
      {mode === "workspace" && <DemandWorkspaceV2 projectId={params.id} />}
      {mode === "chat" && <DemandChatPanel projectId={params.id} />}
    </>
  );
}
```

### 2.4 Dialog Création (`src/components/demands/create-demand-dialog.tsx`)

```typescript
// MODIFIER pour proposer le mode wizard:

// Après création, rediriger vers:
router.push(`/demandes/${newProject.id}?mode=wizard`);

// OU ajouter un choix:
// "Comment souhaitez-vous rédiger votre dossier ?"
// - Mode guidé (recommandé) → ?mode=wizard
// - Mode libre → ?mode=workspace
```

---

## 3. Nouveau Router Wizard

```typescript
// src/server/api/routers/wizard.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { demandProjects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getWizardConfig } from "~/lib/wizard/wizard-config";
import { generateModuleText } from "~/lib/wizard/wizard-prompts";

export const wizardRouter = createTRPCRouter({

  // Obtenir la configuration du wizard (modules, questions)
  getConfig: protectedProcedure
    .input(z.object({
      needType: z.string().optional(),
    }))
    .query(({ input }) => {
      return getWizardConfig(input.needType);
    }),

  // Sauvegarder une réponse
  saveAnswer: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      questionId: z.string(),
      questionLabel: z.string(),
      value: z.union([
        z.string(),
        z.array(z.string()),
        z.number(),
        z.boolean(),
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
      });

      if (!project || project.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Mise à jour des sections avec la nouvelle réponse
      const sections = (project.sections ?? []) as DemandSection[];
      const sectionIndex = sections.findIndex(s => s.id === input.moduleId);

      const newAnswer = {
        questionId: input.questionId,
        questionLabel: input.questionLabel,
        value: input.value,
        answeredAt: new Date().toISOString(),
      };

      if (sectionIndex >= 0) {
        const section = sections[sectionIndex];
        const answers = section.answers ?? [];
        const answerIndex = answers.findIndex(a => a.questionId === input.questionId);

        if (answerIndex >= 0) {
          answers[answerIndex] = newAnswer;
        } else {
          answers.push(newAnswer);
        }

        sections[sectionIndex] = { ...section, answers };
      } else {
        // Créer la section si elle n'existe pas
        sections.push({
          id: input.moduleId,
          title: input.moduleId, // Sera mis à jour
          content: "",
          isDefault: true,
          isRequired: true,
          order: sections.length,
          answers: [newAnswer],
          generationCount: 0,
        });
      }

      // Mise à jour du wizardState
      const wizardState = project.wizardState ?? {
        currentModule: 0,
        currentQuestion: 0,
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        modules: {},
      };

      if (!wizardState.modules[input.moduleId]) {
        wizardState.modules[input.moduleId] = {
          status: "in_progress",
          startedAt: new Date().toISOString(),
          answeredQuestions: [],
        };
      }

      if (!wizardState.modules[input.moduleId].answeredQuestions.includes(input.questionId)) {
        wizardState.modules[input.moduleId].answeredQuestions.push(input.questionId);
      }

      wizardState.lastActivityAt = new Date().toISOString();

      // Sauvegarder
      const [updated] = await ctx.db
        .update(demandProjects)
        .set({
          sections,
          wizardState,
          updatedAt: new Date(),
        })
        .where(eq(demandProjects.id, input.projectId))
        .returning();

      return updated;
    }),

  // Générer le texte d'un module (sans sauvegarder)
  generateContent: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
      });

      if (!project || project.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const sections = (project.sections ?? []) as DemandSection[];
      const section = sections.find(s => s.id === input.moduleId);

      if (!section?.answers?.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Aucune réponse à assembler",
        });
      }

      // Générer le texte via IA
      const generatedText = await generateModuleText(
        input.moduleId,
        section.answers,
        {
          needType: project.needType,
          departmentName: project.departmentName,
          urgencyLevel: project.urgencyLevel,
        }
      );

      return { content: generatedText };
    }),

  // Valider un module (sauvegarder le contenu final)
  validateModule: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      moduleId: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.demandProjects.findFirst({
        where: eq(demandProjects.id, input.projectId),
      });

      if (!project || project.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const sections = (project.sections ?? []) as DemandSection[];
      const sectionIndex = sections.findIndex(s => s.id === input.moduleId);

      if (sectionIndex >= 0) {
        sections[sectionIndex] = {
          ...sections[sectionIndex],
          content: input.content,
          validatedAt: new Date().toISOString(),
          generationCount: (sections[sectionIndex].generationCount ?? 0) + 1,
        };
      }

      // Mise à jour wizardState
      const wizardState = project.wizardState ?? { modules: {} };
      wizardState.modules[input.moduleId] = {
        ...wizardState.modules[input.moduleId],
        status: "completed",
        completedAt: new Date().toISOString(),
        validatedAt: new Date().toISOString(),
      };

      // Également mettre à jour le champ legacy si applicable
      const legacyFieldMap: Record<string, string> = {
        context: "context",
        description: "description",
        constraints: "constraints",
      };

      const updateData: Record<string, unknown> = {
        sections,
        wizardState,
        updatedAt: new Date(),
      };

      if (legacyFieldMap[input.moduleId]) {
        updateData[legacyFieldMap[input.moduleId]] = input.content;
      }

      const [updated] = await ctx.db
        .update(demandProjects)
        .set(updateData)
        .where(eq(demandProjects.id, input.projectId))
        .returning();

      return updated;
    }),
});
```

---

## 4. Hook Principal

```typescript
// src/hooks/use-wizard.ts

import { useState, useCallback, useMemo } from "react";
import { api } from "~/trpc/react";
import type { WizardModule, WizardState, Answer } from "~/lib/wizard/wizard-types";

interface UseWizardOptions {
  projectId: string;
  needType?: string;
}

export function useWizard({ projectId, needType }: UseWizardOptions) {
  const utils = api.useUtils();

  // Charger la config
  const { data: config } = api.wizard.getConfig.useQuery({ needType });

  // Charger le projet
  const { data: project, isLoading } = api.demandProjects.get.useQuery({ id: projectId });

  // Mutations
  const saveAnswerMutation = api.wizard.saveAnswer.useMutation({
    onSuccess: () => {
      void utils.demandProjects.get.invalidate({ id: projectId });
    },
  });

  const generateContentMutation = api.wizard.generateContent.useMutation();

  const validateModuleMutation = api.wizard.validateModule.useMutation({
    onSuccess: () => {
      void utils.demandProjects.get.invalidate({ id: projectId });
    },
  });

  // État local
  const wizardState = project?.wizardState as WizardState | undefined;
  const sections = project?.sections ?? [];

  // Calculs dérivés
  const currentModuleIndex = wizardState?.currentModule ?? 0;
  const currentModule = config?.modules[currentModuleIndex];

  const moduleProgress = useMemo(() => {
    if (!config || !wizardState) return {};

    return config.modules.reduce((acc, module, index) => {
      const moduleState = wizardState.modules[module.id];
      const totalQuestions = module.questions.length;
      const answeredQuestions = moduleState?.answeredQuestions.length ?? 0;

      acc[module.id] = {
        status: moduleState?.status ?? "pending",
        progress: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
        answered: answeredQuestions,
        total: totalQuestions,
      };

      return acc;
    }, {} as Record<string, { status: string; progress: number; answered: number; total: number }>);
  }, [config, wizardState]);

  const overallProgress = useMemo(() => {
    if (!config) return 0;
    const completed = Object.values(moduleProgress).filter(m => m.status === "completed").length;
    return (completed / config.modules.length) * 100;
  }, [config, moduleProgress]);

  // Actions
  const saveAnswer = useCallback(async (
    moduleId: string,
    questionId: string,
    questionLabel: string,
    value: string | string[] | number | boolean
  ) => {
    return saveAnswerMutation.mutateAsync({
      projectId,
      moduleId,
      questionId,
      questionLabel,
      value,
    });
  }, [projectId, saveAnswerMutation]);

  const generateContent = useCallback(async (moduleId: string) => {
    return generateContentMutation.mutateAsync({
      projectId,
      moduleId,
    });
  }, [projectId, generateContentMutation]);

  const validateModule = useCallback(async (moduleId: string, content: string) => {
    return validateModuleMutation.mutateAsync({
      projectId,
      moduleId,
      content,
    });
  }, [projectId, validateModuleMutation]);

  const getModuleAnswers = useCallback((moduleId: string): Answer[] => {
    const section = sections.find(s => s.id === moduleId);
    return section?.answers ?? [];
  }, [sections]);

  return {
    // Data
    config,
    project,
    wizardState,
    sections,
    currentModule,
    currentModuleIndex,
    moduleProgress,
    overallProgress,
    isLoading,

    // Actions
    saveAnswer,
    generateContent,
    validateModule,
    getModuleAnswers,

    // Mutation states
    isSaving: saveAnswerMutation.isPending,
    isGenerating: generateContentMutation.isPending,
    isValidating: validateModuleMutation.isPending,
  };
}
```

---

## 5. Ordre d'Implémentation Recommandé

```
Phase 1: Foundation (Backend)
├─ 1.1 Modifier schema.ts (wizardState, answers)
├─ 1.2 Créer wizard-types.ts
├─ 1.3 Créer wizard-config.ts (structure modules/questions)
├─ 1.4 Créer wizard.ts router
└─ 1.5 Ajouter au root router

Phase 2: Core UI
├─ 2.1 Créer wizard-container.tsx
├─ 2.2 Créer wizard-sidebar.tsx
├─ 2.3 Créer wizard-progress-bar.tsx
├─ 2.4 Créer wizard-question.tsx
└─ 2.5 Créer use-wizard.ts hook

Phase 3: Question Components
├─ 3.1 question-text.tsx
├─ 3.2 question-textarea.tsx
├─ 3.3 question-radio.tsx
├─ 3.4 question-checkbox.tsx
├─ 3.5 question-select.tsx
├─ 3.6 question-number.tsx
└─ 3.7 question-date.tsx

Phase 4: Preview & Validation
├─ 4.1 wizard-preview.tsx
├─ 4.2 wizard-answer-card.tsx
├─ 4.3 wizard-module-complete.tsx
└─ 4.4 wizard-prompts.ts (prompts IA)

Phase 5: Integration
├─ 5.1 Modifier page demandes/[id]
├─ 5.2 Modifier create-demand-dialog
├─ 5.3 Tests E2E
└─ 5.4 Polish & bugfixes
```

---

*Document généré lors de la session de brainstorming du 2026-01-18*
