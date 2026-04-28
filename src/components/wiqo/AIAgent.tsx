import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";

type Props = { activity: string; dateRange?: string };

const renderMd = (text: string): string => {
  // ultra-light markdown: bold, italic, line breaks
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\*)([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/^### (.+)$/gm, '<h3 class="font-display text-xl mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-2xl mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-display text-3xl mt-6 mb-3">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc my-1">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
};

export const AIAgent = ({ activity, dateRange }: Props) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    setText("");
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekend-ai`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ activity, dateRange }),
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
            if (c) setText((t) => t + c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
      className="rounded-3xl bg-dusk shadow-deep p-8 sm:p-10 text-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-glow opacity-30" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-primary-glow" /> Wiqo's AI
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="text-xs inline-flex items-center gap-1 hover:opacity-80 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Reroll
          </button>
        </div>

        {error ? (
          <p className="font-display italic text-2xl text-primary-glow">{error}</p>
        ) : (
          <div
            className="font-body text-base sm:text-lg leading-relaxed text-background/90 min-h-[8rem]"
            dangerouslySetInnerHTML={{
              __html: text
                ? renderMd(text)
                : '<span class="opacity-60 italic">Thinking up something good for you...</span>',
            }}
          />
        )}

        {loading && text && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs opacity-60">
            <Loader2 className="h-3 w-3 animate-spin" /> still typing...
          </div>
        )}
      </div>
    </motion.div>
  );
};
