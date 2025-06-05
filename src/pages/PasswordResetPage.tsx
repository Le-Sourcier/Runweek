import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom'; // Removed useParams for this mockup
import { KeyRound, Loader2 } from 'lucide-react'; // Optional icon, Added Loader2

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
    <div className="flex items-center justify-center min-h-screen font-sans bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8"> {/* Added font-sans, gradient background */}
      <div className="w-full max-w-md p-10 space-y-10 bg-white rounded-xl shadow-lg"> {/* Consistent card padding and spacing */}
        <div className="text-center">
          <div className="mb-8"> {/* Added margin-bottom for separation */}
            <KeyRound className="mx-auto h-14 w-auto text-blue-600" /> {/* Changed indigo to blue */}
            <h2 className="mt-8 text-4xl font-extrabold text-gray-900">Set New Password</h2> {/* Consistent title styling */}
          </div>
        </div>

        {resetSuccess && (
          <div className="p-4 text-base text-green-700 bg-green-100 rounded-md text-center"> {/* Increased text size */}
            {resetSuccess}
          </div>
        )}
        {resetError && (
          <div className="p-4 text-base text-red-700 bg-red-100 rounded-md text-center"> {/* Increased text size */}
            {resetError}
          </div>
        )}

        {!resetSuccess && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Consistent form spacing */}
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
                className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.newPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-base`} // Changed indigo to blue
              />
              {formErrors.newPassword && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.newPassword.message}</p>} {/* Changed text-xs to text-sm */}
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
                className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-base`} // Changed indigo to blue
              />
              {formErrors.confirmNewPassword && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.confirmNewPassword.message}</p>} {/* Changed text-xs to text-sm */}
            </div>
            <div className="pt-4"> {/* Added pt-4 for spacing before button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-500" // Added items-center
              >
                {isLoading && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center"> {/* Consistent margin top */}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 text-base"> {/* Changed indigo to blue */}
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
