import React, { ReactNode, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { getBaseMessage } from "../utils/error-handler";
import { MessageCode } from "../types/message";
import { MessageContext } from "../context/MessageContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "./LanguageProvider";

interface ToastOptions {
  toastId?: string | number;
  autoClose?: number | false;
}

export const MessageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { currentLanguage: language } = useLanguage();
  const { theme } = useTheme();

  const getMessage = useCallback(
    (
      code: MessageCode | null | undefined,
      variables: Record<string, string | number> = {}
    ) => {
      if (!code) {
        return "UNKNOWN_ERROR";
      }

      const baseMessage = getBaseMessage(code, language);

      let message = baseMessage;
      for (const [key, value] of Object.entries(variables)) {
        message = message.replace(
          new RegExp(`\\{${key}\\}`, "g"),
          String(value)
        );
      }
      return message;
    },
    [language]
  );

  const showMessage = useCallback(
    (
      code: MessageCode | null | undefined,
      variables: Record<string, string | number> = {},
      options: ToastOptions = {}
    ) => {
      const effectiveCode = code || "UNKNOWN_ERROR";
      const message = getMessage(effectiveCode, variables);
      const { toastId, autoClose } = options;

      const messageType = (() => {
        if (
          effectiveCode.startsWith("STRIPE_") ||
          effectiveCode === "INSUFFICIENT_FUNDS"
        ) {
          return "warn";
        }
        if (
          effectiveCode === "UNKNOWN_ERROR" ||
          effectiveCode.startsWith("SERVER_") ||
          effectiveCode.startsWith("FAILED_") ||
          effectiveCode.endsWith("_ERROR")
        ) {
          return "error";
        }
        if (
          effectiveCode.endsWith("_SUCCESS") ||
          effectiveCode === "SUCCESS" ||
          effectiveCode.endsWith("_CREATED") ||
          effectiveCode.endsWith("_UPDATED")
        ) {
          return "success";
        }
        return "info";
      })();

      toast[messageType](message, { toastId, autoClose });
    },
    [getMessage]
  );

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
        theme={theme}
      />
      {children}
    </MessageContext.Provider>
  );
};
