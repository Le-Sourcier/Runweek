import React, { useEffect, useState, useCallback, Suspense } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import { Button2 as Button } from "../components/ui/Button";
import { CheckCircle, XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useUserContext } from "../hooks/useUser";
import { ROUTES } from "../hooks/useAppNavigation";

// Composant de chargement pour Suspense
const LoadingSpinner = () => (
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

// Composant principal qui peut suspendre
const GoogleAuthContent: React.FC = () => {
  const navigate = useNavigate();
  const { verifyGoogleAuth } = useUserContext();

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const handleGoogleCallback = useCallback(async () => {
    if (!code) {
      throw new Error("No authorization code received");
    }

    setErrorMessage("");
    setIsSuccess(false);

    try {
      const { error, message } = await verifyGoogleAuth(code);

      if (!error) {
        setIsSuccess(true);
        // Attendre 2 secondes avant la redirection
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
        return true;
      } else {
        throw new Error(message || "Authentication failed");
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setErrorMessage(errorMsg);
      throw error;
    }
  }, [code, navigate, verifyGoogleAuth]);

  // Utiliser une promesse pour Suspense
  const [authPromise, setAuthPromise] = useState<Promise<boolean> | null>(null);

  useEffect(() => {
    if (code && !authPromise) {
      const promise = handleGoogleCallback();
      setAuthPromise(promise);
    }
  }, [code, handleGoogleCallback, authPromise]);

  // Si nous avons une promesse en cours, suspendre le composant
  if (authPromise) {
    throw authPromise;
  }

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

  // Error state
  return (
    <AuthLayout
      title="Authentication failed"
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
          <Button
            onClick={() => {
              setAuthPromise(null);
              setTimeout(() => {
                const promise = handleGoogleCallback();
                setAuthPromise(promise);
              }, 0);
            }}
            className="w-full"
          >
            Try again
          </Button>

          <Link to={ROUTES.LOGIN}>
            <Button variant="outline" className="w-full mt-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

// Composant principal avec Suspense
const GoogleAuthConfirmation: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GoogleAuthContent />
    </Suspense>
  );
};

export default GoogleAuthConfirmation;
