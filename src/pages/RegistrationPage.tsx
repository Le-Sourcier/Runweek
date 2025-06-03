import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Activity } from 'lucide-react'; // Added Activity for consistency if preferred

// Define an interface for form inputs
interface RegistrationFormInputs {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
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
      navigate('/login');
    }, 2500); // 2.5 second delay before redirect
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-auto text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your Runweek Account
          </h2>
        </div>

        {registrationSuccess && (
          <div className="p-4 text-sm text-green-700 bg-green-100 rounded-md text-center">
            {registrationSuccess}
          </div>
        )}
        {registrationError && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md text-center">
            {registrationError}
          </div>
        )}

        {!registrationSuccess && ( // Hide form on successful registration
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Full Name"
                {...register('fullName', { required: 'Full name is required' })}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
              />
              {formErrors.fullName && <p className="mt-2 text-xs text-red-600">{formErrors.fullName.message}</p>}
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
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-4`}
              />
              {formErrors.email && <p className="mt-2 text-xs text-red-600">{formErrors.email.message}</p>}
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
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-4`}
              />
              {formErrors.password && <p className="mt-2 text-xs text-red-600">{formErrors.password.message}</p>}
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
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-4`}
              />
              {formErrors.confirmPassword && <p className="mt-2 text-xs text-red-600">{formErrors.confirmPassword.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 mt-6"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
