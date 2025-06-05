import React, { useState, useEffect } from 'react'; // Added useEffect
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { MailQuestion, Loader2, CheckCircle2 } from 'lucide-react'; // Added CheckCircle2

interface PasswordRecoveryRequestFormInputs {
  email: string;
}

const PasswordRecoveryRequestPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectQuery = queryParams.get('redirect');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmailValidated, setIsEmailValidated] = useState(false);

  const { register, handleSubmit, formState: { errors: formErrors, dirtyFields }, reset, watch, trigger } = useForm<PasswordRecoveryRequestFormInputs>({
    mode: 'onBlur' // onBlur validation mode is good for this
  });

  const emailValue = watch('email');

  useEffect(() => {
    // Reset validation icon if user changes the email after it was marked valid
    if (isEmailValidated && dirtyFields.email) {
      setIsEmailValidated(false);
    }
  }, [emailValue, isEmailValidated, dirtyFields.email]);


  const handleEmailBlur = async () => {
    const isValid = await trigger('email');
    setIsEmailValidated(isValid && !formErrors.email);
  };

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
      {/* Visual Side */}
      <div className="w-full md:w-1/2 h-80 md:min-h-screen flex flex-col items-center justify-center p-8 order-1 md:order-1 bg-blue-50 dark:bg-blue-900/20 transition-opacity duration-700 ease-in-out">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-2/3 max-w-xs h-auto mx-auto text-blue-600 dark:text-blue-400 transition-opacity duration-1000 ease-in-out opacity-100">
          <defs>
            <linearGradient id="svg2PRecGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="currentColor" className="text-blue-500 dark:text-blue-300" />
              <stop offset="100%" stop-color="currentColor" className="text-blue-700 dark:text-blue-500" />
            </linearGradient>
          </defs>
          <path fill="url(#svg2PRecGradient)" d="M50,10 L15,30 L15,60 Q50,95 85,60 L85,30 Z" />
          <polyline points="35,50 45,60 65,40" fill="none" stroke="white" stroke-width="5" opacity="0.9"/>
        </svg>
        <p className="font-display text-xl md:text-2xl font-semibold text-center text-slate-700 dark:text-slate-300 mt-6">
          Securely Back on Track.
        </p>
      </div>

      {/* Functional Side (Form Panel) */}
      <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 order-2 md:order-2">
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-lg shadow-xl w-full max-w-md space-y-6">
          {/* App Logo */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl font-bold font-display text-blue-600 dark:text-blue-400">
              Runweek
            </h1>
          </div>

          {/* Page Title/Context */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-50">
              Forgot Your Password?
            </h2>
             {!message && (
              <p className="mt-3 text-base text-gray-600 dark:text-slate-300">
                No problem! Enter your email address below, and if it's associated with an account, we'll send you a link to reset your password.
              </p>
            )}
          </div>

          {message && (
            <div className="p-4 text-base text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-md text-center">
              {message}
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative">
                <label htmlFor="email" className="sr-only">Email Address</label>
                <input id="email" type="email" placeholder="Email address" autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                  })}
                  onBlur={handleEmailBlur} // Add onBlur handler
                  className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : (isEmailValidated ? 'border-green-500 dark:border-green-400' : 'border-gray-300 dark:border-slate-700')} placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-50 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 sm:text-base pr-10`} // Added pr-10 for icon
                />
                {isEmailValidated && !formErrors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                  </div>
                )}
                {formErrors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400 py-1">{formErrors.email.message}</p>}
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isLoading}
                  className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:bg-blue-500 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95">
                  {isLoading && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                  {isLoading ? 'Sending...' : 'Send Password Reset Link'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link to={`/login${redirectQuery ? `?redirect=${encodeURIComponent(redirectQuery)}` : ''}`}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-base focus:outline-none focus:underline focus:ring-1 focus:ring-blue-500 dark:focus:ring-offset-slate-900 rounded-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryRequestPage;
