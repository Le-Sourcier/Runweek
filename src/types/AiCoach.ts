export type MessageType = "text" | "recommendation" | "advice";

export type Message = {
  id?: string;
  type: MessageType;
  message: string;
  sender: "bot" | "user" | "system";
  createdAt?: string;
};

export interface TrainingPlan {
  id: string;
  title: string;
  duration: string;
  level: string;
  description: string;
}

export interface MotivationalText {
  title: string;
  description: string;
}
export interface SuggestedWorkouts {
  id: string;
  type: string;
  duration: string;
  description: string;
  icon: string;
  intensity: string;
}

export interface SuggestedNutrition {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  initialMessage: Message;
  trainingPlans: TrainingPlan[];
  motivationalText?: MotivationalText;
  suggestedWorkouts: SuggestedWorkouts[];
  suggestedNutrition: SuggestedNutrition[];
  sendMessage: (content: string) => Promise<Message>;
  getMessages: () => Promise<void>;
  clearMessages: () => void;
  getTrainingPlans: () => Promise<void>;
  getSuggestedWorkouts: () => Promise<void>;
  getSuggestedNutrition: () => Promise<void>;
}
