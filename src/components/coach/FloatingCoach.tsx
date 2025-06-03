import React, { useState, useEffect } from "react"; // Added useState, useEffect
import { motion, AnimatePresence } from "framer-motion";
import { useFloatingCoach } from "../../context/FloatingCoachContext";
import {
  Bot,
  X,
  ChevronsLeftRight as PositionIcon,
  EyeOff,
} from "lucide-react"; // Added EyeOff
import ChatInterface, { ChatMessage, Suggestion } from "../chat/ChatInterface"; // Import ChatInterface and types

const FloatingCoach: React.FC = () => {
  const {
    isCoachPanelOpen,
    coachPosition,
    // toggleCoachPanelOpen, // Not directly used, open/close are more explicit
    setCoachPosition,
    closeCoachPanel,
    openCoachPanel,
    deactivateFloatingCoach,
  } = useFloatingCoach();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  useEffect(() => {
    if (isCoachPanelOpen && messages.length === 0) {
      setMessages([
        {
          id: "ai-greeting-" + Date.now(),
          text: "Hello! I'm your AI Coach. How can I help you today?",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    }
    // Do not clear messages when panel closes, so history is preserved for the session
    // If panel closes and coach is deactivated, messages will clear when FloatingCoach unmounts (if state is local)
    // or if explicitly cleared by context. For now, local state means they persist while FloatingCoach is mounted.
  }, [isCoachPanelOpen]); // Removed messages from dependency array to prevent re-triggering on new messages

  const handleSendMessage = async (messageText: string) => {
    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsAiTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: "ai-" + Date.now(),
        text: `I'm just a demo AI, but I received: "${messageText}"`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const userMessage: ChatMessage = {
      id: "user-suggestion-" + Date.now(),
      text: suggestion.text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsAiTyping(true);

    // Simulate AI response to suggestion
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: "ai-suggestion-response-" + Date.now(),
        text: `Okay, let's talk about "${suggestion.text}". (This is a demo response)`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleTalkToHumanClick = () => {
    const systemMessage: ChatMessage = {
      id: "system-" + Date.now(),
      text: "Talk to human requested. Someone will be with you shortly (this is a demo).",
      sender: "system",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMessage]);
    console.log("Talk to human requested from floating coach.");
    // Potentially close the panel or change UI to indicate waiting for human
  };

  const mockSuggestions: Suggestion[] = [
    { id: "s1", text: "What are my goals?" },
    { id: "s2", text: "How was my last run?" },
    { id: "s3", text: "Suggest a workout." },
  ];

  const positionClasses =
    coachPosition === "bottom-right"
      ? "bottom-4 right-4 items-end"
      : "bottom-4 left-4 items-start";

  const panelVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeIn" },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 30,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const fabVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.3 } }, // Delay to show after panel closes
    exit: { opacity: 0, scale: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      layout // Added layout prop for smooth position animation
      transition={{ type: "spring", stiffness: 300, damping: 30 }} // Optional: customize the spring
      className={`fixed z-50 flex flex-col ${positionClasses}`}
      // This outer div will be controlled by isFloatingCoachActive in Layout.tsx
      // So, its own animation can be simpler or part of a group animation there.
      // For now, let's ensure it's present for layout.
    >
      <AnimatePresence>
        {isCoachPanelOpen && (
          <motion.div
            className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-80 h-96 flex flex-col overflow-hidden"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-sm text-foreground">
                Coach AI
              </h3>
              <div className="flex items-center gap-0.5">
                {" "}
                {/* Adjusted gap for potentially more buttons */}
                <motion.button
                  title="Hide Coach"
                  onClick={deactivateFloatingCoach}
                  className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Deactivate floating coach"
                  whileTap={{ scale: 0.9 }}
                >
                  <EyeOff size={16} />
                </motion.button>
                <motion.button
                  title="Move Coach"
                  onClick={() =>
                    setCoachPosition(
                      coachPosition === "bottom-left"
                        ? "bottom-right"
                        : "bottom-left"
                    )
                  }
                  className="p-1.5 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle coach position"
                  whileTap={{ scale: 0.9 }}
                >
                  <PositionIcon size={16} />
                </motion.button>
                <motion.button
                  title="Close Panel"
                  onClick={closeCoachPanel}
                  className="p-1.5 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close coach panel"
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden">
              {" "}
              {/* Changed to overflow-hidden as ChatInterface handles its own scroll */}
              <ChatInterface
                initialMessages={messages} // Pass the messages state
                onSendMessage={handleSendMessage}
                suggestionChips={mockSuggestions}
                onSuggestionClick={handleSuggestionClick}
                onTalkToHumanClick={handleTalkToHumanClick}
                isLoadingAiResponse={isAiTyping}
                // className="h-full" is default in ChatInterface, should fill this flex-1 container
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isCoachPanelOpen && (
          <motion.button
            onClick={openCoachPanel} // Use openCoachPanel to ensure coach becomes active if it wasn't
            className="mt-3 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 ease-in-out hover:scale-[1.05] active:scale-[0.95]"
            variants={fabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-label="Open AI Coach"
            // whileHover & whileTap removed to rely on Tailwind class animations for consistency
          >
            <Bot size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingCoach;
