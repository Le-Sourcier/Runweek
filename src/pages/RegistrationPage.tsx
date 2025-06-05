import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, Loader2, Facebook, Chrome } from 'lucide-react'; // Added Facebook, Chrome

// Define an interface for form inputs
interface RegistrationFormInputs {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectQuery = queryParams.get('redirect');
  // Using local state for registration messages, not context error for this page
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<false>(false); // For button state

  const { register, handleSubmit, watch, formState: { errors: formErrors } } = useForm<RegistrationFormInputs>({
    mode: 'onBlur' // Validate on blur for better user experience
  });

  // Watch password field to compare with confirmPassword
  const password = watch('password', '');

  const onSubmit: SubmitHandler<RegistrationFormInputs> = async (data) => {
    setIsLoading(true);
    setRegistrationError(null);
    setRegistrationSuccess(null);

    console.log('Registration data:', data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Placeholder logic:
    // In a real app, you'd handle potential errors from the API here by calling setRegistrationError
    // For now, we'll assume success.
    setRegistrationSuccess('Registration successful! Redirecting to login...');
    setIsLoading(false);

    setTimeout(() => {
      navigate(redirectQuery ? `/login?redirect=${encodeURIComponent(redirectQuery)}` : '/login');
    }, 2500); // 2.5 second delay before redirect
  };

  return (
    <div className="flex items-center justify-center min-h-screen font-sans bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8"> {/* Added font-sans, gradient background */}
      <div className="w-full max-w-md p-10 space-y-10 bg-white rounded-xl shadow-lg"> {/* Consistent card padding and spacing */}
        <div className="text-center">
          <div className="mb-8"> {/* Added margin-bottom for separation */}
            <UserPlus className="mx-auto h-14 w-auto text-blue-600" /> {/* Changed indigo to blue */}
            <h2 className="mt-8 text-4xl font-extrabold text-gray-900"> {/* Consistent title styling */}
              Create your Runweek Account
            </h2>
          </div>
        </div>

        {registrationSuccess && (
          <div className="p-4 text-base text-green-700 bg-green-100 rounded-md text-center"> {/* Increased text size */}
            {registrationSuccess}
          </div>
        )}
        {registrationError && (
          <div className="p-4 text-base text-red-700 bg-red-100 rounded-md text-center"> {/* Increased text size */}
            {registrationError}
          </div>
        )}

        {!registrationSuccess && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Consistent form spacing, removed mt-8 */}
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Full Name"
                {...register('fullName', { required: 'Full name is required' })}
                className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-base`} // Changed indigo to blue
              />
              {formErrors.fullName && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.fullName.message}</p>} {/* Changed text-xs to text-sm */}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Invalid email address'
                  }
                })}
                className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-base`} // Changed indigo to blue
              />
              {formErrors.email && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.email.message}</p>} {/* Changed text-xs to text-sm */}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
                className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-base`} // Changed indigo to blue
              />
              {formErrors.password && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.password.message}</p>} {/* Changed text-xs to text-sm */}
              {/* TODO: Add password strength indicator component here */}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-base`} // Changed indigo to blue
              />
              {formErrors.confirmPassword && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.confirmPassword.message}</p>} {/* Changed text-xs to text-sm */}
            </div>

            <div className="pt-4"> {/* Added pt-4 for spacing before button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-500" // Added items-center
              >
                {isLoading && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {!registrationSuccess && ( // Show social logins only if registration form is visible
          <div>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => console.log('Register with Google placeholder')} // Placeholder action
                  className="inline-flex w-full justify-center items-center rounded-md bg-white px-4 py-2.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 text-sm"
                >
                  <span className="sr-only">Sign up with Google</span>
                  <Chrome className="h-5 w-5 mr-2" aria-hidden="true" />
                  Google
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => console.log('Register with Facebook placeholder')} // Placeholder action
                  className="inline-flex w-full justify-center items-center rounded-md bg-white px-4 py-2.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 text-sm"
                >
                  <span className="sr-only">Sign up with Facebook</span>
                  <Facebook className="h-5 w-5 mr-2" aria-hidden="true" />
                  Facebook
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center"> {/* Consistent margin top */}
          <p className="text-base text-gray-600">
            Already have an account?{' '}
            <Link
              to={`/login${redirectQuery ? `?redirect=${encodeURIComponent(redirectQuery)}` : ''}`}
              className="font-semibold text-blue-600 hover:text-blue-500" // Changed indigo to blue
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
