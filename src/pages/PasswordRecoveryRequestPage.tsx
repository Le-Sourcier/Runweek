import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import { Input2 as Input } from "../components/ui/Input";
import { Button2 as Button } from "../components/ui/Button";
import { ArrowLeft, Mail } from "lucide-react";
import { ROUTES } from "../hooks/useAppNavigation";
import { useUserContext } from "../hooks/useUser";

const PasswordRecoveryRequestPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const navigate = useNavigate();

  const {
    isLoading: loading,
    isAuthenticated,
    passwordRecoveryRequest,
  } = useUserContext();

  useEffect(() => {
    if (isAuthenticated) {
      // Navigate back to the previous page or dashboard
      navigate((-1 as unknown) || ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email address is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    await passwordRecoveryRequest(email);
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a password reset link"
        showVisual={true}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <Mail className="h-10 w-10 text-white" />
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-lg">
              We've sent a password reset link to:
            </p>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="font-medium text-gray-900">{email}</p>
            </div>
          </div>

          <div className="bg-blue-50/60 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-4 text-sm text-blue-700">
            <p className="font-medium mb-2">Didn't receive the email?</p>
            <p>
              Check your spam folder or try again with a different email
              address.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              variant="secondary"
              className="w-full"
            >
              Try another email
            </Button>

            <Link to={ROUTES.LOGIN}>
              <Button variant="outline" className="w-full mt-5">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="No worries, we'll send you reset instructions"
      showVisual={true}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={handleInputChange}
          error={error}
          placeholder="Enter your email address"
          autoComplete="email"
        />

        <Button type="submit" className="w-full" loading={loading}>
          {loading ? "Sending instructions..." : "Send reset instructions"}
        </Button>

        <div className="bg-gray-50/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 text-sm text-gray-600">
          <p className="font-medium mb-2">Remember your password?</p>
          <p>You can sign in with your existing credentials.</p>
        </div>

        <Link to={ROUTES.LOGIN}>
          <Button variant="outline" className="w-full mt-5">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to sign in
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
};

export default PasswordRecoveryRequestPage;
