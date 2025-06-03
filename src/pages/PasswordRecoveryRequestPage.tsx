import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { MailQuestion } from 'lucide-react'; // Optional icon

interface PasswordRecoveryRequestFormInputs {
  email: string;
}

const PasswordRecoveryRequestPage: React.FC = () => {
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <MailQuestion className="mx-auto h-12 w-auto text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Forgot Your Password?</h2>
          {!message && ( // Hide paragraph if message is shown
            <p className="mt-2 text-sm text-gray-600">
              No problem! Enter your email address below, and if it's associated with an account, we'll send you a link to reset your password.
            </p>
          )}
        </div>

        {message && (
          <div className="p-4 text-sm text-green-700 bg-green-100 rounded-md text-center">
            {message}
          </div>
        )}

        {/* Show form only if no message is set, or allow resubmission if desired (current logic hides form) */}
        {!message && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
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
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
              />
              {formErrors.email && <p className="mt-2 text-xs text-red-600">{formErrors.email.message}</p>}
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isLoading ? 'Sending...' : 'Send Password Reset Link'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryRequestPage;
