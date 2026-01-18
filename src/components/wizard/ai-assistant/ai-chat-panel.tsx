"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, Check, Loader2, RefreshCw } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useAIAssistant } from "~/hooks/use-ai-assistant";

import { ModeSwitch } from "./mode-switch";
import { AIMessageBubble } from "./ai-message-bubble";

interface AIChatPanelProps {
  projectId: string;
  moduleId: string;
  questionId: string;
  questionLabel: string;
  onTextGenerated: (text: string) => void;
  onComplete: () => void;
  /** Suggested options to include in AI context (e.g., checkbox options) */
  suggestedOptions?: string[];
}

export function AIChatPanel({
  projectId,
  moduleId,
  questionId,
  questionLabel,
  onTextGenerated,
  onComplete,
  suggestedOptions,
}: AIChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevGeneratedTextRef = useRef<string>("");
  const onTextGeneratedRef = useRef(onTextGenerated);
  const prevQuestionIdRef = useRef<string>(questionId);
  const hasInitializedRef = useRef(false);

  // Keep callback ref up to date
  useEffect(() => {
    onTextGeneratedRef.current = onTextGenerated;
  }, [onTextGenerated]);

  const {
    messages,
    generatedText,
    mode,
    isComplete,
    isInitialized,
    isLoading,
    completionSuggestions,
    initConversation,
    sendResponse,
    completeConversation,
    applySuggestion,
    setMode,
    saveToSection,
    isInitializing,
    isSending,
    isSaving,
  } = useAIAssistant({
    projectId,
    moduleId,
    questionId,
    questionLabel,
    suggestedOptions,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Force reinit when questionId changes
  useEffect(() => {
    if (prevQuestionIdRef.current !== questionId) {
      prevQuestionIdRef.current = questionId;
      hasInitializedRef.current = false;
      // Force reinit with new question
      if (!isLoading && !isInitializing) {
        void initConversation("guided");
      }
    }
  }, [questionId, isLoading, isInitializing, initConversation]);

  // Initialize conversation on mount if not already initialized
  useEffect(() => {
    if (!isLoading && !hasInitializedRef.current && !isInitializing) {
      hasInitializedRef.current = true;
      void initConversation("guided");
    }
  }, [isLoading, isInitializing, initConversation]);

  // Notify parent when text changes (only when actually different)
  useEffect(() => {
    if (generatedText && generatedText !== prevGeneratedTextRef.current) {
      prevGeneratedTextRef.current = generatedText;
      onTextGeneratedRef.current(generatedText);
    }
  }, [generatedText]);

  // Handle sending a response
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    const response = inputValue.trim();
    setInputValue("");

    try {
      await sendResponse(response);
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending response:", error);
    }
  }, [inputValue, isSending, sendResponse]);

  // Handle quick option selection
  const handleOptionSelect = useCallback(
    async (option: string) => {
      if (isSending) return;

      try {
        await sendResponse(option);
      } catch (error) {
        console.error("Error sending option:", error);
      }
    },
    [isSending, sendResponse]
  );

  // Handle "C'est bon" - complete conversation
  const handleComplete = useCallback(async () => {
    try {
      await completeConversation();
    } catch (error) {
      console.error("Error completing conversation:", error);
    }
  }, [completeConversation]);

  // Handle save to section
  const handleSave = useCallback(async () => {
    try {
      await saveToSection();
      onComplete();
    } catch (error) {
      console.error("Error saving to section:", error);
    }
  }, [saveToSection, onComplete]);

  // Handle applying a suggestion
  const handleApplySuggestion = useCallback(
    async (suggestionId: string, preview: string) => {
      try {
        await applySuggestion(suggestionId, preview);
      } catch (error) {
        console.error("Error applying suggestion:", error);
      }
    },
    [applySuggestion]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend]
  );

  // Find last assistant message to show options
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
  const showOptionsOnLastMessage = !isComplete && lastAssistantMessage?.options;

  return (
    <div className="flex flex-col h-full min-h-0 bg-background rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium">Assistant IA</span>
        </div>
        <ModeSwitch
          mode={mode}
          onModeChange={setMode}
          disabled={isSending || isInitializing}
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {isLoading || isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mb-2" />
            <p>Démarrage de l&apos;assistant...</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <AIMessageBubble
                key={message.id}
                message={message}
                onOptionSelect={handleOptionSelect}
                showOptions={
                  index === messages.length - 1 &&
                  !isComplete &&
                  !!showOptionsOnLastMessage
                }
              />
            ))}

            {/* Sending indicator */}
            {isSending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>L&apos;assistant réfléchit...</span>
              </div>
            )}

            {/* Completion suggestions */}
            {isComplete && completionSuggestions.length > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Suggestions pour enrichir votre texte :
                </p>
                {completionSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() =>
                      handleApplySuggestion(suggestion.id, suggestion.preview)
                    }
                    className="w-full text-left p-3 bg-background rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <p className="text-sm font-medium">{suggestion.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {suggestion.preview}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/10 flex-shrink-0">
        {isComplete ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => void initConversation("guided")}
              className="flex-1 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recommencer
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Valider et continuer
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* "C'est bon" button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              disabled={isSending || messages.length < 3}
              className={cn(
                "w-full justify-center text-muted-foreground hover:text-foreground",
                messages.length < 3 && "opacity-50"
              )}
            >
              <Check className="h-4 w-4 mr-2" />
              C&apos;est bon, j&apos;ai terminé
            </Button>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Votre réponse..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isSending}
              />
              <Button
                onClick={() => void handleSend()}
                disabled={!inputValue.trim() || isSending}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
