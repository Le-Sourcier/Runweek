import { create } from "zustand";
import { fetchApi } from "../utils";
import { ChatState, Message } from "../types/AiCoach";
import sec from "react-secure-storage";
import { v4 as uuidv4 } from "uuid"; // npm install uuid

const BASE_URL = import.meta.env.VITE_API_URL;

export const useChatStore = create<ChatState>((set) => ({
  messages: [], // Renommé de 'message' à 'messages' pour plus de clarté
  isLoading: false,
  error: null,

  // Get message from the server
  getMessages: async () => {
    set({ isLoading: true, error: null });
    try {
      const accessToken = sec.getItem("aspk");

      const res = await fetchApi<Message[]>(`${BASE_URL}/get-message`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { message, error, data } = res;
      if (error) {
        throw new Error(message as string);
      }

      if (!data) {
        throw new Error("No response data");
      }

      set({ isLoading: false });
      return data;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Getting messages failed");
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  // Send message to the bot
  sendMessage: async (content: string) => {
    set({ isLoading: true, error: null });

    const accessToken = sec.getItem("aspk");
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
      const res = await fetchApi<Message>(`${BASE_URL}/aicoach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: content,
        }),
      });

      const { message, error, data } = res;

      if (error) {
        throw new Error(message || "Failed to get AI response");
      }

      if (!data) {
        throw new Error("No data received from AI");
      }

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
