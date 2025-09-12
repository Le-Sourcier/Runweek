import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import { Button2 as Button } from "../components/ui/Button";
import { CheckCircle, XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useUserContext } from "../hooks/useUser";
import { ROUTES, useAppNavigation } from "../hooks/useAppNavigation";

const GoogleAuthConfirmation: React.FC = () => {
  const { getCurrentLocation } = useAppNavigation();
  const navigate = useNavigate();
  const { verifyGoogleAuth, isLoading } = useUserContext();

  const [isSuccess, setIsSeccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { code } = getCurrentLocation().queryParams;

  useEffect(() => {
    const handleGoogleCallback = async () => {
      if (!code) {
        setIsSeccess(false);
        setErrorMessage("No authorization code received");
        return;
      }

      try {
        const { error, message } = await verifyGoogleAuth(code as string);

        if (!error) {
          setIsSeccess(true);
          // Attendre 2 secondes avant la redirection pour montrer l'indicateur de validation
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 2000);
        } else {
          setIsSeccess(false);
          setErrorMessage(message || "Authentication failed");
        }
      } catch (error) {
        setIsSeccess(false);
        setErrorMessage("An unexpected error occurred");
        console.error("Google auth confirmation error:", error);
      }
    };

    handleGoogleCallback();
  }, [code, navigate, verifyGoogleAuth]);

  // Success state
  if (isSuccess) {
    return (
      <AuthLayout
        title="Authentication successful!"
        subtitle="You have been successfully connected with Google"
        showVisual={true}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-lg">
              Welcome to RunWeek! Your Google account has been connected
              successfully.
            </p>
            <div className="bg-green-50/60 backdrop-blur-sm border border-green-200/50 rounded-2xl p-4 text-sm text-green-700">
              <p className="font-medium mb-1">🎉 You're all set!</p>
              <p>
                You can now access all RunWeek features and start your
                personalized training journey.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <AuthLayout
        title="Connecting with Google"
        subtitle="Please wait while we authenticate your account"
        showVisual={true}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
            <RefreshCw className="h-10 w-10 text-white animate-spin" />
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-lg">
              We're connecting your Google account...
            </p>
            <div className="bg-blue-50/60 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-4 text-sm text-blue-700">
              <p>This should only take a few seconds.</p>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Error, expired, or invalid token states
  return (
    <AuthLayout
      title={"Authentication failed"}
      subtitle={errorMessage}
      showVisual={true}
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg mb-4">
            <XCircle className="h-10 w-10 text-white" />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Button onClick={() => window.location.reload()} className="w-full">
            Try again
          </Button>

          <Link to={ROUTES.LOGIN}>
            <Button variant="outline" className="w-full mt-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Button>
          </Link>

          {isSuccess && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Need help?{" "}
                {/* <Link
                  to={ROUTES.CONTACT_SUPPORT}
                  className="text-blue-600 hover:underline"
                >
                  Contact support
                </Link> */}
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default GoogleAuthConfirmation;
