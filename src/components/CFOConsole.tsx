import React, { useState, useRef, useEffect } from "react";
import { Send, Terminal, Zap, Bot, RefreshCw, Landmark } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface CFOConsoleProps {
  id: string;
  budget: number;
  activeAnomaly: any;
}

const CHIPS = [
  "What is the current spending spike about?",
  "How can I right-size the postgres database?",
  "Is there a GKE scaling issue?",
  "What overall savings are available?",
];

export const CFOConsole: React.FC<CFOConsoleProps> = ({ id, budget, activeAnomaly }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: `Hello! I am **CloudPilot**, your Autonomous FinOps Agent and Cloud CFO.

We have detected cost anomalies trending above our target budget boundaries of **$${budget.toLocaleString()}/mo**.

Ask me anything about active staging environments, scaling parameters, or click one of the suggested investigations below to start rightsizing our architecture!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState<"gemini-live" | "offline-mock" | null>(null);

  const endOfChatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/cloudpilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages,
          budget,
          anomalyState: activeAnomaly,
        }),
      });

      const data = await response.json();
      setAiMode(data.aiMode);

      setMessages((prev) => [
        ...prev,
        { role: "model", content: data.text || "I am analyzing our infrastructure metrics. Please repeat your query." },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "I ran into a server error. Let's fallback to our local rules: CloudPilot warns you that our inactive NVMe persistent storage units are wasting $345/mo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestClick = (chipText: string) => {
    sendMessage(chipText);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "model",
        content: "Console system flushed. Ask me anything about current cloud resources.",
      },
    ]);
  };

  return (
    <div id={id} className="bg-slate-950/55 backdrop-blur-md border border-slate-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] shadow-slate-950/50 overflow-hidden flex flex-col h-[520px] relative group">
      {/* Subtle top styling cue */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />

      {/* Top Banner Indicator */}
      <div className="bg-slate-950 border-b border-slate-900 px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">CloudPilot CFO AI Console</h3>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Direct interactive natural language FinOps auditor</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {aiMode === "gemini-live" ? (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Gemini 3.5
            </span>
          ) : (
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Local FinOps Copilot
            </span>
          )}

          <button
            onClick={clearChat}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Clear Console"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Messaging Logs */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-950/15 select-all scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
        {messages.map((m, idx) => {
          const isModel = m.role === "model";
          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${isModel ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border text-xs ${
                  isModel
                    ? "bg-slate-950 text-indigo-400 border-indigo-500/20 shadow-md"
                    : "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/15"
                }`}
              >
                {isModel ? <Bot className="w-3.5 h-3.5" /> : <Landmark className="w-3 h-3 text-white" />}
              </div>

              <div
                className={`p-3.5 rounded-xl text-xs leading-relaxed border transition-all ${
                  isModel
                    ? "bg-slate-950/70 text-slate-200 border-slate-900/60 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                    : "bg-indigo-950/30 text-indigo-200 border-indigo-500/15"
                }`}
              >
                <div className="markdown-body text-xs font-sans prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-7 h-7 rounded-lg bg-slate-950 text-indigo-400 border border-indigo-500/20 shrink-0 flex items-center justify-center shadow-md select-none">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950/70 border border-slate-900/80 text-slate-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="font-mono text-[10px]">CloudPilot CFO is calculating savings...</span>
            </div>
          </div>
        )}

        <div ref={endOfChatRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-950/30 border-t border-slate-900 shrink-0 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {CHIPS.map((chip, i) => (
          <button
            key={i}
            disabled={loading}
            onClick={() => handleSuggestClick(chip)}
            className="text-[10px] bg-slate-950 text-slate-400 border border-slate-850 hover:border-indigo-500 hover:text-white px-2.5 py-1 rounded-full transition-colors shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 bg-slate-950 border-t border-slate-900 shrink-0 flex gap-2"
      >
        <input
          type="text"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask CloudPilot to write an autoscale limit, optimize MySQL, find idle disks..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded px-3 py-1.5 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-indigo-500"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
