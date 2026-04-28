import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };
type Props = { activity: string; dateRange?: string; city?: string };

const renderMd = (text: string): string => {
  return text
    // links [text](url) — open in new tab
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer" class="underline decoration-primary-glow/60 underline-offset-2 hover:text-primary-glow">$1</a>'
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\*)([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/^### (.+)$/gm, '<h3 class="font-display text-xl mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-2xl mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-display text-3xl mt-6 mb-3">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc my-1">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
};

export const AIAgent = ({ activity, dateRange, city }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stream = async (history: Msg[]) => {
    setLoading(true);
    setError(null);
    // append empty assistant message we'll fill
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekend-ai`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ activity, dateRange, city, messages: history }),
      });

      if (!resp.ok) {
        if (resp.status === 429) throw new Error("Wiqo's AI is catching its breath. Try again in a moment.");
        if (resp.status === 402) throw new Error("AI credits ran out. Add some in your workspace settings.");
        throw new Error("AI couldn't respond right now.");
      }
      if (!resp.body) throw new Error("No response stream.");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) {
              setMessages((m) => {
                const copy = [...m];
                const last = copy[copy.length - 1];
                if (last?.role === "assistant") {
                  copy[copy.length - 1] = { ...last, content: last.content + c };
                }
                return copy;
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      // remove the empty assistant placeholder on error
      setMessages((m) => (m[m.length - 1]?.role === "assistant" && !m[m.length - 1].content ? m.slice(0, -1) : m));
    } finally {
      setLoading(false);
    }
  };

  // initial open
  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    const opener: Msg = { role: "user", content: `Give me ideas for: ${activity}.` };
    stream([opener]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity]);

  // auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    stream(next);
  };

  // Hide the synthetic opener "Give me ideas for: X" from the rendered convo
  const visible = messages.filter((m, i) => !(i === 0 && m.role === "user"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="rounded-3xl bg-dusk shadow-deep p-6 sm:p-8 text-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-glow opacity-30 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-primary-glow" /> Chat with Wiqo
          </div>
        </div>

        <div ref={scrollRef} className="max-h-[28rem] overflow-y-auto pr-1 space-y-4 mb-5">
          {visible.length === 0 && !error && (
            <div className="opacity-60 italic font-body">Thinking up something good for you...</div>
          )}
          {visible.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "assistant"
                  ? "font-body text-base sm:text-lg leading-relaxed text-background/90"
                  : "ml-auto max-w-[85%] rounded-2xl bg-background/10 px-4 py-2.5 text-background/90 font-body"
              }
              style={m.role === "user" ? { display: "block", marginLeft: "auto", width: "fit-content" } : {}}
              dangerouslySetInnerHTML={{
                __html:
                  m.content
                    ? renderMd(m.content)
                    : '<span class="opacity-50 italic">...</span>',
              }}
            />
          ))}
          {error && <p className="font-display italic text-xl text-primary-glow">{error}</p>}
          {loading && (
            <div className="inline-flex items-center gap-2 text-xs opacity-60">
              <Loader2 className="h-3 w-3 animate-spin" /> typing...
            </div>
          )}
        </div>

        <form onSubmit={send} className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Wiqo anything — a tweak, a question, a follow-up..."
            disabled={loading}
            className="flex-1 rounded-full bg-background/10 border border-background/20 px-5 py-3 text-sm text-background placeholder:text-background/50 focus:outline-none focus:border-primary-glow/60 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-full bg-primary-glow text-dusk px-4 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};
