import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';

const loginSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean(),
});

export const Route = createFileRoute('/auth/login')({
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

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        },
        {
          onSuccess: () => {
            toast.success('Welcome back!', {
              description: 'You have been signed in successfully.',
            });
            navigate({ to: '/dashboard' });
          },
          onError: () => {
            toast.error('Sign in failed', {
              description: 'Invalid email or password. Please try again.',
            });
          },
        }
      );
    } catch {
      toast.error('Something went wrong', {
        description: 'Please try again later or contact support if the issue persists.',
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
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to home
          </Button>
        </div>

        <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter your password"
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
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage id="password-error" className="flex items-center gap-1 text-xs">
                        {form.formState.errors.password && <AlertCircle className="h-3 w-3" />}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                            className="mt-0.5"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            Remember me
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 font-medium transition-all duration-200 hover:shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <Link
                to="/auth/signup"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
              >
                Create one now
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
