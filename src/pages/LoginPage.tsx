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
} from "lucide-react"; // Added Eye, EyeOff, CheckCircle2
import ModernAuthVector from '../../components/ui/ModernAuthVector';

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
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans">
      {/* Visual Side */}
      <div className="md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 order-1 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700">
        <ModernAuthVector className="w-2/3 max-w-sm h-auto mx-auto text-sky-400 dark:text-sky-300 transition-opacity duration-1000 ease-in-out opacity-100" />
        <p className="font-display text-2xl md:text-3xl font-semibold text-center text-slate-100 dark:text-slate-50 mt-8">
          Welcome Back to Runweek.
        </p>
      </div>

      {/* Functional Side (Form Panel) */}
      <div className="md:w-1/2 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 order-2">
        {/* The card that holds the form content */}
        <div className="bg-card p-6 sm:p-8 md:p-10 lg:p-12 rounded-xl shadow-2xl w-full max-w-md space-y-8">
          {/* App Logo */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-4xl font-bold font-display text-slate-800 dark:text-slate-100">
              Runweek
            </h1>
          </div>

          {/* Page Title/Context (replaces old Activity icon and H2) */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
              Login to your account
            </h2>
          </div>

          {/* Social Login Options */}
          <div className="my-6 space-y-3">
            {" "}
            {/* Adjusted spacing for social buttons */}
            <div className="relative">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-slate-500 dark:text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => console.log("Login with Google placeholder")}
              className="flex items-center justify-center w-full py-3 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-card transition-colors duration-150"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Sign in with Google
            </button>
            <button
              type="button"
              onClick={() => console.log("Login with Apple placeholder")}
              className="flex items-center justify-center w-full py-3 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-card transition-colors duration-150"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 mr-2"
              >
                {" "}
                {/* Placeholder Apple Icon */}
                <path d="M12.016 6.496c-.13.004-.303.004-.515.004-.213 0-.385 0-.516-.004C8.24 6.48 6.496 8.24 6.496 10.98c0 2.772 2.184 4.464 4.464 4.464.213 0 .385 0 .516.004.13-.004.303-.004.515-.004 2.74 0 4.484-2.184 4.484-4.92 0-2.752-2.184-4.484-4.944-4.484zm0-2.496c2.088 0 3.72.464 4.92 1.368.06.048.144.144.144.24 0 .12-.072.204-.168.264-1.032.648-1.728 1.704-1.728 2.988 0 1.2.528 2.016 1.368 2.712.108.084.168.18.168.312 0 .144-.084.264-.204.336-1.056.66-2.424 1.056-3.912 1.056s-2.856-.396-3.912-1.056c-.12-.072-.204-.192-.204-.336s.06-.228.168-.312c.84-.696 1.368-1.512 1.368-2.712 0-1.284-.696-2.34-1.728-2.988-.096-.06-.168-.144-.168-.264.012-.096.084-.192.144-.24C8.296 4.464 9.928 4 12.016 4z" />
              </svg>
              Sign in with Apple
            </button>
          </div>

          {/* API error display */}
          {apiError && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              {" "}
              {/* Removed mb-4, space-y-6 on card handles it */}
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">
                {typeof apiError === "string"
                  ? apiError
                  : "Login failed. Please try again."}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {" "}
            {/* This form's space-y might need adjustment if API error is also part of this flow */}
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="relative" style={{ minHeight: "180px" }}>
              {" "}
              {/* Adjusted min-height for Step X/Y text and error messages */}
              {/* Email Step */}
              <div
                className={`absolute w-full transform transition-all duration-300 ease-in-out ${
                  currentStep === "email"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-5 pointer-events-none h-0"
                }`}
              >
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                  Step 1/2
                </p>
                <div className="relative">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
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
                    className={`relative block w-full rounded-lg px-4 py-3.5 text-base bg-input text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 border ${
                      formErrors.email
                        ? "border-red-500"
                        : isEmailValidated
                        ? "border-green-500 dark:border-green-400"
                        : "border-slate-300 dark:border-slate-700"
                    } focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-blue-600 dark:focus:border-blue-500`}
                    placeholder="Email address"
                  />
                  {isEmailValidated && !formErrors.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                    </div>
                  )}
                </div>
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 py-1">
                    {formErrors.email.message}
                  </p>
                )}
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className="group relative w-full flex justify-center items-center py-3.5 px-6 border border-transparent text-base font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-70"
                  >
                    Next
                  </button>
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
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                  Step 2/2
                </p>
                <div className="mb-2">
                  {" "}
                  {/* Reduced mb for tighter layout */}
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 dark:focus:ring-offset-slate-900 rounded-sm transform transition-opacity duration-150 ease-in-out hover:opacity-80 active:opacity-70"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />{" "}
                    {isEmailValidated && emailValue
                      ? emailValue
                      : "Back to email"}
                  </button>
                  {/* Removed the separate p tag for emailValue, integrated into back button text or implicitly known */}
                </div>
                <div className="relative">
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    ref={passwordInputRef}
                    autoComplete="current-password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className={`relative block w-full rounded-lg px-4 py-3.5 text-base bg-input text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 border ${
                      formErrors.password
                        ? "border-red-500"
                        : "border-slate-300 dark:border-slate-700"
                    } focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-blue-600 dark:focus:border-blue-500 pr-10`} // Added pr-10 for icon space
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 rounded-md"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 py-1">
                    {formErrors.password.message}
                  </p>
                )}
                <div className="flex items-center justify-end pt-2 text-sm">
                  {" "}
                  {/* Reduced top padding */}
                  <Link
                    to={`/forgot-password${
                      redirectUrlFromQuery
                        ? `?redirect=${encodeURIComponent(
                            redirectUrlFromQuery
                          )}`
                        : ""
                    }`}
                    className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 focus:outline-none focus:underline focus:ring-1 focus:ring-blue-500 dark:focus:ring-offset-slate-900 rounded-sm"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center items-center py-3.5 px-6 border border-transparent text-base font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-70"
                  >
                    {isLoading && (
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    )}
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* "Don't have an account?" Link - moved after form and social login */}
          <div className="mt-8 text-center">
            {" "}
            {/* This div might be redundant if card's space-y handles it */}
            <p className="text-base text-gray-600 dark:text-slate-300">
              Don't have an account?{" "}
              <Link
                to={`/register${
                  redirectUrlFromQuery
                    ? `?redirect=${encodeURIComponent(redirectUrlFromQuery)}`
                    : ""
                }`}
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 focus:outline-none focus:underline focus:ring-1 focus:ring-blue-500 dark:focus:ring-offset-slate-900 rounded-sm"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
