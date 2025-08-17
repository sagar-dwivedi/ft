import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { authClient } from '~/lib/auth-client';

interface FormData {
  email: string;
  password: string;
  name?: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
}

export const Route = createFileRoute('/auth')({
  beforeLoad: async (ctx) => {
    if (ctx.context.user?.id) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
  });

  // Clear messages when switching between login/register
  useEffect(() => {
    setError(undefined);
    setSuccess(undefined);
    setValidationErrors({});
  }, [isRegister]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  const validateForm = (data: FormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!validateEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!validatePassword(data.password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (isRegister && !validateName(data.name || '')) {
      errors.name = 'Name must be at least 2 characters';
    }

    return errors;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);

    const fd = new FormData(e.currentTarget);
    const payload: FormData = {
      email: (fd.get('email') as string).trim(),
      password: fd.get('password') as string,
      name: isRegister ? (fd.get('name') as string).trim() : undefined,
    };

    // Validate form
    const errors = validateForm(payload);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    setValidationErrors({});

    try {
      const res = isRegister
        ? await authClient.signUp.email({
            email: payload.email,
            password: payload.password,
            name: payload.name!,
          })
        : await authClient.signIn.email({
            email: payload.email,
            password: payload.password,
          });

      if (res.error) {
        // Handle specific auth errors
        const errorMessage = res.error.message;
        if (errorMessage?.toLowerCase().includes('email')) {
          setValidationErrors({ email: errorMessage });
        } else if (errorMessage?.toLowerCase().includes('password')) {
          setValidationErrors({ password: errorMessage });
        } else {
          setError(errorMessage);
        }
      } else {
        if (isRegister) {
          setSuccess('Account created successfully! Redirecting...');
        } else {
          setSuccess('Welcome back! Redirecting...');
        }

        // Small delay to show success message
        setTimeout(async () => {
          await navigate({ to: '/dashboard' });
        }, 1000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegister((prev) => !prev);
    setFormData({ email: '', password: '', name: '' });
    setShowPassword(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isRegister
              ? 'Join us and take control of your finances'
              : 'Sign in to access your dashboard'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <CardContent className="space-y-4">
            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* General Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Name field for registration */}
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Ada Lovelace"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="focus-visible:ring-primary"
                  aria-invalid={!!validationErrors.name}
                  aria-describedby={
                    validationErrors.name ? 'name-error' : undefined
                  }
                />
                {validationErrors.name && (
                  <p id="name-error" className="text-destructive text-sm">
                    {validationErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="ada@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="focus-visible:ring-primary"
                autoComplete={isRegister ? 'email' : 'email'}
                aria-invalid={!!validationErrors.email}
                aria-describedby={
                  validationErrors.email ? 'email-error' : undefined
                }
              />
              {validationErrors.email && (
                <p id="email-error" className="text-destructive text-sm">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  className="focus-visible:ring-primary pr-10"
                  autoComplete={
                    isRegister ? 'new-password' : 'current-password'
                  }
                  aria-invalid={!!validationErrors.password}
                  aria-describedby={
                    validationErrors.password ? 'password-error' : undefined
                  }
                />
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p id="password-error" className="text-destructive text-sm">
                  {validationErrors.password}
                </p>
              )}
              {isRegister && !validationErrors.password && (
                <p className="text-muted-foreground text-xs">
                  Password must be at least 6 characters
                </p>
              )}
            </div>
          </CardContent>

          <CardContent className="flex flex-col space-y-4 pt-0">
            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isRegister ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : isRegister ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">
                  Or
                </span>
              </div>
            </div>

            {/* Toggle auth mode button */}
            <Button
              variant="outline"
              type="button"
              className="h-10"
              onClick={toggleAuthMode}
              disabled={loading}
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : 'Need an account? Register'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </main>
  );
}
