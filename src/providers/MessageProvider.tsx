// MessageContext.tsx
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import { MESSAGE_MAPPINGS } from "../utils/utils";
import { Language, MessageCode } from "../types/message";
import { MessageContext } from "../context/MessageContext";
import { useTheme } from "../context/ThemeContext";

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getMessage = (
    code: MessageCode,
    variables: Record<string, string | number> = {},
    language: Language = "en"
  ) => {
    // Fallback to English if translation missing
    const baseMessage =
      MESSAGE_MAPPINGS[language][code] ||
      MESSAGE_MAPPINGS["en"][code] ||
      MESSAGE_MAPPINGS["en"].UNKNOWN_ERROR;

    let message = baseMessage;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
    return message;
  };
  const { theme: appTheme } = useTheme();

  const showMessage = (
    code: MessageCode,
    variables: Record<string, string | number> = {},
    options: {
      language?: Language;
      toastId?: string | number;
      autoClose?: number | false;
    } = {}
  ) => {
    const { language = "en", toastId, autoClose } = options;
    const message = getMessage(code, variables, language);

    // Determine message type based on code
    if (code.startsWith("STRIPE_") || code === "INSUFFICIENT_FUNDS") {
      toast.warn(message, { toastId, autoClose });
    } else if (
      code === "UNKNOWN_ERROR" ||
      code.startsWith("SERVER_") ||
      code.startsWith("FAILED_") ||
      code.endsWith("_ERROR")
    ) {
      toast.error(message, { toastId, autoClose });
    } else if (
      code.endsWith("_SUCCESS") ||
      code === "SUCCESS" ||
      code.endsWith("_CREATED") ||
      code.endsWith("_UPDATED")
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
