import React from "react";
import { toast, ToastContainer } from "react-toastify";
import { getBaseMessage } from "../utils/error-handler";
import { MessageCode } from "../types/message";
import { MessageContext } from "../context/MessageContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "./LanguageProvider";

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize language from localStorage or system language
  const { currentLanguage: language } = useLanguage();

  const getMessage = (
    code: MessageCode | null | undefined,
    variables: Record<string, string | number> = {},
  ) => {
    if (!code) {
      return "UNKNOWN_ERROR";
    }

    // Fallback to English if translation missing
    const baseMessage = getBaseMessage(code, language);

    let message = baseMessage;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
    return message;
  };

  const { theme: appTheme } = useTheme();

  const showMessage = (
    code: MessageCode | null | undefined,
    variables: Record<string, string | number> = {},
    options: {
      toastId?: string | number;
      autoClose?: number | false;
    } = {}
  ) => {
    const { toastId, autoClose } = options;

    // Si le code est null ou undefined, utiliser un code d'erreur par défaut
    const effectiveCode = code || "UNKNOWN_ERROR";
    // @ts-ignore
    const message = getMessage(effectiveCode, variables);

    // Determine message type based on code
    if (
      effectiveCode.startsWith("STRIPE_") ||
      // @ts-ignore
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
      // @ts-ignore
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