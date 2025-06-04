// src/components/dashboard/widgets/TipOfTheDayWidget.tsx
import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';

const tips = [
  "N'oubliez pas de vous hydrater tout au long de la journée !",
  "Une petite marche de 10 minutes peut booster votre énergie.",
  "L'échauffement est crucial avant chaque séance d'exercice.",
  "Variez vos entraînements pour solliciter différents groupes musculaires.",
  "Un bon sommeil est aussi important que l'exercice pour la récupération.",
  "Fixez-vous des objectifs réalistes et célébrez vos progrès.",
  "Écoutez votre corps et accordez-lui du repos lorsque c'est nécessaire."
];

const TipOfTheDayWidget: React.FC = () => {
  const [tip, setTip] = useState('');

  useEffect(() => {
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  return (
    <div className="p-1"> {/* Reduced padding as Card already has it */}
      <h4 className="text-md font-semibold text-card-foreground mb-3">Conseil du Jour</h4>
      <div className="flex items-start">
        <Lightbulb size={20} className="text-yellow-500 dark:text-yellow-400 mr-3 mt-1 flex-shrink-0" />
        <p className="text-sm text-card-foreground italic">{tip}</p>
      </div>
    </div>
  );
};

export default TipOfTheDayWidget;
