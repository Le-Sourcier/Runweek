import { useState } from "react";
// import { useUser } from "../context/UserContext";
import Card from "../components/ui/Card";
import {
  Clock,
  Target,
  ArrowRight,
  Footprints,
  HeartPulse,
  Zap,
  ShieldCheck,
  TrendingUp,
  Lightbulb,
  Activity,
} from "lucide-react"; // Added new icons
import ChatInterface, {
  ChatMessage,
  Suggestion,
} from "../components/chat/ChatInterface";
// Removed motion import as it's not used after old chat UI removal, ChatInterface handles its own animations
// import { motion } from 'framer-motion';

// Mock data for coach tips
const coachTips = [
  {
    id: "t1",
    title: "Improve Your Cadence",
    description:
      "Aim for 170-180 steps per minute to optimize your running efficiency and reduce injury risk.",
    icon: "Zap", // Updated icon
  },
  {
    id: "t2",
    title: "Post-Run Recovery",
    description:
      "Try foam rolling within 30 minutes of long runs to help release tension in muscles and fascia.",
    icon: "ShieldCheck", // Updated icon
  },
  {
    id: "t3",
    title: "Hill Training",
    description:
      "Include hill repeats in your weekly routine to build strength and improve your form on flat terrain.",
    icon: "TrendingUp",
  },
];

// Mock data for training plans
const trainingPlans = [
  {
    id: "p1",
    title: "5K Improvement Plan",
    duration: "8 weeks",
    level: "Intermediate",
    description:
      "Structured plan to help you improve your 5K time with a mix of speed work and endurance training.",
  },
  {
    id: "p2",
    title: "Half Marathon Build-Up",
    duration: "12 weeks",
    level: "Intermediate to Advanced",
    description:
      "Progressive plan to prepare you for a half marathon with long runs, tempo sessions, and recovery days.",
  },
  {
    id: "p3",
    title: "Recovery & Injury Prevention",
    duration: "4 weeks",
    level: "All Levels",
    description:
      "Focus on proper recovery techniques, strength training, and mobility work to prevent injuries.",
  },
];

