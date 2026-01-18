"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send, Trash2, User, AlertCircle, Sparkles, Save, Check, FileText } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { markdownToHtml } from "~/lib/utils/markdown-parser";
import { api } from "~/trpc/react";
import {
  detectSaveableContent,
  cleanContentForSave,
  type SaveableSection,
} from "~/lib/utils/response-parser";

interface DemandChatPanelProps {
  projectId: string;
  onContentSaved?: () => void;
}

export function DemandChatPanel({ projectId, onContentSaved }: DemandChatPanelProps) {
  const [input, setInput] = useState("");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set());
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const utils = api.useUtils();

  // Check if AI is available
  const { data: aiStatus } = api.demandChat.isAvailable.useQuery();

  // Save content to section mutation
  const saveToSectionMutation = api.demandProjects.saveAIContent.useMutation({
    onSuccess: () => {
      // Invalidate project data to refresh completion percentage
      void utils.demandProjects.get.invalidate({ id: projectId });
      onContentSaved?.();
    },
  });

  // Get greeting message
  const { data: greeting } = api.demandChat.getGreeting.useQuery(
    { demandProjectId: projectId },
    { enabled: aiStatus?.available }
  );

  // Get chat messages
  const { data: messages, isLoading: messagesLoading } =
    api.demandChat.getMessages.useQuery(
      { demandProjectId: projectId },
      { enabled: aiStatus?.available }
    );

  // Send message mutation
  const sendMutation = api.demandChat.sendMessage.useMutation({
    onSuccess: () => {
      void utils.demandChat.getMessages.invalidate({ demandProjectId: projectId });
      setInput("");
    },
  });

  // Clear history mutation
  const clearMutation = api.demandChat.clearHistory.useMutation({
    onSuccess: () => {
      void utils.demandChat.getMessages.invalidate({ demandProjectId: projectId });
      setClearDialogOpen(false);
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle send message
  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    sendMutation.mutate({
      demandProjectId: projectId,
      content: input.trim(),
    });
  };

  // Handle key press (Ctrl/Cmd + Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle save content to section
  const handleSaveToSection = async (
    messageId: string,
    section: SaveableSection,
    content: string
  ) => {
    setSavingSection(`${messageId}-${section}`);
    try {
      const cleanedContent = cleanContentForSave(content);
      await saveToSectionMutation.mutateAsync({
        id: projectId,
        section,
        content: cleanedContent,
      });
      // Mark message as saved for this section
      setSavedMessageIds((prev) => new Set(prev).add(`${messageId}-${section}`));
    } finally {
      setSavingSection(null);
    }
  };

  // If AI is not available, show a placeholder
  if (!aiStatus?.available) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-medium mb-2">Assistant IA non disponible</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          L&apos;assistant IA n&apos;est pas configuré. Contactez votre administrateur pour activer cette fonctionnalité.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm">Assistant IA</h3>
            <p className="text-xs text-muted-foreground">Aide à la rédaction</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setClearDialogOpen(true)}
          disabled={!messages?.length || clearMutation.isPending}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Greeting message */}
          {greeting && (!messages || messages.length === 0) && (
            <ChatMessage role="assistant" content={greeting.message} />
          )}

          {/* Loading state */}
          {messagesLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Chat messages */}
          {messages?.map((message) => (
            <ChatMessage
              key={message.id}
              messageId={message.id}
              role={message.role as "user" | "assistant"}
              content={message.content}
              onSaveToSection={handleSaveToSection}
              savedSections={savedMessageIds}
              savingSection={savingSection}
            />
          ))}

          {/* Sending state */}
          {sendMutation.isPending && (
            <ChatMessage role="assistant" content="" isLoading />
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question ou décrivez votre besoin..."
            className="resize-none min-h-[80px]"
            disabled={sendMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            className="self-end"
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Appuyez sur Ctrl+Entrée pour envoyer
        </p>
        {sendMutation.isError && (
          <p className="text-xs text-destructive mt-1">
            {sendMutation.error.message}
          </p>
        )}
      </div>

      {/* Clear confirmation dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Effacer l&apos;historique ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera tous les messages de cette conversation.
              L&apos;assistant recommencera avec le contexte actuel du dossier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearMutation.mutate({ demandProjectId: projectId })}
              disabled={clearMutation.isPending}
            >
              {clearMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Effacer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface ChatMessageProps {
  messageId?: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
  onSaveToSection?: (messageId: string, section: SaveableSection, content: string) => void;
  savedSections?: Set<string>;
  savingSection?: string | null;
}

const SECTION_LABELS: Record<SaveableSection, string> = {
  context: "Contexte",
  description: "Description",
  constraints: "Contraintes",
  budget: "Budget & Délais",
};

function ChatMessage({
  messageId,
  role,
  content,
  isLoading,
  onSaveToSection,
  savedSections,
  savingSection,
}: ChatMessageProps) {
  const isUser = role === "user";

  // Detect saveable content in assistant messages
  const saveableContent = !isUser && !isLoading && content
    ? detectSaveableContent(content)
    : [];

  const hasSaveableContent = saveableContent.length > 0;

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 max-w-[85%]">
        <div
          className={cn(
            "rounded-lg px-4 py-2",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce animation-delay-100">.</span>
              <span className="animate-bounce animation-delay-200">.</span>
            </div>
          ) : isUser ? (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          ) : (
            <div
              className="text-sm prose prose-sm prose-neutral dark:prose-invert max-w-none
                prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
                prose-strong:font-semibold prose-headings:font-semibold"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
          )}
        </div>

        {/* Save to document button for assistant messages with saveable content */}
        {hasSaveableContent && messageId && onSaveToSection && (
          <div className="mt-2 flex items-center gap-2">
            {saveableContent.length === 1 ? (
              // Single section detected - show direct button
              <SaveButton
                messageId={messageId}
                section={saveableContent[0]!.section}
                content={saveableContent[0]!.content}
                label={saveableContent[0]!.label}
                onSave={onSaveToSection}
                isSaved={savedSections?.has(`${messageId}-${saveableContent[0]!.section}`)}
                isSaving={savingSection === `${messageId}-${saveableContent[0]!.section}`}
              />
            ) : (
              // Multiple sections detected - show dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                    <Save className="h-3 w-3" />
                    Enregistrer dans le dossier
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {saveableContent.map((item) => {
                    const isSaved = savedSections?.has(`${messageId}-${item.section}`);
                    const isSaving = savingSection === `${messageId}-${item.section}`;
                    return (
                      <DropdownMenuItem
                        key={item.section}
                        onClick={() => onSaveToSection(messageId, item.section, item.content)}
                        disabled={(isSaved ?? false) || isSaving}
                        className="gap-2"
                      >
                        {isSaving ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isSaved ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                        {SECTION_LABELS[item.section]}
                        {isSaved && <span className="text-xs text-muted-foreground ml-auto">Enregistré</span>}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface SaveButtonProps {
  messageId: string;
  section: SaveableSection;
  content: string;
  label: string;
  onSave: (messageId: string, section: SaveableSection, content: string) => void;
  isSaved?: boolean;
  isSaving?: boolean;
}

function SaveButton({ messageId, section, content, label, onSave, isSaved, isSaving }: SaveButtonProps) {
  if (isSaved) {
    return (
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 text-green-600" disabled>
        <Check className="h-3 w-3" />
        Enregistré dans {label}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-xs gap-1.5"
      onClick={() => onSave(messageId, section, content)}
      disabled={isSaving}
    >
      {isSaving ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Save className="h-3 w-3" />
      )}
      Enregistrer dans {label}
    </Button>
  );
}
