"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useAppUser } from "@/components/AppUserProvider";
import { socketService, SOCKET_EVENTS } from "@/services/socket";
import { MessageList } from "@/components/MessageList";
import { ChatInput } from "@/components/ChatInput";
import { Upgrade } from "@/components/Upgrade";
import { UserProfile } from "@/components/UserProfile";
import { ChatMessage } from "@/types";

export default function ChatPage() {
  const { data: session } = useSession();
  const { user, loading, error, setPremium } = useAppUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);
  const seenMessageIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!session?.idToken || !user) return;

    const socket = socketService.connect(session.idToken);

    function handleHistory(history: ChatMessage[]) {
      seenMessageIds.current = new Set(history.map((m) => m.id));
      setMessages(history);
    }

    function handleMessage(message: ChatMessage) {
      if (seenMessageIds.current.has(message.id)) return;
      seenMessageIds.current.add(message.id);
      setMessages((prev) => [...prev, message]);
    }

    function handleChatError(payload: { error: string }) {
      setSocketError(payload.error);
    }

    function handlePaymentSuccess() {
      setPremium(true);
    }

    socket.on(SOCKET_EVENTS.CHAT_HISTORY, handleHistory);
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);
    socket.on(SOCKET_EVENTS.CHAT_ERROR, handleChatError);
    socket.on(SOCKET_EVENTS.PAYMENT_SUCCESS, handlePaymentSuccess);

    socketService.join();

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_HISTORY, handleHistory);
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);
      socket.off(SOCKET_EVENTS.CHAT_ERROR, handleChatError);
      socket.off(SOCKET_EVENTS.PAYMENT_SUCCESS, handlePaymentSuccess);
    };
  }, [session?.idToken, user, setPremium]);

  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  function handleSend(text: string) {
    socketService.sendMessage(text);
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-slate-500">Loading your account...</p>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 text-center">
        <p className="text-sm text-red-500">
          {error ||
            "Could not verify your session. Please try signing in again."}
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col min-h-0">
      <UserProfile user={user} />
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden md:flex-row">
        <div className="flex flex-1 min-h-0 flex-col">
          {socketError && (
            <p className="bg-red-50 px-4 py-2 text-xs text-red-600">
              {socketError}
            </p>
          )}
          <MessageList messages={messages} currentUserId={user.id} />
          <ChatInput onSend={handleSend} />
        </div>
        <Upgrade user={user} onPremiumUnlocked={() => setPremium(true)} />
      </div>
    </main>
  );
}
