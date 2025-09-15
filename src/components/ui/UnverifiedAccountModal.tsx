import React, { useState, useEffect } from "react";
import { Button2 as Button } from "./Button";
import {
  Mail,
  AlertTriangle,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useUserContext } from "../../hooks/useUser";
import { useMessages } from "../../hooks/useMessage";
import { MessageCode } from "../../types/message";

interface UnverifiedAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}

type ModalState = "initial" | "success" | "error";

const UnverifiedAccountModal: React.FC<UnverifiedAccountModalProps> = ({
  isOpen,
  onClose,
  email = "",
}) => {
  const [modalState, setModalState] = useState<ModalState>("initial");
  const [internalMessage, setInternalMessage] = useState<string>("");
  const { isLoading, resendVerificationMail } = useUserContext();
  const { getMessage } = useMessages();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setModalState("initial");
      setInternalMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResend = async () => {
    if (!email) return;

    try {
      setModalState("initial");
      setInternalMessage("");

      const result = await resendVerificationMail(email);

      if (result.error) {
        setModalState("error");
        setInternalMessage(
          result.message ||
            "Failed to send verification email. Please try again."
        );
      } else {
        setModalState("success");
        setInternalMessage(
          result.message || "Verification email sent successfully!"
        );
      }
    } catch (error: any) {
      setModalState("error");
      setInternalMessage(
        error.message || "Failed to send verification email. Please try again."
      );
    }
  };

  const handleClose = () => {
    setModalState("initial");
    setInternalMessage("");
    onClose();
  };

  // Fonction pour formater l'email sur mobile
  const formatEmailForMobile = (email: string) => {
    if (typeof window === "undefined") return email;

    const isMobile = window.innerWidth < 640;
    if (!isMobile || email.length <= 20) return email;

    const parts = email.split("@");
    if (parts.length !== 2) return email;

    const username = parts[0];
    const domain = parts[1];

    if (username.length > 12) {
      return `${username.substring(0, 8)}...@${domain}`;
    }

    return email;
  };

  const formattedEmail = formatEmailForMobile(email);

  // Déterminer le contenu du message en fonction de l'état
  const getMessageContent = () => {
    const message = getMessage(internalMessage as MessageCode);
    if (modalState === "success" && internalMessage) {
      return message;
    }
    if (modalState === "error" && internalMessage) {
      return message;
    }

    // Messages par défaut
    switch (modalState) {
      case "success":
        return `We've sent a verification link to ${formattedEmail}. Please check your inbox.`;
      case "error":
        return "Failed to send verification email. Please try again.";
      default:
        return `Your account ${formattedEmail} hasn't been verified yet. You need to verify your email to unlock all RunWeek features.`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon - Change based on state */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                modalState === "success"
                  ? "bg-green-400"
                  : modalState === "error"
                  ? "bg-red-400"
                  : "bg-gradient-to-r from-orange-400 to-red-500"
              }`}
            >
              {modalState === "success" ? (
                <CheckCircle2 className="h-8 w-8 text-white" />
              ) : modalState === "error" ? (
                <AlertCircle className="h-8 w-8 text-white" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-white" />
              )}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {modalState === "success"
                ? "Verification Sent!"
                : modalState === "error"
                ? "Something Went Wrong"
                : "Account Not Verified"}
            </h2>
            <p className="text-gray-600 text-base">
              {modalState === "success"
                ? "Check your email for the verification link"
                : modalState === "error"
                ? "We encountered an issue"
                : "Please verify your email to access all features"}
            </p>
          </div>

          {/* Message Content - Changes based on state */}
          {modalState === "success" ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <Mail className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800 text-sm">
                  Check your inbox
                </span>
              </div>
              <p className="text-blue-700 text-sm">{getMessageContent()}</p>
              <p className="text-blue-600 text-xs mt-2">
                Can't find it? Check your spam folder or request a new link.
              </p>
            </div>
          ) : modalState === "error" ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start mb-2">
                <span className="text-red-600 mr-2">❌</span>
                <span className="font-medium text-red-800 text-sm">
                  Sending Failed
                </span>
              </div>
              <p className="text-red-700 text-sm">{getMessageContent()}</p>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start mb-2">
                <span className="text-orange-600 mr-2">⚠️</span>
                <span className="font-medium text-orange-800 text-sm">
                  Verification Required
                </span>
              </div>
              <p className="text-orange-700 text-sm">{getMessageContent()}</p>
            </div>
          )}

          {/* Resend Section */}
          <div className="mb-6">
            <Button
              onClick={handleResend}
              loading={isLoading}
              className="w-full"
              variant="primary"
              size="lg"
              disabled={modalState === "success" && !isLoading}
            >
              {modalState === "success"
                ? "Email Sent ✓"
                : isLoading
                ? "Sending..."
                : "Resend verification email"}
            </Button>

            {modalState === "success" && (
              <p className="text-green-600 text-sm text-center mt-3">
                ✓ Verification email sent successfully!
              </p>
            )}
          </div>

          {/* Support Link */}
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-gray-500 text-xs">
              Need help?{" "}
              <button
                onClick={() => console.log("Contact support")}
                className="text-blue-600 hover:underline font-medium"
              >
                Contact support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnverifiedAccountModal;
