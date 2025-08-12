// MessageContext.tsx
import { createContext } from "react";
import { MessageContextType } from "../types/message";

export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
);
