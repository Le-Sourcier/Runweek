import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Language } from "../types/message";

export default function BrowserLanguage() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Détecter la langue du navigateur
    const browserLanguage = navigator.language as Language;
    const languageCode = browserLanguage.split("-")[0];

    // Changer la langue de l'application si supportée
    const supportedLanguages = [...browserLanguage]; // Vos langues supportées
    if (supportedLanguages.includes(languageCode)) {
      i18n.changeLanguage(languageCode);
    }
  }, [i18n]);

  return null;
}
