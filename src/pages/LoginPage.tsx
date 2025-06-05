import React, { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Loader2,
  Chrome,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { useUser, UserCredentials } from "../context/UserContext";

type LoginFormInputs = UserCredentials;

type Step = "email" | "password";

const LoginPage: React.FC = () => {
  const { login, error: apiError, isAuthenticated, isLoading } = useUser();
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

  useEffect(() => {
    if (isEmailValidated) {
      setIsEmailValidated(false);
    }
  }, [emailValue]);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    await login(data);
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
    setCurrentStep("email");
  };

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row w-full">
      {/* Visual Side */}
      <div className="w-full md:w-1/2 h-80 md:min-h-screen flex flex-col items-center justify-center p-8 order-1 md:order-1 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <Activity className="h-12 w-12 text-primary mx-auto" />
            <h1 className="text-3xl font-bold font-display text-foreground mt-4">
              Welcome to Runweek
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your progress, achieve your goals, and become a better runner with AI-powered coaching.
            </p>
          </div>
          
          <div className="relative mt-12">
            <img
              src="https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg"
              alt="Runner at sunset"
              className="rounded-2xl shadow-xl w-full object-cover aspect-[4/3]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 order-2 md:order-2">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-50">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
              Welcome back! Please enter your details.
            </p>
          </div>

          {apiError && (
            <div className="p-4 text-sm text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg text-center">
              {typeof apiError === "string" ? apiError : "Login failed. Please try again."}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="relative" style={{ minHeight: "150px" }}>
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
                    className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${
                      formErrors.email
                        ? "border-red-500"
                        : isEmailValidated
                        ? "border-green-500 dark:border-green-400"
                        : "border-gray-300 dark:border-slate-700"
                    } placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-50 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 sm:text-base`}
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
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 disabled:bg-primary-500 transform transition-all duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continue
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
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Step 2/2
                  </p>
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="text-sm text-primary hover:text-primary-600 dark:hover:text-primary-400 font-medium focus:outline-none focus:underline"
                  >
                    <ArrowLeft className="h-4 w-4 inline mr-1" />
                    Back to email
                  </button>
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
                    className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${
                      formErrors.password
                        ? "border-red-500"
                        : "border-gray-300 dark:border-slate-700"
                    } placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-50 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 sm:text-base pr-10`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-slate-900 rounded-md"
                    aria-label={showPassword ? "Hide password" : "Show password"}
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

                <div className="flex items-center justify-end mt-2">
                  <Link
                    to={`/forgot-password${
                      redirectUrlFromQuery
                        ? `?redirect=${encodeURIComponent(redirectUrlFromQuery)}`
                        : ""
                    }`}
                    className="text-sm text-primary hover:text-primary-600 dark:hover:text-primary-400 font-medium focus:outline-none focus:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 disabled:bg-primary-500 transform transition-all duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading && (
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    )}
                    {isLoading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => console.log("Sign in with Google")}
                className="w-full inline-flex justify-center py-2.5 px-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 shadow-sm text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 transform transition-all duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
              >
                <Chrome className="h-5 w-5 mr-2" />
                Google
              </button>

              <button
                type="button"
                onClick={() => console.log("Sign in with Apple")}
                className="w-full inline-flex justify-center py-2.5 px-4 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 shadow-sm text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-slate-900 transform transition-all duration-150 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                Apple
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Don't have an account?{" "}
              <Link
                to={`/register${
                  redirectUrlFromQuery
                    ? `?redirect=${encodeURIComponent(redirectUrlFromQuery)}`
                    : ""
                }`}
                className="font-medium text-primary hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:underline"
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