import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import ModernAuthVector from "../components/ui/ModernAuthVector";
import AuthLayout from "../components/ui/AuthLayout";
import AuthFormCard from "../components/ui/AuthFormCard";

interface PasswordResetFormInputs {
  newPassword: string;
  confirmNewPassword: string;
}

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();

  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNewPasswordValidated, setIsNewPasswordValidated] = useState(false);
  const [isConfirmPasswordValidated, setIsConfirmPasswordValidated] =
    useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: formErrors, dirtyFields },
    reset,
    trigger,
  } = useForm<PasswordResetFormInputs>({
    mode: "onBlur",
  });

  const newPasswordValue = watch("newPassword", "");
  const confirmPasswordValue = watch("confirmNewPassword", "");

  // Effects to reset validation status if values change
  useEffect(() => {
    if (isNewPasswordValidated) setIsNewPasswordValidated(false); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPasswordValue]);
  useEffect(() => {
    if (isConfirmPasswordValidated) setIsConfirmPasswordValidated(false); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmPasswordValue]);

  // Also reset confirm password validation if new password changes, as its validity depends on newPassword
  useEffect(() => {
    if (isConfirmPasswordValidated) setIsConfirmPasswordValidated(false);
    // If newPassword changes, trigger revalidation of confirmPassword if it was touched
    if (dirtyFields.confirmNewPassword) {
      trigger("confirmNewPassword");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPasswordValue]);

  const handleNewPasswordBlur = async () => {
    const isValid = await trigger("newPassword");
    setIsNewPasswordValidated(isValid && !formErrors.newPassword);
    // Also re-validate confirm password if new password changes & confirm was touched
    if (dirtyFields.confirmNewPassword) {
      const isConfirmStillValid = await trigger("confirmNewPassword");
      setIsConfirmPasswordValidated(
        isConfirmStillValid && !formErrors.confirmNewPassword
      );
    }
  };

  const handleConfirmPasswordBlur = async () => {
    const isValid = await trigger("confirmNewPassword");
    // Confirm password validation depends on newPassword as well.
    // The form schema validation `validate: value => value === newPasswordValue` handles this.
    setIsConfirmPasswordValidated(
      isValid &&
        !formErrors.confirmNewPassword &&
        !formErrors.newPassword &&
        !!newPasswordValue
    );
  };

  // React.useEffect(() => {
  //   // In a real app, validate the token here.
  //   // If token is invalid, redirect or show an error.
  //   // console.log("Token from URL:", token);
  // }, [token]); // Omitted token logic

  const onSubmit: SubmitHandler<PasswordResetFormInputs> = async (data) => {
    setIsLoading(true);
    setResetError(null);
    setResetSuccess(null);

    console.log("Password reset data:", { newPassword: data.newPassword }); // Keep for now, remove sensitive logs in prod

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    // Example: Simulate success
    setResetSuccess(
      "Your password has been successfully reset! You will be redirected to login shortly."
    );
    reset(); // Clear form fields
    setIsNewPasswordValidated(false);
    setIsConfirmPasswordValidated(false);

    setTimeout(() => {
      navigate("/login");
    }, 3000); // Redirect after 3 seconds
  };

  const leftPanelContent = (
    <div className="flex flex-col items-center justify-center w-full md:h-full bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 p-8 py-12 sm:py-16 md:p-12">
      <ModernAuthVector className="w-2/3 max-w-xs sm:max-w-sm h-auto mx-auto text-sky-400 dark:text-sky-300" />
      <p className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-center text-slate-100 dark:text-slate-50 mt-6 sm:mt-8">
        Update Your Security.
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

        <h2 className="text-xl sm:text-2xl font-semibold text-center text-slate-700 dark:text-slate-200 mb-6">
          Set New Password
        </h2>

        {resetSuccess && (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-700/20 dark:text-green-300 text-center" role="alert">
            {resetSuccess}
          </div>
        )}
        {resetError && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-700/20 dark:text-red-400 text-center" role="alert">
            {resetError}
          </div>
        )}

        {!resetSuccess && ( // Only show form if not success
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="sr-only">New Password</label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  autoComplete="new-password"
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                  onBlur={handleNewPasswordBlur}
                  className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition pr-10 ${
                    formErrors.newPassword ? "border-red-500 focus:ring-red-500"
                    : isNewPasswordValidated ? "border-green-500 focus:ring-green-500"
                    : "border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 focus:ring-blue-500"
                  }`}
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition" aria-label={showNewPassword ? "Hide new password" : "Show new password"}>
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {isNewPasswordValidated && !formErrors.newPassword && (
                  <motion.div
                    className="absolute inset-y-0 right-10 flex items-center pointer-events-none"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, duration: 0.2 }}
                  > {/* Ensure space for show/hide icon */}
                     <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
              </div>
              {formErrors.newPassword && <p className="mt-1 text-xs text-red-500">{formErrors.newPassword.message}</p>}
            </div>

            {/* Confirm New Password Field */}
            <div>
              <label htmlFor="confirmNewPassword" className="sr-only">Confirm New Password</label>
              <div className="relative">
                <input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  autoComplete="new-password"
                  {...register("confirmNewPassword", {
                    required: "Please confirm your new password",
                    validate: value => value === newPasswordValue || "Passwords do not match",
                  })}
                  onBlur={handleConfirmPasswordBlur}
                  className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition pr-10 ${
                    formErrors.confirmNewPassword ? "border-red-500 focus:ring-red-500"
                    : isConfirmPasswordValidated ? "border-green-500 focus:ring-green-500"
                    : "border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 focus:ring-blue-500"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {isConfirmPasswordValidated && !formErrors.confirmNewPassword && (
                  <motion.div
                    className="absolute inset-y-0 right-10 flex items-center pointer-events-none"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, duration: 0.2 }}
                  > {/* Ensure space for show/hide icon */}
                     <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
              </div>
              {formErrors.confirmNewPassword && <p className="mt-1 text-xs text-red-500">{formErrors.confirmNewPassword.message}</p>}
            </div>

            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition disabled:opacity-70 flex items-center justify-center"
                whileHover={{ scale: isLoading ? 1 : 1.03 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </motion.button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
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

export default PasswordResetPage;
