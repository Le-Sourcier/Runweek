import React, { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useUser, UserCredentials } from "../context/UserContext"; // UserCredentials imported
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  Chrome,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  // Chrome, // Not used directly, FaGoogle is used
  // Apple, // Not used, FaApple is used
} from "lucide-react"; // Added Eye, EyeOff, CheckCircle2
import { motion } from "framer-motion";
import ModernAuthVector from "../components/ui/ModernAuthVector";
import AuthLayout from "../components/ui/AuthLayout";
import AuthFormCard from "../components/ui/AuthFormCard";
import { FaGoogle, FaApple } from "react-icons/fa"; // Using react-icons for consistency if lucide-react doesn't have Apple

// Define an interface for form inputs - matches UserCredentials for simplicity here
type LoginFormInputs = UserCredentials;

type Step = "email" | "password";

const LoginPage: React.FC = () => {
  const { login, error: apiError, isAuthenticated, isLoading } = useUser(); // Renamed error to apiError for clarity
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrlFromQuery = searchParams.get("redirect");
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailValidated, setIsEmailValidated] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const isValidRedirectPath = (path: string | null): boolean => {
    if (!path) return false;
    if (!path.startsWith("/")) return false;
    if (path.startsWith("//") || path.includes("://")) return false;
    return true;
  };

  let finalRedirectPath = "/";
  if (isValidRedirectPath(redirectUrlFromQuery)) {
    finalRedirectPath = redirectUrlFromQuery!;
  }

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    trigger,
    watch,
  } = useForm<LoginFormInputs>({
    mode: "onBlur",
  });

  const emailValue = watch("email");

  // Effect to reset email validation status if email value changes and it was previously marked as validated.
  // This ensures the checkmark disappears if the user modifies a validated email.
  useEffect(() => {
    if (isEmailValidated) {
      setIsEmailValidated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailValue]); // Only re-run if emailValue changes, no need to include isEmailValidated in deps

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    await login(data);
    // Navigation handled by useEffect
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(finalRedirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, finalRedirectPath]);

  useEffect(() => {
    if (currentStep === "password" && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [currentStep]);

  const handleNextStep = async () => {
    const emailIsValid = await trigger("email");
    if (emailIsValid) {
      setIsEmailValidated(true);
      setCurrentStep("password");
    } else {
      setIsEmailValidated(false);
    }
  };

  const handleBackStep = () => {
    // When going back, user might want to change email.
    // Validation status will be reset by the useEffect watching emailValue if they type.
    // If they don't type and click Next, trigger('email') will re-validate.
    setCurrentStep("email");
  };

  return (
    <AuthLayout
      leftPanelContent={
        <div className="flex flex-col items-center justify-center w-full md:h-full bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 p-8 py-12 sm:py-16 md:p-12">
          <ModernAuthVector className="w-2/3 max-w-xs sm:max-w-sm h-auto mx-auto text-sky-400 dark:text-sky-300" />
          <p className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-center text-slate-100 dark:text-slate-50 mt-6 sm:mt-8">
            Welcome Back to Runweek.
          </p>
        </div>
      }
      rightPanelContent={
        <div className="w-full h-full flex flex-col justify-center items-center">
          <AuthFormCard className="w-full max-w-md">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-4xl font-bold font-display text-slate-800 dark:text-slate-100">
                Runweek
              </h1>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-center text-slate-700 dark:text-slate-200 mb-6">
              Login to your account
            </h2>

            {/* Social Login Options */}
            <div className="space-y-3 mb-6">
              <motion.button
                type="button"
                onClick={() => console.log("Login with Google placeholder")}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition text-gray-700 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaGoogle className="text-red-500 mr-2" size={18} />
                <span className="font-medium">Login with Google</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => console.log("Login with Apple placeholder")}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition text-gray-700 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaApple className="text-black dark:text-white mr-2" size={18} />
                <span className="font-medium">Login with Apple</span>
              </motion.button>
            </div>

            {/* Separator “or” */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
              <span className="px-3 text-gray-400 dark:text-slate-500 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
            </div>


            {apiError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">
                  {typeof apiError === "string"
                    ? apiError
                    : "Login failed. Please try again."}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" name="remember" defaultValue="true" />
              <div className="relative" style={{ minHeight: "150px" }}>
                {/* Adjusted min-height */}
                {/* Email Step */}
                <div
                  className={`absolute w-full transform transition-all duration-300 ease-in-out ${
                    currentStep === "email"
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-5 pointer-events-none h-0"
                  }`}
                >
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                    Step 1/2
                  </p>
                  <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: "Invalid email address",
                          },
                        })}
                        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition ${
                          formErrors.email
                            ? "border-red-500 focus:ring-red-500"
                            : isEmailValidated
                            ? "border-green-500 focus:ring-green-500"
                            : "border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 focus:ring-blue-500"
                        }`}
                        placeholder="email@example.com"
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
                  <div className="pt-4">
                    <motion.button
                      type="button"
                      onClick={handleNextStep}
                      disabled={isLoading}
                      className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition disabled:opacity-70"
                      whileHover={{ scale: isLoading ? 1 : 1.03 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      Next
                    </motion.button>
                  </div>
                </div>

                {/* Password Step */}
                <div
                  className={`absolute w-full transform transition-all duration-300 ease-in-out ${
                    currentStep === "password"
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-5 pointer-events-none h-0"
                  }`}
                >
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                    Step 2/2
                  </p>
                  <div className="mb-1">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="flex items-center text-xs text-red-500 hover:underline"
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      {isEmailValidated && emailValue ? emailValue : "Back to email"}
                    </button>
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        ref={passwordInputRef}
                        autoComplete="current-password"
                        {...register("password", {
                          required: "Password is required",
                        })}
                        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 transition pr-10 ${
                            formErrors.password ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 focus:ring-blue-500"
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition dark:text-slate-500 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="text-right mt-1">
                    <Link
                      to={`/forgot-password${redirectUrlFromQuery ? `?redirect=${encodeURIComponent(redirectUrlFromQuery)}` : ""}`}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="pt-4">
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
                      {isLoading ? "Logging in..." : "Login"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500 dark:text-slate-400">
              Don’t have an account?{" "}
              <Link
                to={`/register${redirectUrlFromQuery ? `?redirect=${encodeURIComponent(redirectUrlFromQuery)}` : ""}`}
                className="text-red-500 hover:underline font-medium"
                 /* For Link components, if we want motion, we'd wrap the interactive child or use motion(Link) if library supports it */
              >
                Sign up
              </Link>
            </p>
          </AuthFormCard>
        </div>
      }
      className="bg-slate-100 dark:bg-slate-900" // Overall page background
    />
  );
};

export default LoginPage;
