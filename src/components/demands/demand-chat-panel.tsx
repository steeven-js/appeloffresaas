"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send, Trash2, User, AlertCircle, Sparkles } from "lucide-react";

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
import { cn } from "~/lib/utils";
import { markdownToHtml } from "~/lib/utils/markdown-parser";
import { api } from "~/trpc/react";

interface DemandChatPanelProps {
  projectId: string;
}

export function DemandChatPanel({ projectId }: DemandChatPanelProps) {
  const [input, setInput] = useState("");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const utils = api.useUtils();

  // Check if AI is available
  const { data: aiStatus } = api.demandChat.isAvailable.useQuery();

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
              role={message.role as "user" | "assistant"}
              content={message.content}
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
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const isUser = role === "user";

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
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[85%]",
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
    </div>
  );
}
