import { axiosInstance } from "./instance";
import { SuggestReplyResponse, SummarizeResponse } from "@/types";

export const aiApi = {
  async suggestReply(): Promise<string> {
    const res = await axiosInstance.post<SuggestReplyResponse>(
      "/api/ai/suggest-reply",
    );
    return res.data.suggestion;
  },

  async summarize(): Promise<string> {
    const res =
      await axiosInstance.post<SummarizeResponse>("/api/ai/summarize");
    return res.data.summary;
  },
};
