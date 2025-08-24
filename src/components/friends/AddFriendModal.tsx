import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Search, Mail, MessageCircle, Star } from "lucide-react";
import { motion } from "framer-motion";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendFriendRequest: (email: string, message?: string) => Promise<boolean>;
  isLoading: boolean;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  onSendFriendRequest,
  isLoading,
}) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"email" | "message">("email");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailNext = () => {
    if (!email.trim()) {
      setEmailError("L'adresse email est requise");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Veuillez entrer une adresse email valide");
      return;
    }

    setEmailError("");
    setStep("message");
  };

  const handleSendRequest = async () => {
    try {
      const success = await onSendFriendRequest(email, message || undefined);
      if (success) {
        // Store the request locally for immediate UI feedback
        const sentRequests = JSON.parse(
          localStorage.getItem("runweek_sent_requests") || "[]"
        );
        const newRequest = {
          id: `req_${Date.now()}`,
          email,
          message: message || "",
          status: "pending",
          sentAt: new Date().toISOString(),
        };
        sentRequests.push(newRequest);
        localStorage.setItem(
          "runweek_sent_requests",
          JSON.stringify(sentRequests)
        );

        setEmail("");
        setMessage("");
        setStep("email");
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande:", error);
    }
  };

  const handleClose = () => {
    setEmail("");
    setMessage("");
    setStep("email");
    setEmailError("");
    onClose();
  };

  const suggestedMessages = [
    "Salut ! J'aimerais t'ajouter comme ami sur Runweek pour partager nos courses !",
    "Hello ! J'ai vu qu'on avait des amis en commun. Ça te dit de courir ensemble ?",
    "Bonjour ! Ton profil m'a l'air intéressant, on pourrait s'entraider dans nos objectifs !",
    "Salut ! Je cherche des partenaires de course dans la région, ça t'intéresse ?",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ajouter un ami"
      size="md"
    >
      <div className="space-y-6">
        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 ${
              step === "email" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "email"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </div>
            <span className="text-sm font-medium">Email</span>
          </div>
          <div className="flex-1 h-px bg-border"></div>
          <div
            className={`flex items-center gap-2 ${
              step === "message" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "message"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium">Message</span>
          </div>
        </div>

        {step === "email" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Adresse email de votre ami
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="ami@example.com"
                  className={`pl-10 ${emailError ? "border-destructive" : ""}`}
                />
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
              </div>
              {emailError && (
                <p className="text-sm text-destructive mt-1">{emailError}</p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Search size={16} className="text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Conseil de recherche
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Vous pouvez aussi rechercher des amis par leur nom dans
                    l'onglet "Découvrir"
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "message" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-background p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} className="text-primary" />
                <span className="font-medium text-foreground">
                  Demande pour :
                </span>
                <span className="text-primary">{email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message personnel (optionnel)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez un message pour vous présenter..."
                className="input w-full h-24 resize-none"
                maxLength={300}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">
                  Un message personnel augmente les chances d'acceptation
                </p>
                <p className="text-xs text-muted-foreground">
                  {message.length}/300
                </p>
              </div>
            </div>

            {/* Messages suggérés */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <MessageCircle size={14} />
                Messages suggérés
              </h4>
              <div className="space-y-2">
                {suggestedMessages.map((suggestedMessage, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(suggestedMessage)}
                    className="w-full p-3 text-left text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors border border-transparent hover:border-primary/50"
                  >
                    <div className="flex items-start gap-2">
                      <Star
                        size={12}
                        className="text-primary mt-0.5 flex-shrink-0"
                      />
                      <span className="text-muted-foreground">
                        {suggestedMessage}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          {step === "message" && (
            <Button variant="outline" onClick={() => setStep("email")}>
              Retour
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          {step === "email" ? (
            <Button onClick={handleEmailNext}>Suivant</Button>
          ) : (
            <Button onClick={handleSendRequest} disabled={isLoading}>
              {isLoading ? "Envoi..." : "Envoyer la demande"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddFriendModal;
