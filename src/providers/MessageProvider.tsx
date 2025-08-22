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
    code: MessageCode,
    variables: Record<string, string | number> = {},
    language: Language = "en"
  ) => {
    // Fallback to English if translation missing
    const baseMessage = getBaseMessage(language, code);

    let message = baseMessage;
    for (const [key, value] of Object.entries(variables)) {
      message = message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
    return message;
  };
  const { theme: appTheme } = useTheme();

  // const { code: browserLanguageCode } = useBrowserLanguage();
  const [currentLanguage, setCurrentLanguage] = React.useState<Language>("en");

  // Déterminer la langue automatiquement basée sur le navigateur
  // React.useEffect(() => {
  //   const supportedLanguages: Language[] = ["en", "fr"];

  //   // Vérifier si la langue du navigateur est supportée
  //   if (
  //     browserLanguageCode &&
  //     supportedLanguages.includes(browserLanguageCode as Language)
  //   ) {
  //     setCurrentLanguage(browserLanguageCode as Language);
  //   } else {
  //     // Fallback vers l'anglais si la langue n'est pas supportée
  //     setCurrentLanguage("en");
  //   }
  // }, [browserLanguageCode]);

  const showMessage = (
    code: MessageCode,
    variables: Record<string, string | number> = {},
    options: {
      language?: Language;
      toastId?: string | number;
      autoClose?: number | false;
    } = {}
  ) => {
    const { language = currentLanguage || "en", toastId, autoClose } = options;
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
