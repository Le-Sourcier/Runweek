import { MESSAGE_MAPPINGS } from "../utils/utils";

export type Language = keyof typeof MESSAGE_MAPPINGS;
export type MessageCode = keyof (typeof MESSAGE_MAPPINGS)["en"]; // Suppose que 'en' a tous les codes

export interface MessageContextType {
  showMessage: (
    code: MessageCode,
    variables?: Record<string, string | number>,
    options?: {
      language?: Language;
      toastId?: string | number;
      autoClose?: number | false;
    }
  ) => void;
  getMessage: (
    code: MessageCode,
    variables?: Record<string, string | number>,
    language?: Language
  ) => string;
}
