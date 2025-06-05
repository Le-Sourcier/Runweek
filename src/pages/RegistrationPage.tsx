import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, Loader2, Facebook, Chrome, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react'; // Added new icons

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFullNameValidated, setIsFullNameValidated] = useState(false);
  const [isEmailValidatedReg, setIsEmailValidatedReg] = useState(false); // Renamed for clarity

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, formState: { errors: formErrors }, trigger } = useForm<RegistrationFormInputs>({
    mode: 'onBlur',
  });

  const password = watch('password', '');
  const fullNameValue = watch('fullName');
  const emailValueReg = watch('email'); // Unique name for registration page email watch

  useEffect(() => {
    if (registrationSuccess) return;

    if (currentStep === 1 && fullNameRef.current) fullNameRef.current.focus();
    else if (currentStep === 2 && emailRef.current) emailRef.current.focus();
    else if (currentStep === 3 && passwordRef.current) passwordRef.current.focus();
    else if (currentStep === 4 && confirmPasswordRef.current) confirmPasswordRef.current.focus();
  }, [currentStep, registrationSuccess]);

  // Effects to reset validation status if corresponding field value changes
  useEffect(() => { if (isFullNameValidated) setIsFullNameValidated(false); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullNameValue]);
  useEffect(() => { if (isEmailValidatedReg) setIsEmailValidatedReg(false); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailValueReg]);

  const handleNextStep = async (fieldToValidate: keyof RegistrationFormInputs, setValidatedStatus?: (isValid: boolean) => void) => {
    const isValid = await trigger(fieldToValidate);
    if (isValid) {
      if (setValidatedStatus) setValidatedStatus(true);
      setCurrentStep(prev => prev + 1);
    } else {
      if (setValidatedStatus) setValidatedStatus(false);
    }
  };

  const handleBackStep = () => {
    // Validation status will be reset by useEffects if user types in previous fields.
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
      {/* Visual Side */}
      <div className="w-full md:w-1/2 h-80 md:min-h-screen flex flex-col items-center justify-center p-8 order-1 md:order-1 bg-blue-50 dark:bg-blue-900/20 transition-opacity duration-700 ease-in-out">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-2/3 max-w-xs h-auto mx-auto text-blue-600 dark:text-blue-400 transition-opacity duration-1000 ease-in-out opacity-100">
          <defs>
            {/* Using a unique ID for gradient per page to avoid potential conflicts if SVGs are ever in a global scope like sprites */}
            <linearGradient id="svg1RegGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="currentColor" className="text-blue-500 dark:text-blue-300" />
              <stop offset="100%" stop-color="currentColor" className="text-blue-700 dark:text-blue-500" />
            </linearGradient>
          </defs>
          <path fill="url(#svg1RegGradient)" d="M20,70 Q50,20 80,60 T90,30 L90,80 L10,80 Z" />
          <circle cx="30" cy="30" r="10" fill="currentColor" className="text-blue-400 dark:text-blue-200"/>
        </svg>
        <p className="font-display text-xl md:text-2xl font-semibold text-center text-slate-700 dark:text-slate-300 mt-6">
          Start Your Journey.
        </p>
      </div>

      {/* Functional Side (Form Panel) */}
      <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 order-2 md:order-2">
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-lg shadow-xl w-full max-w-md space-y-6">
          {/* App Logo Placeholder */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl font-bold font-display text-blue-600 dark:text-blue-400">
              Runweek
            </h1>
          </div>

          {/* Page Title/Context */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-50">
              Create your account
            </h2>
          </div>

          {/* Social Login Options */}
          {!registrationSuccess && ( // Hide social logins on success
            <div className="my-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400">Or sign up with</span>
                </div>
              </div>
              <button type="button" onClick={() => console.log('Register with Google placeholder')}
                className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95">
                <Chrome className="h-5 w-5 mr-2" />
                Sign up with Google
              </button>
              <button type="button" onClick={() => console.log('Register with Apple placeholder')}
                className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mr-2"> {/* Placeholder Apple Icon */}
                   <path d="M12.016 6.496c-.13.004-.303.004-.515.004-.213 0-.385 0-.516-.004C8.24 6.48 6.496 8.24 6.496 10.98c0 2.772 2.184 4.464 4.464 4.464.213 0 .385 0 .516.004.13-.004.303-.004.515-.004 2.74 0 4.484-2.184 4.484-4.92 0-2.752-2.184-4.484-4.944-4.484zm0-2.496c2.088 0 3.72.464 4.92 1.368.06.048.144.144.144.24 0 .12-.072.204-.168.264-1.032.648-1.728 1.704-1.728 2.988 0 1.2.528 2.016 1.368 2.712.108.084.168.18.168.312 0 .144-.084.264-.204.336-1.056.66-2.424 1.056-3.912 1.056s-2.856-.396-3.912-1.056c-.12-.072-.204-.192-.204-.336s.06-.228.168-.312c.84-.696 1.368-1.512 1.368-2.712 0-1.284-.696-2.34-1.728-2.988-.096-.06-.168-.144-.168-.264.012-.096.084-.192.144-.24C8.296 4.464 9.928 4 12.016 4z"/>
                </svg>
                Sign up with Apple
              </button>
            </div>
          )}

          {registrationSuccess && (
            <div className="p-4 text-base text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-md text-center">
              {registrationSuccess}
            </div>
          )}
          {registrationError && !registrationSuccess && (
            <div className="p-4 text-base text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-md text-center"> {/* No mb-6 needed if form has space-y */}
              {registrationError}
            </div>
          )}

          {!registrationSuccess && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative" style={{ minHeight: '150px' }}> {/* Adjusted min-height for Step X/Y text and error messages */}
                {/* Step 1: Full Name */}
                <div className={`absolute w-full transform transition-all duration-300 ease-in-out ${currentStep === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none h-0'}`}>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Step 1/4</p>
                  <div className="relative">
                    <label htmlFor="fullName" className="sr-only">Full Name</label>
                    <input id="fullName" type="text" placeholder="Full Name" ref={fullNameRef}
                      {...register('fullName', { required: 'Full name is required' })}
                      className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.fullName ? 'border-red-500' : (isFullNameValidated ? 'border-green-500 dark:border-green-400' : 'border-gray-300 dark:border-slate-700')} placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-50 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 sm:text-base`} />
                    {isFullNameValidated && !formErrors.fullName && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                      </div>
                    )}
                  </div>
                  {formErrors.fullName && <p className="mt-2 text-sm text-red-600 dark:text-red-400 py-1">{formErrors.fullName.message}</p>}
                </div>

                {/* Step 2: Email */}
                <div className={`absolute w-full transform transition-all duration-300 ease-in-out ${currentStep === 2 ? 'opacity-100 translate-y-0' : `opacity-0 ${currentStep < 2 ? 'translate-y-5' : '-translate-y-5'} pointer-events-none h-0`}`}>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Step 2/4</p>
                  <div className="relative">
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input id="email" type="email" placeholder="Email address" autoComplete="email" ref={emailRef}
                      {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' } })}
                      className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : (isEmailValidatedReg ? 'border-green-500 dark:border-green-400' : 'border-gray-300 dark:border-slate-700')} placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-50 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 sm:text-base`} />
                    {isEmailValidatedReg && !formErrors.email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                      </div>
                    )}
                  </div>
                  {formErrors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400 py-1">{formErrors.email.message}</p>}
                </div>

                {/* Step 3: Password */}
                <div className={`absolute w-full transform transition-all duration-300 ease-in-out ${currentStep === 3 ? 'opacity-100 translate-y-0' : `opacity-0 ${currentStep < 3 ? 'translate-y-5' : '-translate-y-5'} pointer-events-none h-0`}`}>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Step 3/4</p>
                  <div className="relative">
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input id="password" type={showPassword ? "text" : "password"} placeholder="Password" autoComplete="new-password" ref={passwordRef}
                      {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
                      className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-50 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 sm:text-base pr-10`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 rounded-md"
                      aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formErrors.password && <p className="mt-2 text-sm text-red-600 dark:text-red-400 py-1">{formErrors.password.message}</p>}
                  {/* TODO: Add password strength indicator component here */}
                </div>

                {/* Step 4: Confirm Password */}
                <div className={`absolute w-full transform transition-all duration-300 ease-in-out ${currentStep === 4 ? 'opacity-100 translate-y-0' : `opacity-0 ${currentStep < 4 ? 'translate-y-5' : '-translate-y-5'} pointer-events-none h-0`}`}>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Step 4/4</p>
                  <div className="relative">
                    <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                    <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" autoComplete="new-password" ref={confirmPasswordRef}
                      {...register('confirmPassword', { required: 'Please confirm your password', validate: value => value === password || 'Passwords do not match' })}
                      className={`appearance-none rounded-md relative block w-full px-4 py-3 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-slate-700'} placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-50 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 sm:text-base pr-10`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 rounded-md"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && <p className="mt-2 text-sm text-red-600 dark:text-red-400 py-1">{formErrors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between space-x-3">
                  {currentStep > 1 && (
                    <button type="button" onClick={handleBackStep} disabled={isLoading}
                      className="group relative w-1/3 flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:opacity-50 transform transition-opacity duration-150 ease-in-out hover:opacity-80 active:opacity-70">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </button>
                  )}
                  {currentStep < 4 && (
                    <button type="button" onClick={() => {
                        if (currentStep === 1) handleNextStep('fullName', setIsFullNameValidated);
                        else if (currentStep === 2) handleNextStep('email', setIsEmailValidatedReg);
                        else if (currentStep === 3) handleNextStep('password'); // No specific validation status for password field itself before confirm
                      }}
                      disabled={isLoading}
                      className={`group relative ${currentStep === 1 ? 'w-full' : 'w-2/3'} flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:bg-blue-500 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95`}>
                      Next
                    </button>
                  )}
                  {currentStep === 4 && (
                    <button type="submit" disabled={isLoading}
                      className="group relative w-2/3 flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 disabled:bg-blue-500 transform transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95">
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
