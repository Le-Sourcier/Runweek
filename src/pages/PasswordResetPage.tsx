import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom'; // Removed useParams for this mockup
import { KeyRound } from 'lucide-react'; // Optional icon

interface PasswordResetFormInputs {
  newPassword: string;
  confirmNewPassword: string;
}

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  // const { token } = useParams<{ token: string }>(); // For actual implementation - ommitted for now

  const [resetError, setResetError] = useState<string | null>(null); // For potential future use
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { register, handleSubmit, watch, formState: { errors: formErrors }, reset } = useForm<PasswordResetFormInputs>({
    mode: 'onBlur'
  });

  const newPassword = watch('newPassword', '');

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <KeyRound className="mx-auto h-12 w-auto text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Set New Password</h2>
        </div>

        {resetSuccess && (
          <div className="p-4 text-sm text-green-700 bg-green-100 rounded-md text-center">
            {resetSuccess}
          </div>
        )}
        {resetError && ( // Though not used in current placeholder success path, good to have for future
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md text-center">
            {resetError}
          </div>
        )}

        {!resetSuccess && ( // Hide form on success
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div>
              <label htmlFor="newPassword" className="sr-only">New Password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="New Password"
                autoComplete="new-password"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${formErrors.newPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
              />
              {formErrors.newPassword && <p className="mt-2 text-xs text-red-600">{formErrors.newPassword.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="sr-only">Confirm New Password</label>
              <input
                id="confirmNewPassword"
                type="password"
                placeholder="Confirm New Password"
                autoComplete="new-password"
                {...register('confirmNewPassword', {
                  required: 'Please confirm your new password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${formErrors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-4`}
              />
              {formErrors.confirmNewPassword && <p className="mt-2 text-xs text-red-600">{formErrors.confirmNewPassword.message}</p>}
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 mt-6"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {/* Show "Back to Login" link whether form is visible or success message is shown */}
        <div className="mt-6 text-center">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
