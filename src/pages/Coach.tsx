import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import {
  Clock,
  Target,
  ArrowRight,
  Zap,
  ShieldCheck,
  TrendingUp,
  Lightbulb,
  Activity,
  CheckCircle,
  CalendarDaysIcon,
  Footprints,
  HeartPulse,
  Calendar,
  Trophy,
} from "lucide-react";
import ChatInterface, { Suggestion } from "../components/chat/ChatInterface";
import { Advices, Message } from "../types/AiCoach";
import { toast } from "react-toastify";
import { chatStore } from "../stores/userChatStore";

// Types pour les entraînements
interface Workout {
  id: string;
  type: string;
  description: string;
  icon: string | React.ReactNode;
  duration?: string;
  distance?: string;
  difficulty?: string;
}

// Composant pour l'affichage d'un entraînement
const WorkoutCard = ({
  workout,
  isCompleted,
  onAddToCalendar,
  onCompleteWorkout,
}: {
  workout: Workout;
  isCompleted: boolean;
  onAddToCalendar: (workout: Workout) => void;
  onCompleteWorkout: (workoutId: string, workoutType: string) => void;
}) => {
  const getWorkoutIcon = (icon: string | React.ReactNode) => {
    if (typeof icon !== "string") return icon;

    const iconMap: { [key: string]: React.ReactNode } = {
      running: <Footprints size={20} className="text-blue-500" />,
      recovery: <HeartPulse size={20} className="text-green-500" />,
      cardio: <Activity size={20} className="text-red-500" />,
      default: <Activity size={20} className="text-gray-500" />,
    };

    return iconMap[icon] || iconMap.default;
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
        isCompleted
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary/50 dark:hover:border-primary-400"
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 text-xl">
        {getWorkoutIcon(workout.icon)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4
            className={`font-semibold truncate ${
              isCompleted
                ? "text-green-700 dark:text-green-300 line-through"
                : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {workout.type}
          </h4>
          {isCompleted && (
            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {workout.description}
        </p>

        {/* Metadata */}
        {(workout.duration || workout.distance) && (
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mt-2">
            {workout.duration && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {workout.duration}
              </span>
            )}
            {workout.distance && (
              <span className="flex items-center gap-1">
                <Footprints size={12} />
                {workout.distance}
              </span>
            )}
            {workout.difficulty && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  workout.difficulty === "easy"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : workout.difficulty === "moderate"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {workout.difficulty}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0">
        {!isCompleted ? (
          <>
            <button
              onClick={() => onAddToCalendar(workout)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors rounded-lg"
              title="Ajouter au calendrier"
            >
              <Calendar size={16} />
            </button>
            <button
              onClick={() => onCompleteWorkout(workout.id, workout.type)}
              className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors rounded-lg"
              title="Marquer comme terminé"
            >
              <CheckCircle size={16} />
            </button>
          </>
        ) : (
          <Trophy size={16} className="text-green-500" />
        )}
      </div>
    </div>
  );
};

// Composant pour l'état vide
const EmptyState = ({
  icon: Icon = CalendarDaysIcon,
  message,
  subtitle,
}: {
  icon?: React.ComponentType<any>;
  message: string;
  subtitle?: string;
}) => (
  <div className="text-center py-8">
    <Icon size={32} className="mx-auto text-muted-foreground mb-3 opacity-60" />
    <p className="text-muted-foreground font-medium mb-1">{message}</p>
    {subtitle && <p className="text-sm text-muted-foreground/70">{subtitle}</p>}
  </div>
);

export default function Coach() {
  const {
    messages,
    getMessages,
    trainingPlans,
    suggestedNutrition,
    sendMessage: sendChatMessageToStore,
    advices,
    getTrainingPlans,
    suggestedWorkouts,
    getSuggestedWorkouts,
    getSuggestedNutrition,
  } = chatStore();
  const [currentAdvice, setCurrentAdvice] = useState<Advices | null>(null);

  const [chatMessages, setChatMessages] = useState<Message[]>(messages);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(
    new Set()
  );
  const [failedMessages, setFailedMessages] = useState<Map<string, string>>(
    new Map()
  );
  const [completedWorkouts, setCompletedWorkouts] = useState<Set<string>>(
    new Set()
  );

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

  const weeklyFocus = {
    title: currentAdvice?.title || "Planification de la semaine",
    description:
      currentAdvice?.description ||
      "Commencez par compléter vos entraînements suggérés",
    progress: completedWorkouts.size,
    total: suggestedWorkouts.length,
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadMessages(),
        getTrainingPlans(),
        getSuggestedWorkouts(),
        getSuggestedNutrition(),
      ]);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    }
  };

  const loadMessages = async () => {
    await getMessages();
    setChatMessages(chatStore.getState().messages);
  };

  const processMessageSend = async (messageText: string, messageId: string) => {
    try {
      const aiResponseData = await sendChatMessageToStore(messageText);

      setPendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });

      const responseText =
        aiResponseData.message || "Réponse reçue du serveur.";
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "text",
        message: responseText,
        sender: "bot",
        createdAt: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
      setIsAiTyping(false);
    } catch (error) {
      setPendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });

      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      setFailedMessages(
        (prev) => new Map([...prev, [messageId, errorMessage]])
      );
      setIsAiTyping(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const messageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: messageId,
      type: "text",
      message: messageText,
      sender: "user",
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setPendingMessages((prev) => new Set([...prev, messageId]));
    setIsAiTyping(true);

    // Timeout pour les messages en attente
    setTimeout(() => {
      setPendingMessages((prev) => {
        if (prev.has(messageId)) {
          const newSet = new Set(prev);
          newSet.delete(messageId);
          setFailedMessages(
            (prevFailed) =>
              new Map([
                ...prevFailed,
                [messageId, "Timeout - Message non envoyé après 5 minutes"],
              ])
          );
          return newSet;
        }
        return prev;
      });
    }, 5 * 60 * 1000);

    await processMessageSend(messageText, messageId);
  };

  const handleRetryMessage = (messageId: string) => {
    const originalMessage = chatMessages.find((msg) => msg.id === messageId);
    if (!originalMessage) return;

    setFailedMessages((prev) => {
      const newMap = new Map(prev);
      newMap.delete(messageId);
      return newMap;
    });
    setPendingMessages((prev) => new Set([...prev, messageId]));
    setIsAiTyping(true);

    processMessageSend(originalMessage.message, messageId);
  };

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    const userMessage: Message = {
      id: `user-suggestion-${Date.now()}`,
      type: "text",
      message: suggestion.text,
      sender: "user",
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsAiTyping(true);

    await processMessageSend(suggestion.text, suggestion.id).then(() =>
      setIsAiTyping(false)
    );
  };

  const handleTalkToHumanClick = () => {
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      type: "text",
      message:
        "Demande de contact avec un expert enregistrée. Un coach vous contactera rapidement.",
      sender: "system",
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, systemMessage]);
    toast.info("Un expert sera notifié de votre demande");
  };

  const handleCompleteWorkout = (workoutId: string, workoutType: string) => {
    if (completedWorkouts.has(workoutId)) {
      toast.info(`${workoutType} déjà marqué comme terminé`);
      return;
    }

    setCompletedWorkouts((prev) => new Set([...prev, workoutId]));
    toast.success(`${workoutType} terminé ! Excellent travail ! 🎉`);
  };

  const handleAddToCalendar = (workout: Workout) => {
    toast.success(`${workout.type} ajouté au calendrier`);
    // Ici vous pourriez intégrer avec l'API calendrier
  };

  const getCompletionPercentage = () => {
    if (weeklyFocus.total === 0) return 0;
    return Math.round((weeklyFocus.progress / weeklyFocus.total) * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Coach IA
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Recevez des conseils d'entraînement personnalisés et des astuces de
          course
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interface de chat */}
        <Card className="lg:col-span-8 p-0 flex flex-col h-[600px] overflow-hidden">
          <ChatInterface
            initialMessages={chatMessages}
            onSendMessage={handleSendMessage}
            suggestionChips={[
              {
                id: "s1",
                text: "Quelle était ma vitesse moyenne la semaine dernière ?",
              },
              { id: "s2", text: "Suggérez un entraînement pour aujourd'hui" },
              { id: "s3", text: "Comment prévenir les périostites ?" },
            ]}
            onSuggestionClick={handleSuggestionClick}
            onTalkToHumanClick={handleTalkToHumanClick}
            isLoadingAiResponse={isAiTyping}
            pendingMessages={pendingMessages}
            failedMessages={failedMessages}
            onRetryMessage={handleRetryMessage}
          />
        </Card>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Focus de la semaine */}
          <Card title="Focus de la Semaine">
            <div
              className={`border-l-4 pl-4 py-3 pr-2 rounded-r-md flex items-start gap-3
              ${
                suggestedWorkouts.length === 0
                  ? "border-gray-400 bg-gray-50 dark:bg-gray-800/40"
                  : "border-green-500 bg-green-50/50 dark:bg-green-900/20"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border
                ${
                  suggestedWorkouts.length === 0
                    ? "bg-white text-gray-500 border-gray-300"
                    : "bg-white text-green-500 border-green-200"
                }`}
              >
                <Target size={20} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    {weeklyFocus.title}
                  </h4>
                  {suggestedWorkouts.length > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full
                      ${
                        suggestedWorkouts.length === 0
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          : "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300"
                      }`}
                    >
                      {weeklyFocus.progress}/{weeklyFocus.total}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {weeklyFocus.description}
                </p>

                {suggestedWorkouts.length > 0 && (
                  <>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getCompletionPercentage()}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {getCompletionPercentage()}% complété
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                  Entraînements Suggérés
                </h4>
                {suggestedWorkouts.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {weeklyFocus.progress} sur {weeklyFocus.total} terminés
                  </span>
                )}
              </div>

              {suggestedWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {suggestedWorkouts.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      isCompleted={completedWorkouts.has(workout.id)}
                      onAddToCalendar={handleAddToCalendar}
                      onCompleteWorkout={handleCompleteWorkout}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarDaysIcon}
                  message="Aucun entraînement suggéré"
                  subtitle="Le coach vous proposera bientôt des entraînements personnalisés"
                />
              )}
            </div>
          </Card>

          {/* Plans d'entraînement */}
          <Card title="Plans d'Entraînement">
            {trainingPlans.length > 0 ? (
              <div className="space-y-3">
                {trainingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-sm transition-all bg-white dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                        {plan.title}
                      </h4>
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300 px-2 py-1 text-xs rounded-full font-medium">
                        {plan.duration}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {plan.description}
                    </p>

                    <button className="group text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center gap-1 hover:underline">
                      <Link to={`/training-plan/${plan.id}`}>Voir le plan</Link>
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Target}
                message="Aucun plan disponible"
                subtitle="Des plans d'entraînement seront bientôt suggérés"
              />
            )}
          </Card>
        </div>
      </div>

      {/* Conseils du coach */}
      <Card title="Conseils du Coach">
        {suggestedNutrition.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedNutrition.map((tip) => {
              const iconMap: { [key: string]: React.ReactNode } = {
                Zap: <Zap size={20} className="text-yellow-500" />,
                ShieldCheck: (
                  <ShieldCheck size={20} className="text-green-500" />
                ),
                TrendingUp: <TrendingUp size={20} className="text-blue-500" />,
                Clock: <Clock size={20} className="text-gray-500" />,
                Activity: <Activity size={20} className="text-red-500" />,
                Lightbulb: <Lightbulb size={20} className="text-purple-500" />,
              };

              return (
                <div
                  key={tip.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:border-primary-400/50 transition-all bg-white dark:bg-gray-800"
                >
                  <div className="h-12 w-12 bg-primary-100 dark:bg-primary-700/20 rounded-full flex items-center justify-center mb-3">
                    {iconMap[tip.icon] || (
                      <Lightbulb size={20} className="text-primary-500" />
                    )}
                  </div>

                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    {tip.title}
                  </h4>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tip.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Lightbulb}
            message="Aucun conseil pour le moment"
            subtitle="Le coach vous préparera bientôt des conseils personnalisés"
          />
        )}
      </Card>
    </div>
  );
}
