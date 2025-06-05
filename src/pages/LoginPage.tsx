import React, { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useUser, UserCredentials } from "../context/UserContext"; // UserCredentials imported
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Activity, Loader2, Facebook, Chrome, ArrowLeft } from "lucide-react"; // Added Facebook, Chrome, ArrowLeft

// Define an interface for form inputs - matches UserCredentials for simplicity here
type LoginFormInputs = UserCredentials;

type Step = "email" | "password";

const LoginPage: React.FC = () => {
  const { login, error: apiError, isAuthenticated, isLoading } = useUser(); // Renamed error to apiError for clarity
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrlFromQuery = searchParams.get("redirect");
  const [currentStep, setCurrentStep] = useState<Step>("email");
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
    mode: "onBlur", // Validate on blur
  });

  const emailValue = watch("email"); // To display email on password step

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
      setCurrentStep("password");
    }
  };

  const handleBackStep = () => {
    setCurrentStep("email");
  };

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row w-full">
      {/* Illustration Column */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 items-center justify-center p-12 border-r border-gray-200 transition-opacity duration-700 ease-in-out">
        {/* Placeholder SVG 1 - User/Access Theme */}
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 max-w-lg h-auto transition-opacity duration-1000 ease-in-out opacity-100"
        >
          {" "}
          {/* Added transition and opacity */}
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "rgb(96,165,250)", stopOpacity: 1 }}
              />{" "}
              {/* blue-400 */}
              <stop
                offset="100%"
                style={{ stopColor: "rgb(37,99,235)", stopOpacity: 1 }}
              />{" "}
              {/* blue-600 */}
            </linearGradient>
          </defs>
          <path
            fill="url(#grad1)"
            d="M76.4,-71.3C96.4,-59.4,108.2,-36.9,110.1,-13.6C112,9.7,103.9,33.8,88.4,49.2C72.9,64.6,49.9,71.4,28.1,74.4C6.2,77.3,-14.5,76.5,-34.9,69.1C-55.3,61.7,-75.4,47.8,-85.6,29.7C-95.8,11.6,-96.1,-10.7,-87.8,-29.9C-79.5,-49.1,-62.6,-65.2,-43.7,-73.3C-24.8,-81.4,-3.9,-81.5,15.9,-79C35.7,-76.5,56.4,-83.3,76.4,-71.3Z"
            transform="translate(100 100)"
          />
          <circle cx="100" cy="90" r="30" fill="white" opacity="0.9" />
          <path
            fill="white"
            opacity="0.9"
            d="M100 125 C 80 125, 70 140, 70 150 L 130 150 C 130 140, 120 125, 100 125 Z"
          />
        </svg>
      </div>

      {/* Form Column */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-xl shadow-2xl">
          {" "}
          {/* Adjusted space-y, shadow */}
          <div className="text-center">
            <div className="mb-8">
              <Activity className="mx-auto h-14 w-auto text-blue-600" />
              <h2 className="mt-8 text-4xl font-extrabold text-gray-900">
                Login to Runweek
              </h2>
            </div>
          </div>
          {/* Display API error if present */}
          {apiError && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" name="remember" defaultValue="true" />
            {/* Container for steps with min-height to prevent layout jumps */}
            <div className="relative" style={{ minHeight: "160px" }}>
              {/* Increased min-height slightly */}
              {/* Email Step */}
              <div
                className={`absolute w-full transform transition-all duration-300 ease-in-out ${
                  currentStep === "email"
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-5 pointer-events-none h-0"
                }`}
              >
                <div>
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
                    className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-base`}
                    placeholder="Email address"
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-2 text-sm text-red-600 py-1">
                    {formErrors.email.message}
                  </p>
                )}

                <div className="pt-6">
                  {" "}
                  {/* Spacing for Next button */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-500 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
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
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-sm transform transition-opacity duration-150 ease-in-out hover:opacity-80 active:opacity-70"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to email
                  </button>
                  {emailValue && (
                    <p
                      className="text-sm text-gray-600 mt-1 truncate"
                      title={emailValue}
                    >
                      Logging in as: {emailValue}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    ref={passwordInputRef}
                    autoComplete="current-password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${
                      formErrors.password ? "border-red-500" : "border-gray-300"
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-base`}
                    placeholder="Password"
                  />
                </div>
                {formErrors.password && (
                  <p className="mt-2 text-sm text-red-600 py-1">
                    {formErrors.password.message}
                  </p>
                )}

                <div className="flex items-center justify-end pt-3 text-sm">
                  <Link
                    to={`/forgot-password${
                      redirectUrlFromQuery
                        ? `?redirect=${encodeURIComponent(
                            redirectUrlFromQuery
                          )}`
                        : ""
                    }`}
                    className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline focus:ring-1 focus:ring-blue-500 rounded-sm"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <div className="pt-6">
                  {" "}
                  {/* Spacing for Login button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-500 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
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
          {/* Social Login and Sign Up Link - visible regardless of step, but after form content */}
          <div>
            <div className="relative my-8">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => console.log("Login with Google placeholder")} // Placeholder action
                  className="inline-flex w-full justify-center items-center rounded-md bg-white px-4 py-2.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 text-sm transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
                >
                  <span className="sr-only">Sign in with Google</span>
                  <Chrome className="h-5 w-5 mr-2" aria-hidden="true" />
                  Google
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => console.log("Login with Facebook placeholder")} // Placeholder action
                  className="inline-flex w-full justify-center items-center rounded-md bg-white px-4 py-2.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 text-sm transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
                >
                  <span className="sr-only">Sign in with Facebook</span>
                  <Facebook className="h-5 w-5 mr-2" aria-hidden="true" />
                  Facebook
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            {" "}
            {/* Ensure this still has appropriate spacing relative to card's space-y */}
            <p className="text-base text-gray-600">
              Don't have an account?{" "}
              <Link
                to={`/register${
                  redirectUrlFromQuery
                    ? `?redirect=${encodeURIComponent(redirectUrlFromQuery)}`
                    : ""
                }`}
                className="font-semibold text-blue-600 hover:text-blue-500 focus:outline-none focus:underline focus:ring-1 focus:ring-blue-500 rounded-sm"
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
