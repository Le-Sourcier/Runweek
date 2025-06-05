import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useUser, UserCredentials } from '../context/UserContext'; // UserCredentials imported
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, Loader2, Facebook, Chrome } from 'lucide-react'; // Added Facebook, Chrome for social login

// Define an interface for form inputs - matches UserCredentials for simplicity here
interface LoginFormInputs extends UserCredentials {}

const LoginPage: React.FC = () => {
  const { login, error, isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrlFromQuery = searchParams.get('redirect');

  const isValidRedirectPath = (path: string | null): boolean => {
    if (!path) return false;
    // Must be a relative path starting with '/'
    if (!path.startsWith('/')) return false;
    // Must not start with '//' or contain '://'
    if (path.startsWith('//') || path.includes('://')) return false;
    return true;
  };

  let finalRedirectPath = '/'; // Default
  if (isValidRedirectPath(redirectUrlFromQuery)) {
    finalRedirectPath = redirectUrlFromQuery!;
  }

  const { register, handleSubmit, formState: { errors: formErrors } } = useForm<LoginFormInputs>();

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
    <div className="flex items-center justify-center min-h-screen font-sans bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8"> {/* Added font-sans, gradient background */}
      <div className="w-full max-w-md p-10 space-y-10 bg-white rounded-xl shadow-lg"> {/* Increased p-8 to p-10 and space-y-8 to space-y-10 */}
        <div className="text-center">
          {/* Increased top margin for logo and title container */}
          <div className="mb-8"> {/* Added margin-bottom for separation before the form */}
            <Activity className="mx-auto h-14 w-auto text-blue-600" /> {/* Changed indigo to blue */}
            <h2 className="mt-8 text-4xl font-extrabold text-gray-900"> {/* Increased mt-6 to mt-8 and text-3xl to text-4xl */}
              Login to Runweek
            </h2>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Removed mt-8, relying on parent space-y and adjusted individual items */}
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Invalid email address'
                  }
                })}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`} /* Changed indigo to blue */
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password', { required: 'Password is required' })}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`} /* Changed indigo to blue */
                placeholder="Password"
              />
            </div>
          </div>

          {formErrors.email && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.email.message}</p>} {/* Changed text-xs to text-sm */}
          {formErrors.password && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.password.message}</p>} {/* Changed text-xs to text-sm */}

          {/* Login error from context is now handled by toast notification */}

          <div className="flex items-center justify-end pt-2"> {/* Added pt-2 for spacing */}
            <div className="text-sm">
              <Link
                to={`/forgot-password${redirectUrlFromQuery ? `?redirect=${encodeURIComponent(redirectUrlFromQuery)}` : ''}`}
                className="font-medium text-blue-600 hover:text-blue-500" /* Changed indigo to blue */
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div className="pt-4"> {/* Added pt-4 for spacing */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-500" // Added items-center for spinner alignment
            >
              {isLoading && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div>
          <div className="relative my-8"> {/* Adjusted margin for visual balance with space-y-10 */}
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <button
                type="button"
                onClick={() => console.log('Login with Google placeholder')} // Placeholder action
                className="inline-flex w-full justify-center items-center rounded-md bg-white px-4 py-2.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 text-sm"
              >
                <span className="sr-only">Sign in with Google</span>
                <Chrome className="h-5 w-5 mr-2" aria-hidden="true" />
                Google
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => console.log('Login with Facebook placeholder')} // Placeholder action
                className="inline-flex w-full justify-center items-center rounded-md bg-white px-4 py-2.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 text-sm"
              >
                <span className="sr-only">Sign in with Facebook</span>
                <Facebook className="h-5 w-5 mr-2" aria-hidden="true" />
                Facebook
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center"> {/* Ensure this still has appropriate spacing */}
          <p className="text-base text-gray-600">
            Don't have an account?{' '}
            <Link
              to={`/register${redirectUrlFromQuery ? `?redirect=${encodeURIComponent(redirectUrlFromQuery)}` : ''}`}
              className="font-semibold text-blue-600 hover:text-blue-500" /* Changed indigo to blue */
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
