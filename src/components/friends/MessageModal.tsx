import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import Button from "../ui/Button";
import { Send, MessageCircle, Smile, Image } from "lucide-react";
import { motion } from "framer-motion";
import { Friend } from "../../types/friends";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Friend | null;
  onSendMessage: (friendId: string, message: string) => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  friend,
  onSendMessage,
}) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!friend) {
    return null;
  }

  const quickMessages = [
    "Salut ! Comment ça va ?",
    "Prêt(e) pour une course ensemble ?",
    "Félicitations pour ta dernière performance !",
    "Tu veux qu'on se motive mutuellement cette semaine ?",
    "J'ai vu ton dernier record, impressionnant !",
    "On pourrait faire un entraînement ensemble ?",
  ];

  const emojis = ["👋", "🏃‍♂️", "💪", "🔥", "👏", "⚡", "🎯", "🏆"];

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      onSendMessage(friend.id, message);
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMessage = (quickMessage: string) => {
    setMessage(quickMessage);
  };

  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  const handleClose = () => {
    setMessage("");
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Envoyer un message à ${friend.name}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Profil de l'ami */}
        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
          <div className="relative">
            <img
              src={friend.profileImage}
              alt={friend.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {friend.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{friend.name}</h4>
            <p className="text-sm text-muted-foreground">
              {friend.isOnline ? "En ligne maintenant" : "Hors ligne"}
            </p>
          </div>
        </div>

        {/* Zone de message */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Votre message
            </label>
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="input w-full h-32 resize-none pr-12"
                maxLength={1000}
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <button
                  type="button"
                  className="p-1 text-muted-foreground hover:text-primary transition-colors rounded"
                  title="Ajouter un emoji"
                >
                  <Smile size={16} />
                </button>
                <button
                  type="button"
                  className="p-1 text-muted-foreground hover:text-primary transition-colors rounded"
                  title="Joindre une image"
                >
                  <Image size={16} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                Soyez respectueux et amical
              </p>
              <p className="text-xs text-muted-foreground">
                {message.length}/1000
              </p>
            </div>
          </div>

          {/* Emojis rapides */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Emojis :</p>
            <div className="flex gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="w-8 h-8 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/10 transition-all text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Messages rapides */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Messages rapides :
            </p>
            <div className="grid grid-cols-1 gap-2">
              {quickMessages.map((quickMessage, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleQuickMessage(quickMessage)}
                  className="p-2 text-left text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors border border-transparent hover:border-primary/50"
                >
                  {quickMessage}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Aperçu du message */}
        {message && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-muted-foreground mb-1">Aperçu :</p>
            <div className="flex items-start gap-2">
              <MessageCircle size={14} className="text-primary mt-0.5" />
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send size={16} />
            )}
            {isLoading ? "Envoi..." : "Envoyer le message"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MessageModal;
