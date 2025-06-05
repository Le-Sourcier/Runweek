import React, { useState, useEffect } from 'react'; // Added useEffect
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'; // Added new icons

interface PasswordResetFormInputs {
  newPassword: string;
  confirmNewPassword: string;
}

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();

  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNewPasswordValidated, setIsNewPasswordValidated] = useState(false);
  const [isConfirmPasswordValidated, setIsConfirmPasswordValidated] = useState(false);

  const { register, handleSubmit, watch, formState: { errors: formErrors, dirtyFields }, reset, trigger } = useForm<PasswordResetFormInputs>({
    mode: 'onBlur'
  });

  const newPasswordValue = watch('newPassword', '');
  const confirmPasswordValue = watch('confirmNewPassword', '');

  // Effects to reset validation status if values change
  useEffect(() => { if (isNewPasswordValidated) setIsNewPasswordValidated(false); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPasswordValue]);
  useEffect(() => { if (isConfirmPasswordValidated) setIsConfirmPasswordValidated(false); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmPasswordValue]);

  // Also reset confirm password validation if new password changes, as its validity depends on newPassword
  useEffect(() => {
    if (isConfirmPasswordValidated) setIsConfirmPasswordValidated(false);
      // If newPassword changes, trigger revalidation of confirmPassword if it was touched
      if (dirtyFields.confirmNewPassword) {
        trigger('confirmNewPassword');
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPasswordValue]);


  const handleNewPasswordBlur = async () => {
    const isValid = await trigger('newPassword');
    setIsNewPasswordValidated(isValid && !formErrors.newPassword);
    // Also re-validate confirm password if new password changes & confirm was touched
    if (dirtyFields.confirmNewPassword) {
        const isConfirmStillValid = await trigger('confirmNewPassword');
        setIsConfirmPasswordValidated(isConfirmStillValid && !formErrors.confirmNewPassword);
    }
  };

  const handleConfirmPasswordBlur = async () => {
    const isValid = await trigger('confirmNewPassword');
    // Confirm password validation depends on newPassword as well.
    // The form schema validation `validate: value => value === newPasswordValue` handles this.
    setIsConfirmPasswordValidated(isValid && !formErrors.confirmNewPassword && !formErrors.newPassword && !!newPasswordValue);
  };

  // React.useEffect(() => {
  //   // In a real app, validate the token here.
  //   // If token is invalid, redirect or show an error.
  //   // console.log("Token from URL:", token);
  // }, [token]); // Omitted token logic

  const onSubmit: SubmitHandler<PasswordResetFormInputs> = async (data) => {
    setIsLoading(true);
    setResetError(null); // Clear previous errors
    setResetSuccess(null); // Clear previous success messages

    // In a real app, DO NOT log passwords. This is for placeholder demonstration only.
    console.log('Password reset data:', { newPassword: data.newPassword });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsLoading(false);
    // Placeholder logic:
    setResetSuccess('Password has been reset successfully! Redirecting to login...');
    reset(); // Clear the form

    setTimeout(() => {
      navigate('/login');
    }, 2500); // 2.5 second delay
  };

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row w-full">
      {/* Visual Side */}
      <div className="w-full md:w-1/2 h-80 md:min-h-screen flex flex-col items-center justify-center p-8 order-1 md:order-1 bg-blue-50 dark:bg-blue-900/20 transition-opacity duration-700 ease-in-out">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-2/3 max-w-xs h-auto mx-auto text-blue-600 dark:text-blue-400 transition-opacity duration-1000 ease-in-out opacity-100">
          <defs>
            <linearGradient id="svg2PResGradient" x1="0%" y1="0%" x2="100%" y2="100%"> {/* Unique ID */}
              <stop offset="0%" stop-color="currentColor" className="text-blue-500 dark:text-blue-300" />
              <stop offset="100%" stop-color="currentColor" className="text-blue-700 dark:text-blue-500" />
            </linearGradient>
          </defs>
          <path fill="url(#svg2PResGradient)" d="M50,10 L15,30 L15,60 Q50,95 85,60 L85,30 Z" />
          <polyline points="35,50 45,60 65,40" fill="none" stroke="white" stroke-width="5" opacity="0.9"/>
        </svg>
        <p className="font-display text-xl md:text-2xl font-semibold text-center text-slate-700 dark:text-slate-300 mt-6">
          Securely Back on Track.
        </p>
      </div>

      {/* Functional Side (Form Panel) */}
      <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 order-2 md:order-2">
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-lg shadow-xl w-full max-w-md space-y-6">
          {/* App Logo Placeholder */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display text-blue-600 dark:text-blue-400">
              Runweek
            </h1>
          </div>

          <div className="text-center">
            {/* Page specific icon removed. Title remains. */}
            <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-slate-50">Set New Password</h2>
          </div>

          {resetSuccess && (
            <div className="p-4 text-base text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-md text-center">
              {resetSuccess}
            </div>
          )}
          {resetError && (
            <div className="p-4 text-base text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-md text-center">
              {resetError}
            </div>
          )}

          {!resetSuccess && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative">
                <label htmlFor="newPassword" className="sr-only">New Password</label>
                <input id="newPassword" type={showNewPassword ? "text" : "password"} placeholder="New Password" autoComplete="new-password"
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  onBlur={handleNewPasswordBlur}
                  className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.newPassword ? 'border-red-500' : (isNewPasswordValidated ? 'border-green-500 dark:border-green-400' : 'border-gray-300 dark:border-slate-700')} placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-50 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 sm:text-base pr-10`} />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 rounded-md"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}>
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                 {isNewPasswordValidated && !formErrors.newPassword && (
                  <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none"> {/* Adjusted right padding for checkmark */}
                    <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                  </div>
                )}
                {formErrors.newPassword && <p className="mt-2 text-sm text-red-600 dark:text-red-400 py-1">{formErrors.newPassword.message}</p>}
              </div>
              <div className="relative">
                <label htmlFor="confirmNewPassword" className="sr-only">Confirm New Password</label>
                <input id="confirmNewPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" autoComplete="new-password"
                  {...register('confirmNewPassword', {
                    required: 'Please confirm your new password',
                    validate: value => value === newPasswordValue || 'Passwords do not match'
                  })}
                  onBlur={handleConfirmPasswordBlur}
                  className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.confirmNewPassword ? 'border-red-500' : (isConfirmPasswordValidated ? 'border-green-500 dark:border-green-400' : 'border-gray-300 dark:border-slate-700')} placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-50 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 sm:text-base pr-10`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 rounded-md"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {isConfirmPasswordValidated && !formErrors.confirmNewPassword && (
                  <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none"> {/* Adjusted right padding for checkmark */}
                    <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                  </div>
                )}
                {formErrors.confirmNewPassword && <p className="mt-2 text-sm text-red-600 dark:text-red-400 py-1">{formErrors.confirmNewPassword.message}</p>}
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isLoading}
                  className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:bg-blue-500 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95">
                  {isLoading && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link to="/login"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-base focus:outline-none focus:underline focus:ring-1 focus:ring-blue-500 dark:focus:ring-offset-slate-900 rounded-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
