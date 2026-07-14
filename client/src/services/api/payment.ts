import { axiosInstance } from "./instance";
import { AppUser, CreateOrderResponse, VerifyPaymentPayload } from "@/types";

export const paymentApi = {
  async createOrder(): Promise<CreateOrderResponse> {
    const res = await axiosInstance.post<CreateOrderResponse>(
      "/api/payment/create-order",
    );
    return res.data;
  },

  async verify(payload: VerifyPaymentPayload): Promise<AppUser> {
    const res = await axiosInstance.post<{ user: AppUser }>(
      "/api/payment/verify",
      payload,
    );
    return res.data.user;
  },
};
