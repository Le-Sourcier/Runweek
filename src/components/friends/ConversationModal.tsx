import React, { useState, useEffect, useRef } from "react";
import { DraggableModal } from "../ui/Modal";
import Button from "../ui/Button";
import { Send, Smile, Phone, Video, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Friend } from "../../types/friends";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
  type: "text" | "emoji" | "system";
}

interface Conversation {
  id: string;
  participants: string[];
  friendName: string;
  friendImage: string;
  lastMessage: Message | null;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Friend | null;
  onSendMessage: (friendId: string, message: string) => void;
}

const ConversationModal: React.FC<ConversationModalProps> = ({
  isOpen,
  onClose,
  friend,
  onSendMessage,
}) => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const emojis = [
    "😊",
    "😂",
    "👍",
    "❤️",
    "🔥",
    "💪",
    "🏃‍♂️",
    "🎉",
    "👏",
    "⚡",
    "🎯",
    "🏆",
  ];

  // Charger ou créer la conversation
  useEffect(() => {
    if (!friend) {
      return;
    }

    if (isOpen) {
      const conversations = JSON.parse(
        localStorage.getItem("runweek_conversations") || "[]"
      );
      let existingConversation = conversations.find((conv: Conversation) =>
        conv.participants.includes(friend.id)
      );

      if (!existingConversation) {
        existingConversation = {
          id: `conv_${Date.now()}`,
          participants: ["current_user", friend.id],
          friendName: friend.name,
          friendImage: friend.profileImage,
          lastMessage: null,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        conversations.push(existingConversation);
        localStorage.setItem(
          "runweek_conversations",
          JSON.stringify(conversations)
        );
      }

      setConversation(existingConversation);
    }
  }, [isOpen, friend]);

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !conversation) return;

    setIsLoading(true);
    try {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        senderId: "current_user",
        text: message,
        timestamp: new Date().toISOString(),
        read: false,
        type: "text",
      };

      // Mettre à jour la conversation localement
      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, newMessage],
        lastMessage: newMessage,
        updatedAt: new Date().toISOString(),
      };

      setConversation(updatedConversation);

      // Sauvegarder dans localStorage
      const conversations = JSON.parse(
        localStorage.getItem("runweek_conversations") || "[]"
      );
      const conversationIndex = conversations.findIndex(
        (conv: Conversation) => conv.id === conversation.id
      );
      if (conversationIndex >= 0) {
        conversations[conversationIndex] = updatedConversation;
      } else {
        conversations.push(updatedConversation);
      }
      localStorage.setItem(
        "runweek_conversations",
        JSON.stringify(conversations)
      );

      // Simuler la réponse de l'ami (pour la démo)
      setTimeout(() => {
        if (!friend) return;
        const friendResponse: Message = {
          id: `msg_${Date.now() + 1}`,
          senderId: friend.id,
          text: getRandomResponse(),
          timestamp: new Date().toISOString(),
          read: false,
          type: "text",
        };

        const finalConversation = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, friendResponse],
          lastMessage: friendResponse,
          updatedAt: new Date().toISOString(),
        };

        setConversation(finalConversation);

        // Sauvegarder la réponse
        const latestConversations = JSON.parse(
          localStorage.getItem("runweek_conversations") || "[]"
        );
        const latestIndex = latestConversations.findIndex(
          (conv: Conversation) => conv.id === conversation.id
        );
        if (latestIndex >= 0) {
          latestConversations[latestIndex] = finalConversation;
          localStorage.setItem(
            "runweek_conversations",
            JSON.stringify(latestConversations)
          );
        }
      }, 2000 + Math.random() * 3000); // Réponse entre 2-5 secondes

      if (!friend) {
        return null;
      }

      onSendMessage(friend.id, message);
      setMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRandomResponse = () => {
    const responses = [
      "Merci pour ton message ! 😊",
      "C'est une excellente idée !",
      "Je suis d'accord avec toi 👍",
      "On pourrait en discuter lors de notre prochaine course !",
      "Merci de m'avoir écrit ! À bientôt 🏃‍♂️",
      "Super ! J'ai hâte de voir ça",
      "Excellente suggestion ! 💪",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  if (!friend) {
    return null;
  }
  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title="Chat" size="lg">
      <div className="flex flex-col h-[600px]">
        {/* En-tête de la conversation */}
        <div className="flex items-center justify-between p-4 mt-1 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              {friend.profileImage ? (
                <img
                  src={friend.profileImage}
                  alt={friend.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border dark:border-gray-700 border-gray-200 object-cover flex items-center justify-center ">
                  <span className=" capitalize">{friend.name.slice(0, 1)}</span>
                </div>
              )}
              {friend.isOnline && (
                <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{friend.name}</h3>
              <p className="text-sm text-muted-foreground">
                {friend.isOnline ? "En ligne" : "Hors ligne"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
              <Phone size={16} />
            </button>
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
              <Video size={16} />
            </button>
            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors">
              <Info size={16} />
            </button>
          </div>
        </div>

        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation?.messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send size={24} className="text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-1">
                Commencez la conversation
              </h4>
              <p className="text-sm text-muted-foreground">
                Envoyez votre premier message à {friend.name}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {conversation?.messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${
                    msg.senderId === "current_user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] ${
                      msg.senderId === "current_user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    } rounded-2xl px-4 py-2 relative`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.senderId === "current_user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="border-t border-border p-4">
          {/* Picker d'emojis */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 p-3 bg-background border border-border rounded-lg"
              >
                <div className="grid grid-cols-6 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="w-8 h-8 rounded-lg hover:bg-muted transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="input w-full resize-none dark:border-gray-600 placeholder:text-gray-500 dark:bg-gray-800"
                rows={1}
                style={{ minHeight: "40px", maxHeight: "120px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Smile size={16} />
              </button>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="px-3 py-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DraggableModal>
  );
};

export default ConversationModal;
