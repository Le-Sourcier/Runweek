/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import { Input2 as Input } from "../components/ui/Input";
import { Button2 as Button } from "../components/ui/Button";
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { MailVerificationStatus } from "../types/user";
import { useUser } from "../hooks/useUser";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<MailVerificationStatus>("loading");
  const [email, setEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState("");
  const { verifyMail, resendVerificationMail, isLoading } = useUser();

  const token = searchParams.get("pk");

  const _verifyMail = async () => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    try {
      const res = await verifyMail(token);
      setStatus(res.status);
      if (res.email) setEmail(res.email);
    } catch {
      setStatus("error");
      setEmail("");
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setStatus("invalid");
        return;
      }
      await _verifyMail();
    };

    init();
  }, [token]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email address is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    const res = await resendVerificationMail(email);

    if (res.message === "ACCOUNT_ALREADY_VERIFIED") {
      setStatus("already-validated");
    }

    setResendSuccess(res.resent);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
    if (resendSuccess) {
      setResendSuccess(false);
    }
  };

  // Success state
  if (status === "success") {
    return (
      <AuthLayout
        title="Email verified!"
        subtitle="Your account has been successfully verified"
        showVisual={true}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-lg">
              Welcome to RunWeek! Your email has been verified and your account
              is now active.
            </p>
            <div className="bg-green-50/60 backdrop-blur-sm border border-green-200/50 rounded-2xl p-4 text-sm text-green-700">
              <p className="font-medium mb-1">🎉 You're all set!</p>
              <p>
                You can now access all RunWeek features and start your
                personalized training journey.
              </p>
            </div>
          </div>

          <div className="pt-">
            <Link to="/login">
              <Button className="w-full">Continue to sign in</Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Loading state
  if (status === "loading") {
    return (
      <AuthLayout
        title="Verifying your email"
        subtitle="Please wait while we verify your account"
        showVisual={true}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
            <RefreshCw className="h-10 w-10 text-white animate-spin" />
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-lg">
              We're verifying your email address...
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
    // <AuthLayout
    //   title={
    //     status === "expired"
    //       ? "Verification link expired"
    //       : status === "invalid"
    //       ? "Invalid verification link"
    //       : "Verification failed"
    //   }
    //   subtitle={
    //     status === "expired"
    //       ? "Your verification link has expired. Request a new one below."
    //       : status === "invalid"
    //       ? "The verification link is invalid or malformed."
    //       : "We couldn't verify your email. Try requesting a new verification link."
    //   }
    //   showVisual={true}
    // >
    <AuthLayout
      title={
        status === "expired"
          ? "Verification link expired"
          : status === "invalid"
          ? "Invalid verification link"
          : status === "already-validated"
          ? "Email already verified"
          : "Verification failed"
      }
      subtitle={
        status === "expired"
          ? "Your verification link has expired. Request a new one below."
          : status === "invalid"
          ? "The verification link is invalid or malformed."
          : status === "already-validated"
          ? "This email address has already been verified. You can sign in with your account."
          : "We couldn't verify your email. Try requesting a new verification link."
      }
      showVisual={true}
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg mb-4">
            <XCircle className="h-10 w-10 text-white" />
          </div>
        </div>

        {resendSuccess ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50/60 backdrop-blur-sm border border-green-200/50 rounded-2xl p-4 text-sm text-green-700">
              <div className="flex items-center justify-center mb-2">
                <Mail className="h-5 w-5 mr-2" />
                <p className="font-medium">Verification email sent!</p>
              </div>
              <p>
                We've sent a new verification link to <strong>{email}</strong>
              </p>
              <p className="mt-2">
                Check your inbox and click the link to verify your account.
              </p>
            </div>

            <Button
              // onClick={() => {
              //   setResendSuccess(false);
              // }}
              variant="secondary"
              className="w-full"
            >
              Send another email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResendVerification} className="space-y-6">
            <div className="bg-orange-50/60 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-4 text-sm text-orange-700">
              <p className="font-medium mb-2">Need a new verification link?</p>
              <p>
                Enter your email address below and we'll send you a fresh
                verification link.
              </p>
            </div>

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={handleInputChange}
              error={error}
              placeholder="Enter your email address"
              autoComplete="email"
            />

            <Button type="submit" className="w-full" loading={isLoading}>
              {isLoading
                ? "Sending verification email..."
                : "Send verification email"}
            </Button>
          </form>
        )}

        <div className="space-y-3 pt-4">
          <Link to="/register">
            <Button variant="secondary" className="w-full">
              Create a new account
            </Button>
          </Link>

          <Link to="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
