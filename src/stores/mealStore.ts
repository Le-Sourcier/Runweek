import { create } from "zustand";

const accessTokenName = "aspk"; // Access token
const refreshTokenName = "rft"; // Refresh token

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem(accessTokenName) || null,
  refreshToken: localStorage.getItem(refreshTokenName) || null,
  user: null,

  // Add new meal
  addNewMeal: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiUtils.get<Message[]>(
        ApiUrl.GET_AI_COACH_MESSAGES
      );
      set({ messages: data.length > 0 ? data : [get().initialMessage] });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Getting messages failed");
      set({ error: error.message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
