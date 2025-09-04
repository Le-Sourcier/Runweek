export type MessageType = "text" | "recommendation" | "advice"; // Orthographe corrigée

export type Message = {
  id?: string;
  type: MessageType;
  message: string; // Changé de 'reply' à 'content'
  sender: "bot" | "user" | "system";
  createdAt?: string; // Optionnel: date de création
};

export interface TrainingPlan {
  id: string;
  title: string;
  duration: string;
  level: string;
  description: string;
}

export interface ChatState {
  messages: Message[]; // Changé de 'message' à 'messages'
  isLoading: boolean;
  error: string | null;
  initialMessage: Message;
  trainingPlans: TrainingPlan[];
  sendMessage: (content: string) => Promise<Message>;
  getMessages: () => Promise<void>;
  clearMessages: () => void; // Nouvelle méthode
  getTrainingPlans: () => Promise<void>;
}
