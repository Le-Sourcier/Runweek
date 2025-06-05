import React, { useState, useEffect } from 'react'; // Added useEffect
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';
import { MailQuestion, Loader2, CheckCircle2 } from 'lucide-react'; // Added CheckCircle2
import ModernAuthVector from '../../components/ui/ModernAuthVector';

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
    <div className="min-h-screen flex flex-col md:flex-row w-full font-sans">
      {/* Visual Side */}
      <div className="md:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 order-1 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700">
        <ModernAuthVector className="w-2/3 max-w-sm h-auto mx-auto text-sky-400 dark:text-sky-300 transition-opacity duration-1000 ease-in-out opacity-100" />
        <p className="font-display text-2xl md:text-3xl font-semibold text-center text-slate-100 dark:text-slate-50 mt-8">
          Regain Access to Runweek.
        </p>
      </div>

      {/* Functional Side (Form Panel) */}
      <div className="md:w-1/2 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 order-2">
        <div className="bg-card p-6 sm:p-8 md:p-10 lg:p-12 rounded-xl shadow-2xl w-full max-w-md space-y-8">
          {/* App Logo */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-4xl font-bold font-display text-slate-800 dark:text-slate-100">
              Runweek
            </h1>
          </div>

          {/* Page Title/Context */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
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
                  className={`relative block w-full rounded-lg px-4 py-3.5 text-base bg-input text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 border ${formErrors.email ? 'border-red-500' : (isEmailValidated ? 'border-green-500 dark:border-green-400' : 'border-slate-300 dark:border-slate-700')} focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-blue-600 dark:focus:border-blue-500 pr-10`}
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
                  className="group relative w-full flex justify-center items-center py-3.5 px-6 border border-transparent text-base font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-70">
                  {isLoading && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                  {isLoading ? 'Sending...' : 'Send Password Reset Link'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link to={`/login${redirectQuery ? `?redirect=${encodeURIComponent(redirectQuery)}` : ''}`}
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 text-base focus:outline-none focus:underline focus:ring-1 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryRequestPage;
