import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, Loader2, Facebook, Chrome, ArrowLeft } from 'lucide-react'; // Added ArrowLeft

// Define an interface for form inputs
interface RegistrationFormInputs {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectQuery = queryParams.get('redirect');

  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, formState: { errors: formErrors }, trigger } = useForm<RegistrationFormInputs>({
    mode: 'onBlur',
  });

  const password = watch('password', '');

  useEffect(() => {
    if (registrationSuccess) return; // Don't focus if success message is shown

    if (currentStep === 1) fullNameRef.current?.focus();
    else if (currentStep === 2) emailRef.current?.focus();
    else if (currentStep === 3) passwordRef.current?.focus();
    else if (currentStep === 4) confirmPasswordRef.current?.focus();
  }, [currentStep, registrationSuccess]);

  const handleNextStep = async (fieldToValidate: keyof RegistrationFormInputs) => {
    const isValid = await trigger(fieldToValidate);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBackStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const onSubmit: SubmitHandler<RegistrationFormInputs> = async (data) => {
    setIsLoading(true);
    setRegistrationError(null);
    // setRegistrationSuccess(null); // Not needed here as it's set on success path

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Registration data:', data);

    // Placeholder logic:
    // const success = false; // Simulate API error
    const success = true; // Simulate API success

    if (success) {
      setRegistrationSuccess('Registration successful! Redirecting to login...');
      setIsLoading(false);
      setTimeout(() => {
        navigate(redirectQuery ? `/login?redirect=${encodeURIComponent(redirectQuery)}` : '/login');
      }, 2500);
    } else {
      setRegistrationError("Registration failed. Please try again or contact support.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row w-full">
      {/* Illustration Column */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 items-center justify-center p-12 border-r border-gray-200 transition-opacity duration-700 ease-in-out">
        {/* Placeholder SVG 1 - User/Access Theme */}
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-3/4 max-w-lg h-auto transition-opacity duration-1000 ease-in-out opacity-100"> {/* Added transition & opacity */}
          <defs>
            <linearGradient id="grad1Reg" x1="0%" y1="0%" x2="100%" y2="100%"> {/* Changed ID to avoid conflict if SVGs are ever merged/global */}
              <stop offset="0%" style={{ stopColor: 'rgb(96,165,250)', stopOpacity: 1 }} /> {/* blue-400 */}
              <stop offset="100%" style={{ stopColor: 'rgb(37,99,235)', stopOpacity: 1 }} />  {/* blue-600 */}
            </linearGradient>
          </defs>
          <path fill="url(#grad1Reg)" d="M76.4,-71.3C96.4,-59.4,108.2,-36.9,110.1,-13.6C112,9.7,103.9,33.8,88.4,49.2C72.9,64.6,49.9,71.4,28.1,74.4C6.2,77.3,-14.5,76.5,-34.9,69.1C-55.3,61.7,-75.4,47.8,-85.6,29.7C-95.8,11.6,-96.1,-10.7,-87.8,-29.9C-79.5,-49.1,-62.6,-65.2,-43.7,-73.3C-24.8,-81.4,-3.9,-81.5,15.9,-79C35.7,-76.5,56.4,-83.3,76.4,-71.3Z" transform="translate(100 100)" />
          <circle cx="100" cy="90" r="30" fill="white" opacity="0.9"/>
          <path fill="white" opacity="0.9" d="M100 125 C 80 125, 70 140, 70 150 L 130 150 C 130 140, 120 125, 100 125 Z" />
        </svg>
      </div>

      {/* Form Column */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md p-10 space-y-8 bg-white rounded-xl shadow-2xl"> {/* Adjusted space-y, shadow */}
          <div className="text-center">
            <div className="mb-8">
              <UserPlus className="mx-auto h-14 w-auto text-blue-600" />
              <h2 className="mt-8 text-4xl font-extrabold text-gray-900">
                Create your Runweek Account
              </h2>
            </div>
          </div>

          {registrationSuccess && (
            <div className="p-4 text-base text-green-700 bg-green-100 rounded-md text-center">
              {registrationSuccess}
            </div>
          )}
          {registrationError && !registrationSuccess && ( // Only show API error if not success
            <div className="p-4 text-base text-red-700 bg-red-100 rounded-md text-center mb-6">
              {registrationError}
            </div>
          )}

          {!registrationSuccess && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Container to stabilize height during step transitions */}
              <div className="relative" style={{ minHeight: '125px' }}> {/* Adjusted min-height */}
                {/* Step 1: Full Name */}
                <div className={`absolute w-full transform transition-all duration-300 ease-in-out ${currentStep === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none h-0'}`}>
                  <div>
                    <label htmlFor="fullName" className="sr-only">Full Name</label>
                    <input id="fullName" type="text" placeholder="Full Name" ref={fullNameRef}
                      {...register('fullName', { required: 'Full name is required' })}
                      className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-base`} />
                  </div>
                  {formErrors.fullName && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.fullName.message}</p>}
                </div>

                {/* Step 2: Email */}
                <div className={`absolute w-full transform transition-all duration-300 ease-in-out ${currentStep === 2 ? 'opacity-100 translate-y-0' : `opacity-0 ${currentStep < 2 ? 'translate-y-5' : '-translate-y-5'} pointer-events-none h-0`}`}>
                  <div>
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input id="email" type="email" placeholder="Email address" autoComplete="email" ref={emailRef}
                      {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' } })}
                      className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-base`} />
                  </div>
                  {formErrors.email && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.email.message}</p>}
                </div>

                {/* Step 3: Password */}
                <div className={`absolute w-full transform transition-all duration-300 ease-in-out ${currentStep === 3 ? 'opacity-100 translate-y-0' : `opacity-0 ${currentStep < 3 ? 'translate-y-5' : '-translate-y-5'} pointer-events-none h-0`}`}>
                  <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input id="password" type="password" placeholder="Password" autoComplete="new-password" ref={passwordRef}
                      {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
                      className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-base`} />
                  </div>
                  {formErrors.password && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.password.message}</p>}
                  {/* TODO: Add password strength indicator component here */}
                </div>

                {/* Step 4: Confirm Password */}
                <div className={`absolute w-full transform transition-all duration-300 ease-in-out ${currentStep === 4 ? 'opacity-100 translate-y-0' : `opacity-0 ${currentStep < 4 ? 'translate-y-5' : '-translate-y-5'} pointer-events-none h-0`}`}>
                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                    <input id="confirmPassword" type="password" placeholder="Confirm Password" autoComplete="new-password" ref={confirmPasswordRef}
                      {...register('confirmPassword', { required: 'Please confirm your password', validate: value => value === password || 'Passwords do not match' })}
                      className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-base`} />
                  </div>
                  {formErrors.confirmPassword && <p className="mt-2 text-sm text-red-600 py-1">{formErrors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-6 space-y-3"> {/* Increased top padding for buttons */}
                <div className="flex items-center justify-between space-x-3">
                  {currentStep > 1 && (
                    <button type="button" onClick={handleBackStep} disabled={isLoading}
                      className="group relative w-1/3 flex justify-center items-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transform transition-opacity duration-150 ease-in-out hover:opacity-80 active:opacity-70">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </button>
                  )}
                  {currentStep < 4 && (
                    <button type="button" onClick={() => {
                        if (currentStep === 1) handleNextStep('fullName');
                        else if (currentStep === 2) handleNextStep('email');
                        else if (currentStep === 3) handleNextStep('password');
                      }}
                      disabled={isLoading}
                      className={`group relative ${currentStep === 1 ? 'w-full' : 'w-2/3'} flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-500 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95`}>
                      Next
                    </button>
                  )}
                  {currentStep === 4 && (
                    <button type="submit" disabled={isLoading}
                      className="group relative w-2/3 flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-500 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95">
                      {isLoading && <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

        {!registrationSuccess && (
          <div>
            <div className="relative my-8"> {/* Social login separator */}
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => console.log('Register with Google placeholder')} // Placeholder action
                  className="inline-flex w-full justify-center items-center rounded-md bg-white px-4 py-2.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 text-sm"
                >
                  <span className="sr-only">Sign up with Google</span>
                  <Chrome className="h-5 w-5 mr-2" aria-hidden="true" />
                  Google
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => console.log('Register with Facebook placeholder')} // Placeholder action
                className="inline-flex w-full justify-center items-center rounded-md bg-white px-4 py-2.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 text-sm transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
                className="inline-flex w-full justify-center items-center rounded-md bg-white px-4 py-2.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 text-sm transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
                >
                  <span className="sr-only">Sign up with Facebook</span>
                  <Facebook className="h-5 w-5 mr-2" aria-hidden="true" />
                  Facebook
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center"> {/* Consistent margin top relative to card's space-y */}
          <p className="text-base text-gray-600">
            Already have an account?{' '}
            <Link
              to={`/login${redirectQuery ? `?redirect=${encodeURIComponent(redirectQuery)}` : ''}`}
              className="font-semibold text-blue-600 hover:text-blue-500 focus:outline-none focus:underline focus:ring-1 focus:ring-blue-500 rounded-sm"
            >
              Log in
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
