import { createContext, FC, useContext, useEffect, useState } from 'react';
import { Language } from '../types/message';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const getSystemLanguage = (): Language => {
    const systemLang = navigator.language.split('-')[0] as Language;
    return ['en', 'fr', 'es', 'de'].includes(systemLang) ? systemLang : 'en';
  };

  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('userLanguage');
    return savedLanguage ? (savedLanguage as Language) : getSystemLanguage();
  });

  useEffect(() => {
    localStorage.setItem('userLanguage', currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (language: Language) => {
    console.log("Lg:", language);
    
    setCurrentLanguage(language);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};