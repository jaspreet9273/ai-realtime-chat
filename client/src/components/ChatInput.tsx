"use client";

import { FormEvent, useState } from "react";
import { aiApi } from "@/services/api/ai";
import { ApiError } from "@/types";

interface Props {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: Props) {
  const [text, setText] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  async function handleSuggest() {
    setSuggesting(true);
    setError(null);
    try {
      const suggestion = await aiApi.suggestReply();
      setText(suggestion);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to get a suggestion",
      );
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200 bg-white p-2 sm:p-3"
    >
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={handleSuggest}
          disabled={suggesting}
          className="shrink-0 cursor-pointer rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:px-3"
        >
          <span className="sm:hidden">{suggesting ? "..." : "✨"}</span>
          <span className="hidden sm:inline">
            {suggesting ? "Thinking..." : "✨ Suggest"}
          </span>
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="shrink-0 cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition enabled:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed sm:px-4"
        >
          <span className="sm:hidden">➤</span>
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </form>
  );
}
