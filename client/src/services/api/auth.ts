import { axiosInstance } from "./instance";
import { AppUser } from "@/types";

// In-flight request memoization by token: if verify() is called twice
// with the same token before the first resolves (e.g. React Strict Mode's
// mount -> cleanup -> mount double-invoke of an effect), the second call
// reuses the first call's promise instead of firing a second real HTTP
// request.
const inFlightVerifyByToken = new Map<string, Promise<AppUser>>();

export const authApi = {
  /**
   * Calls the backend's /api/auth/verify, which independently verifies
   * the Google id_token and returns the canonical, sub-keyed user object.
   * This is the ONLY source of truth for the app user object — never
   * construct one from session.user.email on the client.
   */
  async verify(idToken: string): Promise<AppUser> {
    const existing = inFlightVerifyByToken.get(idToken);
    if (existing) {
      return existing;
    }

    const promise = axiosInstance
      .post<{ user: AppUser }>(
        "/api/auth/verify",
        {},
        { headers: { Authorization: `Bearer ${idToken}` } },
      )
      .then((res) => res.data.user)
      .finally(() => {
        inFlightVerifyByToken.delete(idToken);
      });

    inFlightVerifyByToken.set(idToken, promise);
    return promise;
  },
};
