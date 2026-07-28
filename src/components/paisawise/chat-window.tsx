import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { PaisaWiseMark } from "@/components/paisawise/brand";
import { SpendDashboard } from "@/components/paisawise/spend-dashboard";
import { ReceiptCapture } from "@/components/paisawise/receipt-capture";
import { parseLedgerEntries, stripLedgerBlock } from "@/lib/paisawise-store";
import { parseExpenseInput } from "@/lib/expense-parser";
import {
  addExpenses,
  clearChatHistory,
  clearExpenses,
  getChatHistory,
  getStats,
  saveChatHistory,
  type Stats,
} from "@/lib/api";

const QUICK_PROMPTS = [
  "250 zomato dinner with friends",
  "250 zomato dinner\n30 auto college\n1500 amazon earphones\n120 chai snacks\n500 rent share gpay",
  "earned 5000 freelance logo design",
];

const EMPTY_STATS: Stats = {
  totalSpent: 0,
  weekSpent: 0,
  monthSpent: 0,
  totalIncome: 0,
  expenseCount: 0,
  byCategory: [],
};

function messageText(message: UIMessage): string {
  return message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export function ChatWindow() {
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  // Bumped after any metered action so the usage meter re-reads its quotas.
  const [usageKey, setUsageKey] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const seenIds = useRef(new Set<string>());
  const pendingSkip = useRef<boolean[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load — history and aggregated stats come from the server.
  useEffect(() => {
    Promise.all([getChatHistory(), getStats()]).then(([history, serverStats]) => {
      setInitialMessages(history as UIMessage[]);
      setStats(serverStats);
    });
  }, []);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, setMessages, stop } = useChat({
    id: "paisawise-main",
    messages: initialMessages ?? [],
    transport,
    onError: (error) => {
      toast.error(error.message || "Couldn't reach PaisaWise. Try again in a moment.");
    },
  });

  const isBusy = status === "submitted" || status === "streaming";

  const refreshStats = useCallback(() => {
    getStats().then(setStats);
    setUsageKey((k) => k + 1);
  }, []);

  // Debounced transcript save — avoids a write on every streamed token.
  useEffect(() => {
    if (!initialMessages || messages.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveChatHistory(messages);
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [messages, initialMessages]);

  // Roll AI-reported entries into the ledger, skipping turns the local
  // parser already saved so nothing is counted twice.
  useEffect(() => {
    if (status === "streaming" || status === "submitted") return;

    const newEntries: {
      amount: number;
      category: string;
      merchant: string | null;
      note: string;
      type: "expense" | "income";
    }[] = [];

    for (const message of messages) {
      if (message.role !== "assistant" || seenIds.current.has(message.id)) continue;
      seenIds.current.add(message.id);

      if (pendingSkip.current.shift()) continue;

      for (const entry of parseLedgerEntries(messageText(message))) {
        newEntries.push(entry);
      }
    }

    if (newEntries.length > 0) {
      addExpenses(newEntries).then((result) => {
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        refreshStats();
      });
    }
  }, [messages, status, refreshStats]);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);
  useEffect(() => {
    if (status === "ready") focusInput();
  }, [status, focusInput]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy) return;

      const parsed = parseExpenseInput(trimmed);
      pendingSkip.current.push(parsed.length > 0);

      if (parsed.length > 0) {
        addExpenses(parsed).then((result) => {
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          refreshStats();
        });
      }

      void sendMessage({ text: trimmed });
      focusInput();
    },
    [isBusy, sendMessage, focusInput, refreshStats],
  );

  const newConversation = useCallback(() => {
    stop();
    setMessages([]);
    void clearChatHistory();
    seenIds.current.clear();
    pendingSkip.current = [];
    focusInput();
  }, [setMessages, stop, focusInput]);

  const resetLedger = useCallback(async () => {
    const result = await clearExpenses();
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setStats(EMPTY_STATS);
    toast.success("Ledger cleared. Fresh start!");
  }, []);

  if (!initialMessages) {
    return (
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-4">
        <div className="h-full min-h-[60vh] animate-pulse rounded-2xl border bg-card" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-h-0 flex-col rounded-2xl border bg-card">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-mint" aria-hidden />
            Synced to your account
          </div>
          <div className="flex items-center gap-2">
            <ReceiptCapture onSaved={refreshStats} />
            <Button variant="outline" size="sm" onClick={newConversation} className="gap-1.5">
              <Plus className="size-3.5" />
              New chat
            </Button>
          </div>
        </div>

        <Conversation className="min-h-0 flex-1">
          <ConversationContent className="pw-mono gap-5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <PaisaWiseMark size={64} eager />
                <div>
                  <h2 className="font-display text-2xl font-extrabold">
                    Tell me what you spent today
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Type like you talk. Paste a whole list if you want.
                  </p>
                </div>
                <div className="flex w-full max-w-lg flex-col gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => send(prompt)}
                      className="rounded-xl border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-brand hover:bg-brand-soft"
                    >
                      <span className="whitespace-pre-line">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const text = messageText(message);
                if (message.role === "user") {
                  return (
                    <Message from="user" key={message.id}>
                      <MessageContent className="whitespace-pre-line bg-primary text-primary-foreground">
                        {text}
                      </MessageContent>
                    </Message>
                  );
                }
                return (
                  <Message from="assistant" key={message.id}>
                    <MessageContent className="bg-transparent p-0 text-foreground">
                      <MessageResponse>{stripLedgerBlock(text)}</MessageResponse>
                    </MessageContent>
                  </Message>
                );
              })
            )}

            {status === "submitted" ? (
              <Shimmer className="text-sm">Crunching your paisa...</Shimmer>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t p-3">
          <PromptInput onSubmit={(message) => send(message.text)}>
            <PromptInputTextarea
              ref={inputRef}
              autoFocus
              placeholder="e.g. 250 zomato dinner, auto 30 college, 1.2k myntra shoes"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>

      <SpendDashboard
        stats={stats}
        onReset={resetLedger}
        onDataChanged={refreshStats}
        usageKey={usageKey}
      />
    </div>
  );
}
