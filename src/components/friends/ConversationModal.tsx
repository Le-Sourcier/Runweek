import React, { useState, useEffect, useRef, useCallback } from "react";
import { DraggableModal } from "../ui/Modal";
import Button from "../ui/Button";
import { Send, Smile, Phone, Video, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Friend } from "../../types/friends";
import { useFriendsStore } from "../../stores/friends";
import { useUserContext } from "../../hooks/useUser";

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Friend | null;
}

const ConversationModal: React.FC<ConversationModalProps> = ({
  isOpen,
  onClose,
  friend,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { user } = useUserContext();
  const {
    isSendingMessage,
    messages,
    sendMessage,
    getMessages,
    currentUser,
    sendRealTimeMessage,
    startTyping,
    stopTyping,
    friends,
  } = useFriendsStore();

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

  // Filtrer les messages pour l'ami courant
  const currentMessages = messages.filter(
    (msg) => msg.friend_id === friend?.id
  );

  // Trouver l'ami avec le statut de frappe actuel
  const currentFriend = friends.find((f) => f.id === friend?.id);

  // Gestion de la frappe avec debounce
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setMessage(value);

      if (!friend || !currentUser) return;

      // Déclencher l'événement de frappe
      if (value.length > 0 && !isTyping) {
        startTyping(friend.id);
        setIsTyping(true);
      }

      console.log("isTyping: ", isTyping);

      // Reset le timeout à chaque frappe
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Arrêter la frappe après 2 secondes d'inactivité
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          stopTyping(friend.id);
          setIsTyping(false);
        }
      }, 2000);
    },
    [friend, currentUser, isTyping, startTyping, stopTyping]
  );

  // Nettoyer le timeout à la fermeture
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (friend && isTyping) {
        stopTyping(friend.id);
      }
    };
  }, [friend, isTyping, stopTyping]);

  // 1. Charger les messages quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && friend) {
      console.log("Loading messages for friend:", friend.id);
      getMessages(friend.id, 1, 50).catch((err) => {
        console.error("Error loading messages:", err);
      });
    }
  }, [isOpen, friend, getMessages]);

  // Scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  // Modifiez le handleSendMessage pour éviter les doublons
  const handleSendMessage = async () => {
    if (!message.trim() || !friend || !currentUser) return;

    // Arrêter la frappe
    if (isTyping) {
      stopTyping(friend.id);
      setIsTyping(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    try {
      // NE PAS ajouter de message temporaire pour éviter les doublons
      // Le socket se chargera de l'ajouter

      // Envoyer le message via Socket.io pour une diffusion immédiate
      // @ts-ignore
      sendRealTimeMessage({
        friend_id: friend.id,
        sender: {
          id: currentUser.id,
          email: user?.email || "",
          profile: {
            fname: "Vous",
            lname: user?.lname || "",
            image: user?.image || "",
          },
        },
        content: message,
        messageType: "text",
      });

      // Envoyer aussi via l'API pour la persistance
      await sendMessage({
        friendId: friend.id,
        content: message,
        messageType: "text",
      });

      setMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
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

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex justify-start mb-2"
    >
      <div className="bg-muted text-foreground rounded-2xl px-4 py-2 max-w-[70%]">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-muted-foreground rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">
            {currentFriend?.isTyping ? "écrit..." : "écrivent..."}
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (!friend) {
    return null;
  }

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title="Chat" size="lg">
      <div className="flex flex-col h-[600px]">
        {/* En-tête */}
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
                <div className="w-10 h-10 rounded-full border dark:border-gray-700 border-gray-200 flex items-center justify-center gap-1">
                  <span className="capitalize">
                    {friend.name.split(" ")[0].slice(0, 1)}
                  </span>
                  <span className="capitalize">
                    {friend.name.split(" ")[1].slice(0, 1)}
                  </span>
                </div>
              )}
              {friend.isOnline && (
                <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentMessages.length === 0 ? (
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
              {currentMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.sender.id === currentUser?.id
                      ? "justify-end"
                      : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[70%] ${msg.sender.id === currentUser?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                      } rounded-2xl px-4 py-2 relative`}
                  >
                    <p className={`text-sm whitespace-pre-wrap ${msg.sender.id === currentUser?.id ? "text-white" : "text-foreground"}`}>{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${msg.sender.id === currentUser?.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                        }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>

                    {/* Afficher le nom de l'expéditeur pour les messages de l'ami */}
                    {msg.sender.id !== currentUser?.id &&
                      msg.sender.profile && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {msg.sender.profile.fname}
                        </p>
                      )}
                  </div>
                </motion.div>
              ))}
              {currentFriend?.isTyping && <TypingIndicator />}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="border-t border-border p-4">
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
                onChange={handleInputChange}
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
                disabled={!message.trim() || isSendingMessage}
                className="px-3 py-2"
              >
                {isSendingMessage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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
