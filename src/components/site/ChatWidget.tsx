import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hey — I'm Nova. Ask me about VyntrixNova's services, pricing or process, and I'll point you in the right direction.",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              answer += delta;
              setMessages([...next, { role: "assistant", content: answer }]);
            }
          } catch {
            /* partial chunk */
          }
        }
      }

      if (!answer) {
        setMessages([
          ...next,
          { role: "assistant", content: "Sorry — I couldn't answer that. Try the contact page?" },
        ]);
      }
    } catch (err) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            err instanceof Error && err.message
              ? err.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="surface-panel glow-ring flex h-[26rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div>
              <p className="font-display text-sm font-semibold">Nova</p>
              <p className="text-xs text-muted-foreground">VyntrixNova assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat window"
              className="rounded-md p-1.5 text-muted-foreground transition-[color,background-color,transform] duration-(--motion-standard) ease-(--ease-standard) hover:bg-surface-interactive hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              ✕
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-background text-foreground"
                }`}
              >
                <p className="whitespace-pre-line">{m.content || (busy ? "…" : "")}</p>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-border/60 p-3">
            <label htmlFor="chat-input" className="sr-only">
              Chat message
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about pricing, scope, timelines…"
              className="flex-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 text-sm shadow-subtle outline-none transition-[background-color,border-color,box-shadow] duration-(--motion-standard) ease-(--ease-standard) placeholder:text-muted-foreground hover:border-border-strong hover:bg-surface-interactive focus:border-border-focus focus:ring-2 focus:ring-ring/35"
            />
            <button
              disabled={busy || !input.trim()}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-subtle transition-[background-color,transform,box-shadow,opacity] duration-(--motion-standard) ease-(--ease-standard) hover:bg-primary-hover hover:shadow-elevated active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_18px_40px_-18px_rgba(168,85,247,0.8)] transition-[background-color,transform,box-shadow] duration-(--motion-standard) ease-(--ease-standard) hover:bg-primary-hover hover:shadow-[0_22px_48px_-18px_rgba(168,85,247,0.9)] active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {open ? "Hide assistant" : "Ask Nova"}
      </button>
    </div>
  );
}
