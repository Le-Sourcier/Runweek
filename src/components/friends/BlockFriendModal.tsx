import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import Button from "../ui/Button";
import { AlertTriangle, Shield, Ban, MessageCircle, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { Friend } from "../../types/friends";

interface BlockFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Friend | null;
  onBlockFriend: (
    friendId: string,
    reason: string,
    additionalContext?: string
  ) => Promise<void>;
}

const BlockFriendModal: React.FC<BlockFriendModalProps> = ({
  isOpen,
  onClose,
  friend,
  onBlockFriend,
}) => {
  const [reason, setReason] = useState<string>("");
  const [additionalContext, setAdditionalContext] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const blockReasons = [
    {
      id: "spam",
      label: "Spam ou messages indésirables",
      icon: <MessageCircle size={16} />,
    },
    {
      id: "inappropriate",
      label: "Contenu inapproprié",
      icon: <Shield size={16} />,
    },
    {
      id: "harassment",
      label: "Harcèlement",
      icon: <UserX size={16} />,
    },
    {
      id: "other",
      label: "Autre raison",
      icon: <Ban size={16} />,
    },
  ];

  const handleSubmit = async () => {
    if (!friend || !reason) return;

    setIsSubmitting(true);
    try {
      await onBlockFriend(friend.id, reason, additionalContext);
      // Reset form
      setReason("");
      setAdditionalContext("");
      onClose();
    } catch (error) {
      console.error("Erreur lors du blocage:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!friend) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bloquer un ami" size="md">
      <div className="flex flex-col space-y-6">
        {/* Warning header */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertTriangle
            className="text-amber-500 mt-0.5 flex-shrink-0"
            size={20}
          />
          <div className="space-y-1">
            <h4 className="font-medium text-amber-800 dark:text-amber-200">
              Attention
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Bloquer {friend.name} supprimera votre connexion et empêchera
              toute future interaction.
            </p>
          </div>
        </div>

        {/* Friend info */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          {friend.profileImage ? (
            <img
              src={friend.profileImage}
              alt={friend.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border dark:border-gray-700 border-gray-200 flex items-center justify-center">
              <span className="capitalize">{friend.name.slice(0, 1)}</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground">{friend.name}</h3>
            <p className="text-sm text-muted-foreground">Ami depuis 3 mois</p>
          </div>
        </div>

        {/* Reason selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Raison du blocage <span className="text-destructive">*</span>
          </label>
          <div className="grid gap-2">
            {blockReasons.map((blockReason) => (
              <motion.div
                key={blockReason.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    reason === blockReason.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="block-reason"
                    value={blockReason.id}
                    checked={reason === blockReason.id}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-muted-foreground">
                    {blockReason.icon}
                  </span>
                  <span className="text-sm">{blockReason.label}</span>
                </label>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional context */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Informations supplémentaires (optionnel)
          </label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Décrivez brièvement la raison de ce blocage..."
            className="input w-full resize-none dark:border-gray-600 placeholder:text-gray-500 dark:bg-gray-800"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Ces informations nous aident à améliorer notre communauté.
          </p>
        </div>

        {/* Consequences info */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Ce qui se passera :
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-start gap-2">
              <Ban size={14} className="mt-0.5 flex-shrink-0" />
              <span>Vous ne recevrez plus de messages de {friend.name}</span>
            </li>
            <li className="flex items-start gap-2">
              <UserX size={14} className="mt-0.5 flex-shrink-0" />
              <span>Vous ne verrez plus ses activités ni ses statistiques</span>
            </li>
            <li className="flex items-start gap-2">
              <Shield size={14} className="mt-0.5 flex-shrink-0" />
              <span>{friend.name} ne sera pas informé de ce blocage</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-destructive hover:bg-destructive/90"
            disabled={!reason || isSubmitting}
            isLoading={isSubmitting}
          >
            Bloquer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BlockFriendModal;
