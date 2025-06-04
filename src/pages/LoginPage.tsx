import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useUser, UserCredentials } from "../context/UserContext"; // UserCredentials imported
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Activity } from "lucide-react"; // For logo/app name

// Define an interface for form inputs - matches UserCredentials for simplicity here
type LoginFormInputs = UserCredentials;

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrlFromQuery = searchParams.get("redirect");

  const isValidRedirectPath = (path: string | null): boolean => {
    if (!path) return false;
    // Must be a relative path starting with '/'
    if (!path.startsWith("/")) return false;
    // Must not start with '//' or contain '://'
    if (path.startsWith("//") || path.includes("://")) return false;
    return true;
  };

  let finalRedirectPath = "/"; // Default
  if (isValidRedirectPath(redirectUrlFromQuery)) {
    finalRedirectPath = redirectUrlFromQuery!;
  }

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    await login(data);
    // Navigation upon successful login will be handled by useEffect below
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(finalRedirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, finalRedirectPath]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-auto text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Login to Runweek
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
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
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password", { required: "Password is required" })}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  formErrors.password ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
              />
            </div>
          </div>

          {formErrors.email && (
            <p className="mt-2 text-xs text-red-600">
              {formErrors.email.message}
            </p>
          )}
          {formErrors.password && (
            <p className="mt-2 text-xs text-red-600">
              {formErrors.password.message}
            </p>
          )}

          {/* Login error from context is now handled by toast notification */}

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                to={`/forgot-password${
                  redirectUrlFromQuery
                    ? `?redirect=${encodeURIComponent(redirectUrlFromQuery)}`
                    : ""
                }`}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to={`/register${
                redirectUrlFromQuery
                  ? `?redirect=${encodeURIComponent(redirectUrlFromQuery)}`
                  : ""
              }`}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
