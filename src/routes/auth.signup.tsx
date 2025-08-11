import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  UserPlus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters' })
      .max(50, { message: 'Name must be less than 50 characters' }),
    email: z.email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const Route = createFileRoute('/auth/signup')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = form.watch('password');

  useEffect(() => {
    const calculatePasswordStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/\d/.test(password)) strength += 25;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;
      return Math.min(strength, 100);
    };

    setPasswordStrength(calculatePasswordStrength(watchedPassword || ''));
  }, [watchedPassword]);

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      await authClient.signUp.email(
        {
          name: values.name,
          email: values.email,
          password: values.password,
        },
        {
          onSuccess: () => {
            toast.success('Welcome aboard!', {
              description: 'Your account has been created successfully.',
            });
            navigate({ to: '/dashboard' });
          },
          onError: (error) => {
            const errorMessage = error.error?.message || 'Something went wrong during signup.';
            toast.error('Signup failed', {
              description: errorMessage.includes('email')
                ? 'This email is already registered. Try signing in instead.'
                : 'Please check your details and try again.',
            });
          },
        }
      );
    } catch {
      toast.error('Network error', {
        description: 'Please check your connection and try again.',
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="group text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="size-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to home
          </Button>
        </div>

        <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Join us today and start your journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Full name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                              placeholder="Enter your full name"
                              disabled={isSubmitting}
                              className={cn(
                                'pl-10 h-11 transition-all duration-200',
                                'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                                form.formState.errors.name &&
                                  'border-destructive focus:border-destructive focus:ring-destructive/20'
                              )}
                              aria-describedby={
                                form.formState.errors.name ? 'name-error' : undefined
                              }
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage id="name-error" className="flex items-center gap-1 text-xs">
                          {form.formState.errors.name && <AlertCircle className="h-3 w-3" />}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Email address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                              placeholder="Enter your email"
                              type="email"
                              disabled={isSubmitting}
                              className={cn(
                                'pl-10 h-11 transition-all duration-200',
                                'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                                form.formState.errors.email &&
                                  'border-destructive focus:border-destructive focus:ring-destructive/20'
                              )}
                              aria-describedby={
                                form.formState.errors.email ? 'email-error' : undefined
                              }
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage id="email-error" className="flex items-center gap-1 text-xs">
                          {form.formState.errors.email && <AlertCircle className="h-3 w-3" />}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                          <Input
                            placeholder="Create a strong password"
                            type={showPassword ? 'text' : 'password'}
                            disabled={isSubmitting}
                            className={cn(
                              'pl-10 pr-10 h-11 transition-all duration-200',
                              'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                              form.formState.errors.password &&
                                'border-destructive focus:border-destructive focus:ring-destructive/20'
                            )}
                            aria-describedby={
                              form.formState.errors.password ? 'password-error' : undefined
                            }
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-9 w-9 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isSubmitting}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? (
                              <EyeOff className="size-4 text-muted-foreground" />
                            ) : (
                              <Eye className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>

                      {/* Password Strength Indicator */}
                      {watchedPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Password strength</span>
                            <span
                              className={cn(
                                'text-xs font-medium',
                                passwordStrength < 50 ? 'text-destructive' : 'text-green-600'
                              )}
                            >
                              {getPasswordStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <Progress value={passwordStrength} className="h-2" />
                        </div>
                      )}

                      <FormMessage id="password-error" className="flex items-center gap-1 text-xs">
                        {form.formState.errors.password && <AlertCircle className="h-3 w-3" />}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Confirm password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                          <Input
                            placeholder="Confirm your password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            disabled={isSubmitting}
                            className={cn(
                              'pl-10 pr-10 h-11 transition-all duration-200',
                              'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                              form.formState.errors.confirmPassword &&
                                'border-destructive focus:border-destructive focus:ring-destructive/20'
                            )}
                            aria-describedby={
                              form.formState.errors.confirmPassword
                                ? 'confirm-password-error'
                                : undefined
                            }
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-9 w-9 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isSubmitting}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="size-4 text-muted-foreground" />
                            ) : (
                              <Eye className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                          {/* Password Match Indicator */}
                          {field.value && form.watch('password') && (
                            <div className="absolute right-12 top-3">
                              {field.value === form.watch('password') ? (
                                <CheckCircle className="size-4 text-green-500" />
                              ) : (
                                <AlertCircle className="size-4 text-destructive" />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage
                        id="confirm-password-error"
                        className="flex items-center gap-1 text-xs"
                      >
                        {form.formState.errors.confirmPassword && (
                          <AlertCircle className="h-3 w-3" />
                        )}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 font-medium transition-all duration-200 hover:shadow-lg"
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">Already have an account? </span>
              <Link
                to="/auth/login"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
              >
                Sign in instead
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
