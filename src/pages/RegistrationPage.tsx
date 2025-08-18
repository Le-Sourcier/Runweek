import React from "react";
import AuthLayout from "../components/layout/AuthLayout";
import { Input2 as Input } from "../components/ui/Input";
import { Button2 as Button } from "../components/ui/Button";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { UserRegistration } from "../types/user";
import { ModalSuccess } from "../components/ui/modal";

const RegisterPage: React.FC = () => {
  const { isLoading: loading, register } = useUser();

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [registeredEmail, setRegisteredEmail] = React.useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  const { checks, score } = getPasswordStrength(formData.password);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (score < 3) {
      newErrors.password = "Password is too weak";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const _formData: UserRegistration = {
      fname: formData.firstName.trim(),
      lname: formData.lastName.trim(),
      email: formData.email,
      password: formData.password,
    };

    const _ = await register(_formData);
    if (_.error) return;
    else {
      setRegisteredEmail(_formData.email);
      setShowSuccessModal(true);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start your personalized running journey today"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            error={errors.firstName}
            placeholder="John"
            autoComplete="given-name"
            disabled={loading}
          />
          <Input
            label="Last name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            error={errors.lastName}
            placeholder="Doe"
            autoComplete="family-name"
            disabled={loading}
          />
        </div>

        <Input
          label="Email"
          type="text"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          placeholder="john@example.com"
          autoComplete="email"
          disabled={loading}
        />

        <div className="space-y-3">
          <Input
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            placeholder="••••••••••••"
            isPassword
            autoComplete="new-password"
            disabled={loading}
          />

          {formData.password && (
            <div className="space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      level <= score
                        ? score <= 2
                          ? "bg-red-400"
                          : score === 3
                          ? "bg-yellow-400"
                          : "bg-green-400"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs space-y-1 bg-white/40 backdrop-blur-sm rounded-xl p-3">
                <PasswordCheck
                  check={checks.length}
                  text="At least 8 characters"
                />
                <PasswordCheck
                  check={checks.uppercase}
                  text="One uppercase letter"
                />
                <PasswordCheck
                  check={checks.lowercase}
                  text="One lowercase letter"
                />
                <PasswordCheck check={checks.number} text="One number" />
              </div>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-500 bg-transparent">or</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="social"
            type="button"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            }
          >
            Google
          </Button>
          <Button
            variant="social"
            type="button"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            }
          >
            Apple
          </Button>
        </div>

        <div className="text-center pt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-xs text-gray-500 text-center bg-white/40 backdrop-blur-sm rounded-xl p-3">
          By creating an account, you agree to RunWeek's{" "}
          <a href="#" className="text-orange-600 hover:text-orange-700">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-orange-600 hover:text-orange-700">
            Privacy Policy
          </a>
          .
        </div>
      </form>

      {!showSuccessModal && (
        <ModalSuccess
          email={registeredEmail}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </AuthLayout>
  );
};

const PasswordCheck: React.FC<{ check: boolean; text: string }> = ({
  check,
  text,
}) => (
  <div
    className={`flex items-center gap-2 ${
      check ? "text-green-600" : "text-gray-400"
    }`}
  >
    {check ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    <span>{text}</span>
  </div>
);

export default RegisterPage;
