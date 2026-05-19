import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTenant } from "@/contexts/TenantContext";

type Msg = { role: "user" | "assistant"; content: string };

const LOCALE = {
  en: {
    title: "Lys · AI Concierge",
    subtitle: "Rooms · Transport · FAQ",
    welcome:
      "Hello! I'm Lys, your Dar Lys concierge. Ask me about rooms for your budget, whether you need a private driver, or anything about the riad.",
    placeholder: "My budget is 1500 MAD for 2 guests…",
    quickLabel: "Quick questions",
    thinking: "Lys is thinking…",
    error: "Sorry, I couldn't reach the concierge right now. Please try again.",
    quick: [
      "Recommend a room for 2 guests under 1500 MAD",
      "Do I need a private driver from the airport?",
      "What's your cancellation policy?",
      "Is breakfast included?",
      "Day trip to Chefchaouen — driver cost?",
    ],
  },
  fr: {
    title: "Lys · Concierge IA",
    subtitle: "Chambres · Transport · FAQ",
    welcome:
      "Bonjour ! Je suis Lys, votre concierge de Dar Lys. Demandez-moi une chambre selon votre budget, si vous avez besoin d'un chauffeur privé, ou toute question sur le riad.",
    placeholder: "Mon budget est de 1500 MAD pour 2 personnes…",
    quickLabel: "Questions rapides",
    thinking: "Lys réfléchit…",
    error: "Désolé, le concierge est injoignable. Veuillez réessayer.",
    quick: [
      "Recommandez une chambre pour 2 personnes à moins de 1500 MAD",
      "Ai-je besoin d'un chauffeur privé depuis l'aéroport ?",
      "Quelle est votre politique d'annulation ?",
      "Le petit-déjeuner est-il inclus ?",
      "Excursion à Chefchaouen — coût du chauffeur ?",
    ],
  },
  ar: {
    title: "ليس · مساعد ذكي",
    subtitle: "الغرف · النقل · الأسئلة الشائعة",
    welcome:
      "مرحباً! أنا ليس، مساعدك في دار ليس. اسألني عن غرفة تناسب ميزانيتك، أو هل تحتاج إلى سائق خاص، أو أي سؤال عن الرياض.",
    placeholder: "ميزانيتي 1500 درهم لشخصين…",
    quickLabel: "أسئلة سريعة",
    thinking: "ليس يفكر…",
    error: "عذراً، تعذّر الوصول إلى المساعد. حاول مرة أخرى.",
    quick: [
      "اقترح غرفة لشخصين بأقل من 1500 درهم",
      "هل أحتاج إلى سائق خاص من المطار؟",
      "ما هي سياسة الإلغاء؟",
      "هل الإفطار مشمول؟",
      "رحلة إلى شفشاون — كم تكلفة السائق؟",
    ],
  },
};

const ConciergeChat = () => {
  const { lang } = useLanguage();
  const { tenant } = useTenant();
  const L = LOCALE[lang] ?? LOCALE.en;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: L.welcome }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset welcome message when language changes (only if conversation hasn't started)
  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0].role === "assistant" ? [{ role: "assistant", content: L.welcome }] : prev,
    );
  }, [lang, L.welcome]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("concierge-ai", {
        body: {
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          lang,
          tenantSlug: tenant.slug,
        },
      });
      if (error) throw error;
      setMessages([...next, { role: "assistant", content: data?.reply ?? L.error }]);
    } catch (e: any) {
      setMessages([...next, { role: "assistant", content: L.error }]);
    } finally {
      setLoading(false);
    }
  };

  const showQuickReplies = messages.filter((m) => m.role === "user").length === 0;
  const isRtl = lang === "ar";

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
            dir={isRtl ? "rtl" : "ltr"}
            className="fixed bottom-24 left-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[32rem] bg-cream border border-gold/30 shadow-luxury flex flex-col rounded-sm overflow-hidden"
          >
            <div className="bg-charcoal text-cream px-4 py-3">
              <div className="font-display text-lg">{L.title}</div>
              <div className="text-xs opacity-70">{L.subtitle}</div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream-dark">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] px-3 py-2 text-sm rounded-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? (isRtl ? "mr-auto" : "ml-auto") + " bg-gold text-charcoal"
                      : (isRtl ? "ml-auto" : "mr-auto") + " bg-cream text-charcoal border border-border"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> {L.thinking}
                </div>
              )}
              {showQuickReplies && !loading && (
                <div className="pt-2 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{L.quickLabel}</div>
                  <div className="flex flex-wrap gap-2">
                    {L.quick.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-xs px-3 py-1.5 bg-cream border border-gold/40 text-charcoal hover:bg-gold hover:text-charcoal transition-colors rounded-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
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
                placeholder={L.placeholder}
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