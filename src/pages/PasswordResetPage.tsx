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
    <div className="min-h-screen font-sans flex flex-col md:flex-row w-full">
      {/* Illustration Column */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 items-center justify-center p-12 border-r border-gray-200 transition-opacity duration-700 ease-in-out">
        {/* Placeholder SVG 2 - Security/Key Theme */}
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-3/4 max-w-lg h-auto transition-opacity duration-1000 ease-in-out opacity-100">  {/* Added transition & opacity */}
          <defs>
            <linearGradient id="grad2PRes" x1="0%" y1="0%" x2="100%" y2="100%"> {/* Unique ID */}
              <stop offset="0%" style={{ stopColor: 'rgb(96,165,250)', stopOpacity: 1 }} /> {/* blue-400 */}
              <stop offset="100%" style={{ stopColor: 'rgb(37,99,235)', stopOpacity: 1 }} />  {/* blue-600 */}
            </linearGradient>
          </defs>
          <path fill="url(#grad2PRes)" d="M72.4,-13.1C80.7,10.5,64.6,43.4,39.9,59.9C15.2,76.4,-18.1,76.6,-41.1,59.5C-64.1,42.4,-76.8,8.1,-69.2,-16.9C-61.6,-41.9,-33.7,-57.6,-3.3,-56.7C27.2,-55.8,54.3,-36.7,72.4,-13.1Z" transform="translate(100 100)" />
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
                className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.newPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-base`} // Ensure consistent focus
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
                className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-base`} // Ensure consistent focus
              />
              {formErrors.confirmNewPassword && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.confirmNewPassword.message}</p>} {/* Changed text-xs to text-sm */}
            </div>
            <div className="pt-4"> {/* Added pt-4 for spacing before button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-500 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95" // Added animations
              >
                {isLoading && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center"> {/* Consistent margin top relative to card's space-y */}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 text-base focus:outline-none focus:underline focus:ring-1 focus:ring-blue-500 rounded-sm"> {/* Added focus styling */}
            Back to Login
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
