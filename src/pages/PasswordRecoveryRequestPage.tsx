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
    <div className="flex items-center justify-center min-h-screen font-sans bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8"> {/* Added font-sans, gradient background */}
      <div className="w-full max-w-md p-10 space-y-10 bg-white rounded-xl shadow-lg"> {/* Consistent card padding and spacing */}
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
                className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-base`} // Changed indigo to blue
              />
              {formErrors.email && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.email.message}</p>} {/* Changed text-xs to text-sm */}
            </div>
            <div className="pt-4"> {/* Added pt-4 for spacing */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-500" // Added items-center
              >
                {isLoading && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                {isLoading ? 'Sending...' : 'Send Password Reset Link'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center"> {/* Consistent margin top */}
          <Link
            to={`/login${redirectQuery ? `?redirect=${encodeURIComponent(redirectQuery)}` : ''}`}
            className="font-semibold text-blue-600 hover:text-blue-500 text-base" // Changed indigo to blue
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryRequestPage;
