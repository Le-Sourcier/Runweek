import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import Button from "../ui/Button";
import { MessageCircle, Send, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendName: string;
  activityTitle?: string;
  onSubmitComment: (comment: string) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  activityTitle,
  onSubmitComment,
}) => {
  const [comment, setComment] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emojis = ["👏", "🔥", "💪", "🏃‍♂️", "⚡", "🎉", "👍", "❤️"];

  const quickComments = [
    "Excellent travail ! 👏",
    "Bravo pour cette performance ! 🔥",
    "Continue comme ça ! 💪",
    "Impressionnant ! 🏃‍♂️",
    "Tu es une source d'inspiration ! ⚡",
    "Félicitations ! 🎉",
  ];

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    setIsLoading(true);
    try {
      const finalComment = selectedEmoji
        ? `${comment} ${selectedEmoji}`
        : comment;

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      await onSubmitComment(finalComment);

      setComment("");
      setSelectedEmoji("");
    } catch (error) {
      console.error("Erreur lors de la publication du commentaire:", error);
      toast.error("Erreur lors de la publication du commentaire");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickComment = (quickComment: string) => {
    setComment(quickComment);
  };

  const handleClose = () => {
    setComment("");
    setSelectedEmoji("");
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      // title={`Commenter l'activité de ${friendName}`}
      size="md"
    >
      <div className="space-y-6">
        {activityTitle && (
          <div className="bg-background p-3 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Activité :</p>
            <p className="font-medium text-foreground">{activityTitle}</p>
          </div>
        )}

        {/* Zone de commentaire */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Votre commentaire
            </label>
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Écrivez un commentaire encourageant..."
                className="input w-full h-24 resize-none pr-12"
                maxLength={500}
              />
              <button
                onClick={() => setComment(comment + selectedEmoji)}
                className="absolute bottom-2 right-2 p-1 text-muted-foreground hover:text-primary transition-colors"
                title="Ajouter un emoji"
              >
                <Smile size={16} />
              </button>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                Soyez respectueux et encourageant
              </p>
              <p className="text-xs text-muted-foreground">
                {comment.length}/500
              </p>
            </div>
          </div>

          {/* Sélecteur d'emojis */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Ajouter une réaction :
            </p>
            <div className="flex gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() =>
                    setSelectedEmoji(selectedEmoji === emoji ? "" : emoji)
                  }
                  className={`w-10 h-10 rounded-lg border transition-all hover:scale-110 ${
                    selectedEmoji === emoji
                      ? "border-primary bg-primary/10 scale-110"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-lg">{emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Commentaires rapides */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Commentaires rapides :
            </p>
            <div className="grid grid-cols-1 gap-2">
              {quickComments.map((quickComment, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleQuickComment(quickComment)}
                  className="p-2 text-left text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors border border-transparent hover:border-primary/50"
                >
                  {quickComment}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Aperçu du commentaire */}
        {(comment || selectedEmoji) && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-muted-foreground mb-1">Aperçu :</p>
            <div className="flex items-start gap-2">
              <MessageCircle size={14} className="text-primary mt-0.5" />
              <p className="text-sm text-foreground">
                {comment} {selectedEmoji}
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
            onClick={handleSubmit}
            disabled={!comment.trim() || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send size={16} />
            )}
            {isLoading ? "Publication..." : "Publier le commentaire"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CommentModal;
