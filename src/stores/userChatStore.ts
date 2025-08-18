import { create } from "zustand";
import { ChatState, Message } from "../types/AiCoach";
import { v4 as uuidv4 } from "uuid"; // npm install uuid
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";

export const chatStore = create<ChatState>((set) => ({
  messages: [], // Renommé de 'message' à 'messages' pour plus de clarté
  isLoading: false,
  error: null,

  // Get message from the server
  getMessages: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiUtils.get<Message[]>(ApiUrl.GET_AI_COACH_MESSAGES);
      set({ messages: data });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Getting messages failed");
      set({ error: error.message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  // Send message to the bot
  sendMessage: async (content: string) => {
    set({ isLoading: true, error: null });

    const tempId = uuidv4();

    // D'abord ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: tempId,
      type: "text",
      message: content,
      sender: "user",
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
    }));

    try {
      // Ensuite envoyer au backend et obtenir la réponse
      const { data } = await apiUtils.post<Message>(ApiUrl.SEND_AI_COACH_MESSAGES, { message: content });

      const botMessage: Message = {
        ...data,
        sender: "bot", // S'assurer que le sender est bien 'bot'
      };

      set((state) => ({
        messages: [...state.messages, botMessage],
        isLoading: false,
      }));

      return botMessage;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Méthode pour réinitialiser la conversation
  clearMessages: () => set({ messages: [] }),
}));
