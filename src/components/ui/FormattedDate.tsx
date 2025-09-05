import { useState, useEffect, FC } from 'react';
import { formatTimeUntil, formatTimeAgo, parseDate } from '../../utils/date-formatter';
import { Language } from '../../types/message';
import { toast } from 'react-toastify';
interface FormattedDateProps {
  date: string;
  locale?: Language;
  mode: 'full' | 'relative';
}

const FormattedDate: FC<FormattedDateProps> = ({ date, locale = 'fr', mode }) => {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    const formatDate = async () => {
      try {
        if (mode === 'full') {
          const result = await parseDate(date, undefined, locale);
          setFormattedDate(result);
        } else if (mode === 'relative') {
          const dateObj = new Date(date);
          if (dateObj < new Date()) {
            const result = await formatTimeAgo(date, locale);
            setFormattedDate(result);
          } else {
            const result = await formatTimeUntil(date, locale);
            setFormattedDate(result);
          }
        }
      } catch (error) {
        console.error("Erreur lors du formatage de la date:", error);
        toast.error("Erreur lors du formatage de la date");
        // Gérer l'erreur, par exemple en affichant une date par défaut
        setFormattedDate(date);
      }
    };

    formatDate();
  }, [date, locale, mode]); // Le hook se redéclenchera si ces props changent

  // Affiche une chaîne vide ou un placeholder pendant le chargement
  if (!formattedDate) {
    return null; // Ou un spinner de chargement : <span>Chargement...</span>
  }

  return (
    <time dateTime={date}>
      {formattedDate}
    </time>
  );
};

export default FormattedDate;
