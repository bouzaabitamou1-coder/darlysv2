import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const ConciergeChat = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Bonjour! I'm Lys, your Dar Lys concierge. Ask me about rooms for your budget, whether you need a private driver, or anything about the riad.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("concierge-ai", {
        body: { messages: next.map((m) => ({ role: m.role, content: m.content })) },
      });
      if (error) throw error;
      setMessages([...next, { role: "assistant", content: data?.reply ?? "Sorry, I had trouble responding." }]);
    } catch (e: any) {
      setMessages([
        ...next,
        { role: "assistant", content: "Sorry, I couldn't reach the concierge right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI concierge"
        className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-gold text-charcoal shadow-luxury flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[32rem] bg-cream border border-gold/30 shadow-luxury flex flex-col rounded-sm overflow-hidden"
          >
            <div className="bg-charcoal text-cream px-4 py-3">
              <div className="font-display text-lg">Lys · AI Concierge</div>
              <div className="text-xs opacity-70">Rooms · Transport · FAQ</div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream-dark">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] px-3 py-2 text-sm rounded-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "ml-auto bg-gold text-charcoal"
                      : "mr-auto bg-cream text-charcoal border border-border"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Lys is thinking…
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="border-t border-border p-2 flex gap-2 bg-cream"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="My budget is 1500 MAD for 2 guests…"
                className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-9 w-9 flex items-center justify-center bg-charcoal text-cream disabled:opacity-40 rounded-sm"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ConciergeChat;