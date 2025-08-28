import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion"
import Card from "../../../components/ui/Card";
import { Check, Save } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useUserContext } from "../../../hooks/useUser";
import { toast } from "react-toastify";
import { useLanguage } from "../../../providers/LanguageProvider";
import { Language } from "../../../types/message";

export const LanguageTab: FC = () => {

  const { user, updateUserPreferences } = useUserContext();
  const { setLanguage } = useLanguage();

  const [languageForm, setLanguageForm] = useState({
    language: user?.preferences?.language || 'fr',
    region: user?.preferences?.region || 'FR',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  });

  // Initialize forms when user data changes
  useEffect(() => {
    if (user) {

      setLanguageForm({
        language: user.preferences?.language || 'fr',
        region: user.preferences?.region || 'FR',
        // @ts-ignore
        timezone: user.preferences?.timezone || 'Europe/Paris',
        // @ts-ignore
        dateFormat: user.preferences?.dateFormat || 'DD/MM/YYYY',
        // @ts-ignore
        timeFormat: user.preferences?.timeFormat || '24h',
      });
    }
  }, [user]);

  const regions = [
    { code: 'FR', name: 'France', currency: 'EUR' },
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'DE', name: 'Germany', currency: 'EUR' },
  ];

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', enabled: true },
    { code: 'en', name: 'English', flag: '🇺🇸', enabled: true },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  ];

  const handleLanguageUpdate = () => {    
    setLanguage(languageForm.language as Language);
    // @ts-ignore
    updateUserPreferences({
      ...user?.preferences,
      ...languageForm,
    });
    toast.success('Paramètres de langue et région mis à jour');
  };

  return <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    <Card title="Langue et région" className="bg-card text-card-foreground border-border">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Langue</label>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  disabled={!lang.enabled}
                  onClick={() => setLanguageForm(prev => ({ ...prev, language: lang.code }))}
                  className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${languageForm.language === lang.code
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                    } ${!lang.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {languageForm.language === lang.code && (
                    <Check size={16} className="ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Région</label>
            <div className="space-y-2">
              {regions.map((region) => (
                <button
                  key={region.code}
                  onClick={() => setLanguageForm(prev => ({ ...prev, region: region.code }))}
                  className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${languageForm.region === region.code
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <span className="font-medium">{region.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{region.currency}</span>
                    {languageForm.region === region.code && (
                      <Check size={16} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h4 className="font-medium mb-4 text-foreground">Formats</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Fuseau horaire</label>
              <select
                value={languageForm.timezone}
                onChange={(e) => setLanguageForm(prev => ({ ...prev, timezone: e.target.value }))}
                className="input w-full"
              >
                <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                <option value="Australia/Sydney">Australia/Sydney (GMT+11)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Format de date</label>
              <select
                value={languageForm.dateFormat}
                onChange={(e) => setLanguageForm(prev => ({ ...prev, dateFormat: e.target.value }))}
                className="input w-full"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Format d'heure</label>
              <select
                value={languageForm.timeFormat}
                onChange={(e) => setLanguageForm(prev => ({ ...prev, timeFormat: e.target.value }))}
                className="input w-full"
              >
                <option value="24h">24 heures</option>
                <option value="12h">12 heures (AM/PM)</option>
              </select>
            </div>
          </div>
        </div>

        <Button onClick={handleLanguageUpdate} className="w-full md:w-auto">
          <Save size={16} className="mr-2" />
          Sauvegarder les paramètres
        </Button>
      </div>
    </Card>
  </motion.div>
}