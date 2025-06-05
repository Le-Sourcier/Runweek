import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { MailQuestion, Loader2 } from 'lucide-react'; // Optional icon, Added Loader2

interface PasswordRecoveryRequestFormInputs {
  email: string;
}

const PasswordRecoveryRequestPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectQuery = queryParams.get('redirect');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { register, handleSubmit, formState: { errors: formErrors }, reset } = useForm<PasswordRecoveryRequestFormInputs>({
    mode: 'onBlur'
  });

  const onSubmit: SubmitHandler<PasswordRecoveryRequestFormInputs> = async (data) => {
    setIsLoading(true);
    setMessage(null); // Clear previous messages
    console.log('Password recovery request for email:', data.email);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    // Display generic message to prevent user enumeration
    setMessage('If an account with this email exists, a password reset link has been sent. Please check your inbox.');
    reset(); // Clear the form fields
  };

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row w-full">
      {/* Illustration Column */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 items-center justify-center p-12 border-r border-gray-200 transition-opacity duration-700 ease-in-out">
        {/* Placeholder SVG 2 - Security/Key Theme */}
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-3/4 max-w-lg h-auto transition-opacity duration-1000 ease-in-out opacity-100"> {/* Added transition & opacity */}
          <defs>
            <linearGradient id="grad2PRec" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgb(96,165,250)', stopOpacity: 1 }} /> {/* blue-400 */}
              <stop offset="100%" style={{ stopColor: 'rgb(37,99,235)', stopOpacity: 1 }} />  {/* blue-600 */}
            </linearGradient>
          </defs>
          <path fill="url(#grad2PRec)" d="M72.4,-13.1C80.7,10.5,64.6,43.4,39.9,59.9C15.2,76.4,-18.1,76.6,-41.1,59.5C-64.1,42.4,-76.8,8.1,-69.2,-16.9C-61.6,-41.9,-33.7,-57.6,-3.3,-56.7C27.2,-55.8,54.3,-36.7,72.4,-13.1Z" transform="translate(100 100)" />
          <rect x="75" y="75" width="50" height="70" rx="5" fill="white" strokeWidth="3" opacity="0.9" stroke="rgb(29,78,216)" /> {/* blue-700 for stroke */}
          <circle cx="100" cy="65" r="15" fill="white" strokeWidth="3" opacity="0.9" stroke="rgb(29,78,216)" /> {/* blue-700 for stroke */}
          <rect x="95" y="90" width="10" height="20" fill="rgb(29,78,216)" opacity="0.9" /> {/* blue-700 for fill */}
        </svg>
      </div>

      {/* Form Column */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-xl shadow-2xl"> {/* Adjusted space-y, shadow */}
          <div className="text-center">
            <div className="mb-8"> {/* Added margin-bottom for separation */}
            <MailQuestion className="mx-auto h-14 w-auto text-blue-600" /> {/* Changed indigo to blue */}
            <h2 className="mt-8 text-4xl font-extrabold text-gray-900">Forgot Your Password?</h2> {/* Consistent title styling */}
          </div>
          {!message && (
            <p className="mt-4 text-base text-gray-600"> {/* Consistent paragraph styling, increased spacing if title is larger */}
              No problem! Enter your email address below, and if it's associated with an account, we'll send you a link to reset your password.
            </p>
          )}
        </div>

        {message && (
          <div className="p-4 text-base text-green-700 bg-green-100 rounded-md text-center"> {/* Increased text size */}
            {message}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Consistent form spacing */}
            <div>
              <label htmlFor="email" className="sr-only">Email Address</label>
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
                className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-base`} // Ensure consistent focus
              />
              {formErrors.email && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.email.message}</p>} {/* Changed text-xs to text-sm */}
            </div>
            <div className="pt-4"> {/* Added pt-4 for spacing */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-500 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95" // Added animations
              >
                {isLoading && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                {isLoading ? 'Sending...' : 'Send Password Reset Link'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center"> {/* Consistent margin top relative to card's space-y */}
          <Link
            to={`/login${redirectQuery ? `?redirect=${encodeURIComponent(redirectQuery)}` : ''}`}
            className="font-semibold text-blue-600 hover:text-blue-500 text-base focus:outline-none focus:underline focus:ring-1 focus:ring-blue-500 rounded-sm" // Added focus styling
          >
            Back to Login
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryRequestPage;
