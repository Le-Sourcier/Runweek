import React, { useEffect, useState } from "react";
import { Lightbulb, RefreshCw } from "lucide-react";
import Card from "../../ui/Card";
import MotivationOfTheDayWidget from "./MotivationOfTheDayWidget";
import { chatStore } from "../../../stores/userChatStore";
import { Advices } from "../../../types/AiCoach";

const TipOfTheDayWidget: React.FC = () => {
  const { getAdvices, advices, isLoading: loading, error } = chatStore();
  const [currentAdvice, setCurrentAdvice] = useState<Advices | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Charger les conseils au montage du composant
  useEffect(() => {
    const initAdvices = async () => {
      if (advices.length === 0) {
        await getAdvices();
      }
      selectRandomAdvice();
    };

    initAdvices();
  }, [getAdvices]);

  // Sélectionner un conseil aléatoire quand les conseils changent
  useEffect(() => {
    if (advices.length > 0) {
      selectRandomAdvice();
    }
  }, [advices]);

  const selectRandomAdvice = () => {
    if (advices.length > 0) {
      const randomIndex = Math.floor(Math.random() * advices.length);
      setCurrentAdvice(advices[randomIndex]);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await getAdvices();
      selectRandomAdvice();
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des conseils:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading && advices.length === 0) {
    return (
      <div className="mb-8">
        <Card className="mb-5">
          <div className="p-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
              <div className="flex items-start">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 mt-1"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <MotivationOfTheDayWidget />
      </div>
    );
  }

  if (error && advices.length === 0) {
    return (
      <div className="mb-8">
        <Card className="mb-5">
          <div className="p-4">
            <div className="text-center text-red-500 dark:text-red-400">
              <p>Erreur lors du chargement des conseils</p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Réessayer
              </button>
            </div>
          </div>
        </Card>
        <MotivationOfTheDayWidget />
      </div>
    );
  }

  if (!currentAdvice) {
    return (
      <div className="mb-8">
        <Card className="mb-5">
          <div className="p-4">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>Aucun conseil disponible pour le moment</p>
            </div>
          </div>
        </Card>
        <MotivationOfTheDayWidget />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <Card className="mb-5">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold text-card-foreground">
              Conseil du Jour
            </h4>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Changer de conseil"
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </button>
          </div>

          <div className="flex items-start">
            <Lightbulb
              size={20}
              className="text-yellow-500 dark:text-yellow-400 mr-3 mt-1 flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm text-card-foreground italic mb-2">
                {currentAdvice.description}
              </p>

              {currentAdvice.actionSteps &&
                currentAdvice.actionSteps.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-card-foreground mb-2">
                      Étapes à suivre :
                    </p>
                    <ul className="text-xs text-card-foreground/80 space-y-1">
                      {currentAdvice.actionSteps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-500 dark:text-yellow-400 mr-2">
                            •
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {currentAdvice.category && (
                <div className="mt-3">
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                    {currentAdvice.category}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      <MotivationOfTheDayWidget />
    </div>
  );
};

export default TipOfTheDayWidget;
