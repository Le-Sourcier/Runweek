import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import Button from "../ui/Button";
import { Flag, AlertTriangle, Shield, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Friend } from "../../types/friends";

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: Friend | null;
  onReportUser: (
    userId: string,
    reason: string,
    details: string,
    severity: "low" | "medium" | "high"
  ) => void;
}

const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  friend,
  onReportUser,
}) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [isLoading, setIsLoading] = useState(false);

  if (!friend) {
    return null;
  }

  const reportReasons = [
    {
      id: "inappropriate_content",
      label: "Contenu inapproprié",
      description: "Partage de contenu offensant ou inapproprié",
      severity: "medium" as const,
      icon: <FileText size={16} className="text-yellow-500" />,
    },
    {
      id: "harassment",
      label: "Harcèlement",
      description: "Comportement de harcèlement ou intimidation",
      severity: "high" as const,
      icon: <AlertTriangle size={16} className="text-red-500" />,
    },
    {
      id: "spam",
      label: "Spam",
      description: "Envoi répétitif de messages non sollicités",
      severity: "low" as const,
      icon: <Shield size={16} className="text-blue-500" />,
    },
    {
      id: "fake_profile",
      label: "Faux profil",
      description: "Utilise une fausse identité ou des informations trompeuses",
      severity: "medium" as const,
      icon: <Flag size={16} className="text-orange-500" />,
    },
    {
      id: "abusive_behavior",
      label: "Comportement abusif",
      description: "Comportement violent, menaçant ou abusif",
      severity: "high" as const,
      icon: <AlertTriangle size={16} className="text-red-600" />,
    },
    {
      id: "other",
      label: "Autre",
      description: "Autre problème non listé ci-dessus",
      severity: "medium" as const,
      icon: <Flag size={16} className="text-gray-500" />,
    },
  ];

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      const selectedReasonData = reportReasons.find(
        (r) => r.id === selectedReason
      );
      const finalReason = selectedReasonData?.label || selectedReason;

      onReportUser(friend.id, finalReason, details, severity);

      setSelectedReason("");
      setDetails("");
      setSeverity("medium");
      onClose();
    } catch (error) {
      console.error("Erreur lors du signalement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    const reason = reportReasons.find((r) => r.id === reasonId);
    if (reason) {
      setSeverity(reason.severity);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setDetails("");
    setSeverity("medium");
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Signaler ${friend.name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Avertissement */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-700 dark:text-red-300 mb-1">
                Signalement d'utilisateur
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                Cette action est sérieuse. Assurez-vous que le signalement est
                justifié. Les faux signalements peuvent entraîner des sanctions
                sur votre compte.
              </p>
            </div>
          </div>
        </div>

        {/* Profil de l'utilisateur signalé */}
        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
          <img
            src={friend.profileImage}
            alt={friend.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-foreground">{friend.name}</h4>
            <p className="text-sm text-muted-foreground">{friend.email}</p>
          </div>
        </div>

        {/* Sélection de la raison */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Raison du signalement *
          </label>
          <div className="space-y-2">
            {reportReasons.map((reason, index) => (
              <motion.div
                key={reason.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <label className="flex items-start gap-3 p-3 border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={() => handleReasonSelect(reason.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {reason.icon}
                      <span className="font-medium text-foreground">
                        {reason.label}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          reason.severity === "high"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : reason.severity === "medium"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {reason.severity === "high"
                          ? "Grave"
                          : reason.severity === "medium"
                          ? "Modéré"
                          : "Mineur"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reason.description}
                    </p>
                  </div>
                </label>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Détails supplémentaires */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Détails supplémentaires{" "}
            {selectedReason === "harassment" ||
            selectedReason === "abusive_behavior"
              ? "*"
              : "(optionnel)"}
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Décrivez la situation en détail. Plus vous fournirez d'informations, plus nous pourrons traiter efficacement votre signalement."
            className="input w-full h-24 resize-none"
            maxLength={500}
            required={
              selectedReason === "harassment" ||
              selectedReason === "abusive_behavior"
            }
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">
              {selectedReason === "harassment" ||
              selectedReason === "abusive_behavior"
                ? "Détails requis pour ce type de signalement"
                : "Ces informations nous aideront à mieux comprendre la situation"}
            </p>
            <p className="text-xs text-muted-foreground">
              {details.length}/500
            </p>
          </div>
        </div>

        {/* Conséquences */}
        {selectedReason && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
              Que se passe-t-il après le signalement ?
            </h4>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Notre équipe examinera votre signalement dans les 24h</li>
              <li>
                • L'utilisateur ne sera pas informé que vous l'avez signalé
              </li>
              <li>• Des mesures appropriées seront prises si nécessaire</li>
              <li>• Vous recevrez une notification du résultat de l'examen</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedReason ||
              isLoading ||
              ((selectedReason === "harassment" ||
                selectedReason === "abusive_behavior") &&
                !details.trim())
            }
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Flag size={16} />
            )}
            {isLoading ? "Signalement..." : "Envoyer le signalement"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReportUserModal;