export default function Coach() {
  // const { user } = useUser();
  // const [query, setQuery] = useState(''); // Removed old query state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    // Renamed and typed state
    {
      id: "init-" + Date.now(),
      text: "Hi there! I'm your running coach AI. How can I help you today with your training?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false); // Added AI typing state

  const handleSendMessage = async (messageText: string) => {
    // Updated signature
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsAiTyping(true);

    // Simulate coach response
    setTimeout(() => {
      let responseText = "";
      if (messageText.toLowerCase().includes("half marathon")) {
        responseText =
          "For half marathon training, I recommend focusing on building your long run each week. Based on your recent activities, you should aim for a 14km long run this weekend, with two shorter runs during the week. Make sure to include a recovery day after your long run.";
      } else if (messageText.toLowerCase().includes("pace")) {
        responseText =
          "Your current average pace is 5:32 min/km. To improve, try incorporating tempo runs once a week, where you run at a comfortably hard pace (about 5:10 min/km) for 20-30 minutes after a warm-up.";
      } else if (
        messageText.toLowerCase().includes("injury") ||
        messageText.toLowerCase().includes("pain")
      ) {
        responseText =
          "I notice you're concerned about injury. It's always important to listen to your body. Make sure you're warming up properly before runs, and consider adding strength training 2 days per week to build resilience. If pain persists, please consult a healthcare professional.";
      } else {
        responseText =
          "Based on your recent running data, I'd suggest focusing on consistency this week. Try for 3-4 runs with at least one day of rest between harder efforts. Your endurance is improving nicely, and we should capitalize on that momentum.";
      }

      const aiMessage: ChatMessage = {
        id: "ai-" + Date.now(),
        text: responseText,
        sender: "ai",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      setIsAiTyping(false);
    }, 1000);

    // setQuery(''); // Removed, ChatInterface handles its own input
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const userMessage: ChatMessage = {
      id: "user-suggestion-" + Date.now(),
      text: suggestion.text,
      sender: "user",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsAiTyping(true);

    // Simulate AI response based on suggestion
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: "ai-suggestion-response-" + Date.now(),
        text: `Regarding "${suggestion.text}", let's explore that. (This is a demo AI response for suggestions)`,
        sender: "ai",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiResponse]);
      setIsAiTyping(false);
    }, 1000);
  };

  const handleTalkToHumanClick = () => {
    const systemMessage: ChatMessage = {
      id: "system-" + Date.now(),
      text: "Talk to Human requested. An expert will be notified (demo).",
      sender: "system",
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, systemMessage]);
    console.log("Talk to human requested from main Coach page.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Coach</h1>
        <p className="text-gray-600">
          Get personalized training advice and running tips
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coach chat */}
        <Card className="lg:col-span-8 p-0 flex flex-col h-[600px] overflow-hidden">
          {" "}
          {/* Added overflow-hidden */}
          {/* ChatInterface will fill this card */}
          <ChatInterface
            initialMessages={chatMessages}
            onSendMessage={handleSendMessage}
            suggestionChips={[
              { id: "s1", text: "What was my average pace last week?" },
              { id: "s2", text: "Suggest a workout for today." },
              { id: "s3", text: "How to prevent shin splints?" },
            ]}
            onSuggestionClick={handleSuggestionClick}
            onTalkToHumanClick={handleTalkToHumanClick}
            isLoadingAiResponse={isAiTyping}
            // className="h-full" is default and should work with parent's h-[600px] and flex-col
          />
        </Card>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coach insights */}
          <Card title="Weekly Focus">
            {/* Updated styling for Weekly Focus main section */}
            <div className="border-l-4 border-green-500 bg-green-50/50 pl-3 py-3 pr-2 rounded-r-md flex items-start gap-3">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-green-500 shrink-0 border border-green-200">
                <Target size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200">
                  Building Base Endurance
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  This week, focus on easy runs to build your aerobic base. Keep
                  your heart rate below 75% of your max.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                Suggested Workouts
              </h4>
              <div className="space-y-3">
                {/* Suggested Workout Item 1 */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <Footprints
                    size={18}
                    className="text-blue-500 dark:text-blue-400"
                  />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-200">
                      Easy Run
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      5-6 km at conversational pace
                    </p>
                  </div>
                </div>
                {/* Suggested Workout Item 2 */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <Footprints
                    size={18}
                    className="text-green-500 dark:text-green-400"
                  />{" "}
                  {/* Changed to Footprints for consistency, could be specific for long run if desired */}
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-200">
                      Long Run
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      10-12 km at easy pace
                    </p>
                  </div>
                </div>
                {/* Suggested Workout Item 3 */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <HeartPulse
                    size={18}
                    className="text-red-500 dark:text-red-400"
                  />
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-200">
                      Recovery
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      3-4 km very easy + strength
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Training plans */}
          <Card title="Training Plans">
            <div className="space-y-3">
              {trainingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-3 border dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                      {plan.title}
                    </h4>
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300 px-2 py-0.5 text-xs rounded-full font-medium">
                      {plan.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2">
                    {plan.description}
                  </p>
                  <button className="group mt-2 text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center gap-1">
                    <span className="group-hover:underline">View plan</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Running tips */}
      <Card title="Coach Tips">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coachTips.map((tip) => (
            <div
              key={tip.id}
              className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:border-primary-400/50 transition-all flex flex-col" // Added flex flex-col for consistent height if needed
            >
              <div className="h-10 w-10 bg-primary-100 dark:bg-primary-700/20 rounded-full flex items-center justify-center text-primary dark:text-primary-400 mb-3 shrink-0">
                {tip.icon === "Zap" && <Zap size={20} />}
                {tip.icon === "ShieldCheck" && <ShieldCheck size={20} />}
                {tip.icon === "TrendingUp" && <TrendingUp size={20} />}
                {tip.icon === "Clock" && <Clock size={20} />}{" "}
                {/* Default/fallback */}
                {tip.icon === "Activity" && <Activity size={20} />}{" "}
                {/* Default/fallback */}
                {tip.icon === "Lightbulb" && <Lightbulb size={20} />}{" "}
                {/* Default/fallback */}
                {
                  ![
                    "Zap",
                    "ShieldCheck",
                    "TrendingUp",
                    "Clock",
                    "Activity",
                    "Lightbulb",
                  ].includes(tip.icon) && (
                    <Lightbulb size={20} />
                  ) /* Fallback for any other unspecified icon */
                }
              </div>
              <h4 className="font-medium mb-1 text-gray-800 dark:text-gray-100">
                {tip.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">
                {tip.description}
              </p>{" "}
              {/* Added flex-grow to make text take available space */}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
