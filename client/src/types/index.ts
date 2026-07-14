export interface AppUser {
  id: string; // Google sub
  email: string;
  name: string;
  picture?: string;
  isPremium: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string; // Google sub of the sender
  name: string;
  picture?: string;
  text: string;
  createdAt: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface SuggestReplyResponse {
  suggestion: string;
}

export interface SummarizeResponse {
  summary: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
