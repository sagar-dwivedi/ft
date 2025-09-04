import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FieldError, FieldRoot, Form, FormControl, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";

const authSearchSchema = z.object({
  mode: z.enum(['login', 'signup']).optional().catch('login'),
  next: z.string().optional(),
});

const baseSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().optional(),
});

const registerSchema = baseSchema.extend({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

export const Route = createFileRoute('/auth')({
  validateSearch: authSearchSchema,
  beforeLoad: async ({ context }) => {
    if (context.user?.id) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isRegister = search.mode === 'signup';

  const form = useForm<z.infer<typeof baseSchema>>({
    resolver: zodResolver(isRegister ? registerSchema : baseSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  useEffect(() => {
    form.reset({ email: '', password: '', name: '' });
    setError(undefined);
    setSuccess(undefined);
    setFormErrors({});
  }, [isRegister, form]);

  const onSubmit = async (values: z.infer<typeof baseSchema>) => {
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);
    setFormErrors({});

    try {
      const res = isRegister
        ? await authClient.signUp.email({
          email: values.email,
          password: values.password,
          name: values.name ?? '',
        })
        : await authClient.signIn.email({
          email: values.email,
          password: values.password,
        });

      if (res.error) {
        const message = res.error.message;
        if (message?.toLowerCase().includes('email')) {
          setFormErrors({ email: message });
        } else if (message?.toLowerCase().includes('password')) {
          setFormErrors({ password: message });
        } else {
          setError(message || 'An error occurred during authentication');
        }
      } else {
        setSuccess(
          isRegister
            ? 'Account created! Redirecting...'
            : 'Welcome back! Redirecting...'
        );
        setTimeout(() => navigate({ to: search.next || '/dashboard' }), 1000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        mode: isRegister ? 'login' : 'signup',
      }),
      replace: true,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isRegister
              ? 'Join us and take control of your finances'
              : 'Sign in to access your dashboard'}
          </CardDescription>
        </CardHeader>

        <Form
          form={form}
          className="space-y-4"
          errors={formErrors}
          onClearErrors={() => setFormErrors({})}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <CardContent className="space-y-4">
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="danger">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isRegister && (
              <FieldRoot name="name" className="flex flex-col items-start gap-2">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ada Lovelace"
                    disabled={loading}
                    {...form.register('name')}
                  />
                </FormControl>
                <FieldError className="text-sm text-red-600" />
              </FieldRoot>
            )}

            <FieldRoot name="email" className="flex flex-col items-start gap-2">
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="ada@example.com"
                  disabled={loading}
                  {...form.register('email')}
                />
              </FormControl>
              <FieldError className="text-sm text-red-600" />
            </FieldRoot>

            <FieldRoot name="password" className="flex flex-col items-start gap-2">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={loading}
                  trailingIcon={
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 text-muted-foreground hover:text-foreground disabled:opacity-50"
                      onClick={() => setShowPassword((p) => !p)}
                      disabled={loading}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  }
                  {...form.register('password')}
                />
              </FormControl>
              <FieldError className="text-sm text-red-600" />
            </FieldRoot>
          </CardContent>

          <CardContent className="flex flex-col space-y-4 pt-0">
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  {isRegister ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : isRegister ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="h-10"
              onClick={toggleMode}
              disabled={loading}
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : 'Need an account? Register'}
            </Button>
          </CardContent>
        </Form>
      </Card>
    </main>
  );
}