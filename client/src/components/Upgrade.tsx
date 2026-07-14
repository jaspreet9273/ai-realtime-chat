"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { paymentApi } from "@/services/api/payment";
import { aiApi } from "@/services/api/ai";
import { loadRazorpayScript } from "@/lib/load-razorpay";
import { ApiError, AppUser } from "@/types";

interface Props {
  user: AppUser;
  onPremiumUnlocked: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export function Upgrade({ user, onPremiumUnlocked }: Props) {
  const { data: session } = useSession();
  const [paying, setPaying] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setError(null);
    setPaying(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay checkout script");
      }

      const order = await paymentApi.createOrder();

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "AI Realtime Chat",
        description: "Unlock premium chat summaries",
        prefill: {
          name: user.name,
          email: user.email,
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await paymentApi.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            onPremiumUnlocked();
          } catch (err) {
            setError(
              err instanceof ApiError
                ? err.message
                : "Payment verification failed",
            );
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        theme: { color: "#0f172a" },
      });

      razorpay.open();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to start checkout",
      );
      setPaying(false);
    }
  }

  async function handleSummarize() {
    setError(null);
    setSummarizing(true);
    try {
      const result = await aiApi.summarize();
      setSummary(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to summarize chat",
      );
    } finally {
      setSummarizing(false);
    }
  }

  return (
    <aside className="w-full shrink-0 border-t border-slate-200 bg-white p-4 md:w-72 md:border-l md:border-t-0">
      <h2 className="text-sm font-semibold text-slate-900">Premium</h2>
      {!user.isPremium ? (
        <div className="mt-3">
          <p className="text-xs text-slate-500">
            Unlock AI-powered chat summaries for ₹49.
          </p>
          <button
            onClick={handleUpgrade}
            disabled={paying}
            className="mt-3 w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            {paying ? "Processing..." : "Unlock Premium"}
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <p className="mb-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            Premium active
          </p>
          <button
            onClick={handleSummarize}
            disabled={summarizing}
            className="w-full cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {summarizing ? "Summarizing..." : "Summarize chat"}
          </button>
          {summary && (
            <div className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
              {summary}
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {!session?.idToken && (
        <p className="mt-2 text-xs text-red-500">
          Missing session token - try signing in again.
        </p>
      )}
    </aside>
  );
}
