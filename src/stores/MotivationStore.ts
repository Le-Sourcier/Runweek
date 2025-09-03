import { create } from "zustand";
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";
import { extractErrorMessage } from "../utils/error-handler";

export const useMotivationStore = create<{ motivation: string, getMotivation: () => void }>((set) => ({
  motivation: "",
  getMotivation: async () => {
    try {
      const { data } = await apiUtils.get<{ message: string }>(ApiUrl.MOTIVATION)
      set({ motivation: data.message })
    } catch (error) {
      if (extractErrorMessage(error).message === "NO_MOTIVATION_FOUND") {
        set({ motivation: "" })
        return;
      }
      throw error;
    }
  },
}));
