"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types";

interface Props {
  messages: ChatMessage[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        No messages yet — say hello 👋
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
    >
      {messages.map((message) => {
        const isMine = message.userId === currentUserId;
        return (
          <div
            key={message.id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                isMine
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-800 border border-slate-200"
              }`}
            >
              {!isMine && (
                <p className="mb-0.5 text-xs font-semibold text-slate-500">
                  {message.name}
                </p>
              )}
              <p className="whitespace-pre-wrap wrap-break-word">
                {message.text}
              </p>
              <p
                className={`mt-1 text-[10px] ${
                  isMine ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
