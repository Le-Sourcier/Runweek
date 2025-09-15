// src/components/dashboard/widgets/TipOfTheDayWidget.tsx
import { FC, useEffect } from "react";
import { ZapIcon } from "lucide-react";
import Card from "../../ui/Card";
import { chatStore } from "../../../stores/userChatStore";

const MotivationOfTheDayWidget: FC = () => {
  const { motivation, getMotivation } = chatStore();

  useEffect(() => {
    getMotivation();
  }, [getMotivation]);

  if (!motivation) {
    return null;
  }

  return (
    <Card>
      <div className="p-1">
        <h4 className="text-md font-semibold text-card-foreground mb-3">
          Motivation du Jour
        </h4>
        <div className="flex items-start">
          <ZapIcon
            size={20}
            className="text-green-500 dark:text-green-400 mr-3 mt-1 flex-shrink-0"
          />
          <p className="text-sm text-card-foreground italic">
            {motivation.message}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MotivationOfTheDayWidget;
