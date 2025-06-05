import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import ModernAuthVector from "../components/ui/ModernAuthVector";
import AuthLayout from "../components/ui/AuthLayout";
import AuthFormCard from "../components/ui/AuthFormCard";

interface PasswordRecoveryRequestFormInputs {
  email: string;
}

const PasswordRecoveryRequestPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectQuery = queryParams.get("redirect");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmailValidated, setIsEmailValidated] = useState(false); // To show green checkmark

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors, dirtyFields },
    reset,
    watch,
    trigger, // To manually trigger validation
  } = useForm<PasswordRecoveryRequestFormInputs>({
    mode: "onBlur",
  });

  const emailValue = watch("email");

  useEffect(() => {
    if (isEmailValidated && dirtyFields.email) {
      setIsEmailValidated(false);
    }
  }, [emailValue, isEmailValidated, dirtyFields.email]);

  const handleEmailValidationOnBlur = async () => {
    // Manually trigger email validation and update state for visual feedback
    const isValid = await trigger("email");
    setIsEmailValidated(isValid && !formErrors.email);
  };

  const onSubmit: SubmitHandler<PasswordRecoveryRequestFormInputs> = async (
    data
  ) => {
    setIsLoading(true);
    setMessage(null);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setMessage(
      "If an account with this email exists, a password reset link has been sent. Please check your inbox (and spam folder)."
    );
    reset(); // Clear form
    setIsEmailValidated(false); // Reset validation state
  };

  const leftPanelContent = (
    <div className="flex flex-col items-center justify-center w-full md:h-full bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 p-8 py-12 sm:py-16 md:p-12">
      <ModernAuthVector className="w-2/3 max-w-xs sm:max-w-sm h-auto mx-auto text-sky-400 dark:text-sky-300" />
      <p className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-center text-slate-100 dark:text-slate-50 mt-6 sm:mt-8">
        Regain Access to Runweek.
      </p>
    </div>
  );

  const rightPanelContent = (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <AuthFormCard className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold font-display text-slate-800 dark:text-slate-100">
            Runweek
          </h1>
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold text-center text-slate-700 dark:text-slate-200 mb-3">
          Forgot Your Password?
        </h2>

        {message ? (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-700/20 dark:text-green-300 text-center" role="alert">
            {message}
          </div>
        ) : (
          <p className="text-sm text-center text-gray-600 dark:text-slate-300 mb-6">
            No problem! Enter your email address below, and if it's
            associated with an account, we'll send you a link to reset your
            password.
          </p>
        )}

        {!message && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Invalid email address",
                    },
                  })}
                  onBlur={handleEmailValidationOnBlur} // Use the manual trigger on blur
                  className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    formErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : isEmailValidated // Check this state for green border
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 focus:ring-blue-500"
                  } pr-10`} // Add pr-10 for the icon
                />
                {isEmailValidated && !formErrors.email && (
                  <motion.div
                    className="absolute inset-y-0 right-3 flex items-center pointer-events-none"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, duration: 0.2 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
              </div>
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.email.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition disabled:opacity-70 flex items-center justify-center"
                whileHover={{ scale: isLoading ? 1 : 1.03 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading && (
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                )}
                {isLoading ? "Sending Link..." : "Send Password Reset Link"}
              </motion.button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to={`/login${redirectQuery ? `?redirect=${encodeURIComponent(redirectQuery)}` : ""}`}
            className="text-sm text-red-500 hover:underline font-medium flex items-center justify-center"
          >
            <motion.span whileTap={{ scale: 0.95 }} className="flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </motion.span>
          </Link>
        </div>
      </AuthFormCard>
    </div>
  );

  return (
    <AuthLayout
      leftPanelContent={leftPanelContent}
      rightPanelContent={rightPanelContent}
      className="bg-slate-100 dark:bg-slate-900" // Overall page background
    />
  );
};

export default PasswordRecoveryRequestPage;
