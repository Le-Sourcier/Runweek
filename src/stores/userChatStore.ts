import { create } from "zustand";
import {
  Advices,
  ChatState,
  Message,
  Motivational,
  SuggestedNutrition,
  SuggestedWorkouts,
  TrainingPlan,
} from "../types/AiCoach";
import { v4 as uuidv4 } from "uuid"; // npm install uuid
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";
import { extractErrorMessage } from "../utils/error-handler";

export const chatStore = create<ChatState>((set, get) => ({
  messages: [], // Renommé de 'message' à 'messages' pour plus de clarté
  isLoading: false,
  error: null,
  trainingPlans: [],
  suggestedWorkouts: [],
  suggestedNutrition: [],
  motivation: undefined,
  advices: [],
  initialMessage: {
    id: "init-" + Date.now(),
    message:
      "Hi there! I'm your running coach AI. How can I help you today with your training?",
    sender: "bot",
    createdAt: new Date().toISOString(),
    type: "text",
  } as Message,

  // Get message from the server
  getMessages: async () => {
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
      const { data } = await apiUtils.post<Message>(
        ApiUrl.SEND_AI_COACH_MESSAGES,
        { message: content }
      );

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

  getMotivation: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiUtils.get(ApiUrl.MOTIVATION);

      const text = data as Motivational;

      // console.log("HHBBB: ", text.message);
      set({
        motivation: text,
      });
    } catch (err) {
      if (extractErrorMessage(err).message === "NO_MOTIVATION_FOUND") {
        set({ motivation: undefined, error: null });
        return;
      }
      const error =
        err instanceof Error ? err : new Error("Getting motivation failed");
      set({ error: error.message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  getAdvices: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiUtils.get<{ advices: [] }>(
        ApiUrl.GET_AI_ADVICES
      );

      const advices = data.advices as Advices[];
      // console.log("HHBBB: ", advices[0].description);
      set({
        advices: advices,
      });
    } catch (err) {
      if (extractErrorMessage(err).message === "NO_MOTIVATION_FOUND") {
        set({ motivation: undefined, error: null });
        return;
      }
      const error =
        err instanceof Error ? err : new Error("Getting motivation failed");
      set({ error: error.message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  getTrainingPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiUtils.get<{ plans: unknown }>(
        ApiUrl.GET_AI_COACH_TRAINING_PLANS
      );

      const plans = data.plans as TrainingPlan[];

      set({ trainingPlans: plans });
    } catch (err) {
      if (extractErrorMessage(err).message === "NO_PLANTS_FOUND") {
        set({ trainingPlans: [], error: null });
        return;
      }
      const error =
        err instanceof Error ? err : new Error("Getting training plans failed");
      set({ error: error.message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getSuggestedWorkouts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiUtils.get<{ suggestions: unknown }>(
        ApiUrl.GET_AI_COACH_SUGGESTED_WORKOUTS
      );

      const workout = data.suggestions as SuggestedWorkouts[];
      set({ suggestedWorkouts: workout });
    } catch (err) {
      if (extractErrorMessage(err).message === "NO_WORKOUTS_FOUND") {
        set({ suggestedWorkouts: [], error: null });
        return;
      }
      const error =
        err instanceof Error
          ? err
          : new Error("Getting suggested workouts failed");
      set({ error: error.message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getSuggestedNutrition: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiUtils.get<{ tips: unknown }>(
        ApiUrl.GET_AI_COACH_SUGGESTED_NUTRITION
      );

      const nutritions = data.tips as SuggestedNutrition[];
      set({ suggestedNutrition: nutritions });
    } catch (err) {
      if (extractErrorMessage(err).message === "NO_NUTRITION_FOUND") {
        set({ suggestedNutrition: [], error: null });
        return;
      }
      const error =
        err instanceof Error
          ? err
          : new Error("Getting suggested nutrition failed");
      set({ error: error.message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Méthode pour réinitialiser la conversation
  clearMessages: () => set({ messages: [] }),
}));
