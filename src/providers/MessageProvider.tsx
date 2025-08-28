// MessageContext.tsx
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import { getBaseMessage } from "../utils/error-handler";
import { Language, MessageCode } from "../types/message";
import { MessageContext } from "../context/MessageContext";
import { useTheme } from "../context/ThemeContext";

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getMessage = (
    code: MessageCode | null | undefined,
    variables: Record<string, string | number> = {},
    language: Language = "en"
  ) => {
    if (!code) {
      return "UNKNOWN_ERROR";
    }

    // Fallback to English if translation missing
    const baseMessage = getBaseMessage(language, code);

    let message = baseMessage;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
    return message;
  };

  const { theme: appTheme } = useTheme();

  const [currentLanguage, setCurrentLanguage] = React.useState<Language>("en");

  const showMessage = (
    code: MessageCode | null | undefined,
    variables: Record<string, string | number> = {},
    options: {
      language?: Language;
      toastId?: string | number;
      autoClose?: number | false;
    } = {}
  ) => {
    const { language = currentLanguage || "en", toastId, autoClose } = options;

    // Si le code est null ou undefined, utiliser un code d'erreur par défaut
    const effectiveCode = code || "UNKNOWN_ERROR";
    const message = getMessage(effectiveCode, variables, language);

    // Determine message type based on code
    if (
      effectiveCode.startsWith("STRIPE_") ||
      effectiveCode === "INSUFFICIENT_FUNDS"
    ) {
      toast.warn(message, { toastId, autoClose });
    } else if (
      effectiveCode === "UNKNOWN_ERROR" ||
      effectiveCode.startsWith("SERVER_") ||
      effectiveCode.startsWith("FAILED_") ||
      effectiveCode.endsWith("_ERROR")
    ) {
      toast.error(message, { toastId, autoClose });
    } else if (
      effectiveCode.endsWith("_SUCCESS") ||
      effectiveCode === "SUCCESS" ||
      effectiveCode.endsWith("_CREATED") ||
      effectiveCode.endsWith("_UPDATED")
    ) {
      toast.success(message, { toastId, autoClose });
    } else {
      toast.info(message, { toastId, autoClose });
    }
  };

  return (
    <MessageContext.Provider value={{ showMessage, getMessage }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={appTheme}
      />
      {children}
    </MessageContext.Provider>
  );
};
