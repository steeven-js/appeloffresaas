/**
 * Wizard Types - Type definitions for the guided wizard
 */

// Re-export types from schema for convenience
export type {
  WizardState,
  WizardModuleState,
  WizardAnswer,
  InteractionMode,
} from "~/server/db/schema/demands";

export { INTERACTION_MODES } from "~/server/db/schema/demands";

/**
 * Base question interface
 */
interface BaseQuestion {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
}

/**
 * Text input question
 */
export interface TextQuestion extends BaseQuestion {
  type: "text";
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

/**
 * Textarea question
 */
export interface TextareaQuestion extends BaseQuestion {
  type: "textarea";
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  /** Show AI assistant panel by default instead of plain textarea */
  showAIByDefault?: boolean;
}

/**
 * Radio option
 */
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * Radio question (single choice)
 */
export interface RadioQuestion extends BaseQuestion {
  type: "radio";
  options: RadioOption[];
  allowOther?: boolean;
}

/**
 * Checkbox option
 */
export interface CheckboxOption {
  value: string;
  label: string;
}

/**
 * Checkbox question (multiple choice)
 */
export interface CheckboxQuestion extends BaseQuestion {
  type: "checkbox";
  options: CheckboxOption[];
  minSelect?: number;
  maxSelect?: number;
  allowOther?: boolean;
  /** Show AI assistant panel by default with options as context */
  showAIByDefault?: boolean;
}

/**
 * Select or text question (dropdown with free text option)
 */
export interface SelectOrTextQuestion extends BaseQuestion {
  type: "select_or_text";
  options: string[];
  placeholder?: string;
}

/**
 * Number question
 */
export interface NumberQuestion extends BaseQuestion {
  type: "number";
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  suggestions?: number[];
}

/**
 * Date question
 */
export interface DateQuestion extends BaseQuestion {
  type: "date";
  minDate?: string; // "today" or ISO date string
  maxDate?: string;
}

/**
 * Union type for all question types
 */
export type WizardQuestion =
  | TextQuestion
  | TextareaQuestion
  | RadioQuestion
  | CheckboxQuestion
  | SelectOrTextQuestion
  | NumberQuestion
  | DateQuestion;

/**
 * Question type discriminator
 */
export type QuestionType = WizardQuestion["type"];

/**
 * Conditional question configuration
 */
export interface ConditionalQuestions {
  condition: {
    questionId: string;
    operator: "equals" | "contains" | "not_equals";
    value: string | string[];
  };
  questions: WizardQuestion[];
}

/**
 * Module configuration
 */
export interface WizardModule {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  questions: WizardQuestion[];
  conditionalQuestions?: ConditionalQuestions[];
  assemblePrompt?: string;
}

/**
 * Complete wizard configuration
 */
export interface WizardConfig {
  modules: WizardModule[];
  version: string;
}

/**
 * Module progress information
 */
export interface ModuleProgress {
  status: "pending" | "in_progress" | "completed";
  progress: number; // 0-100
  answered: number;
  total: number;
}

/**
 * Answer value types
 */
export type AnswerValue = string | string[] | number | boolean;

/**
 * Generate content result
 */
export interface GenerateContentResult {
  content: string;
}
