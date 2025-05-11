
"use client";

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '@/lib/firebase/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Mail } from 'lucide-react';
import LiveScribeLogo from '@/components/icons/live-scribe-logo';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: 'Login Successful', description: "You're now logged in." });
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
      toast({ title: 'Login Successful', description: "You're now logged in with Google." });
      router.push('/');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      toast({
        title: 'Google Sign-In Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
         <div className="flex justify-center items-center mb-4">
            <LiveScribeLogo className="h-12 w-12 text-primary" />
          </div>
        <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Sign in to continue to Live Scribe</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...form.register('email')}
              className={form.formState.errors.email ? 'border-destructive' : ''}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register('password')}
              className={form.formState.errors.password ? 'border-destructive' : ''}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || isGoogleLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <LogIn className="mr-2" /> Sign In
              </>
            )}
          </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full text-lg py-6"
          onClick={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <svg role="img" viewBox="0 0 24 24" className="mr-2 h-5 w-5 fill-current"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.95-4.25 1.95-5.07 0-9.2-4.16-9.2-9.2s4.13-9.2 9.2-9.2c2.61 0 4.51.97 5.71 2.15l2.76-2.76C19.54 2.28 16.37 1 12.48 1 5.83 1 1.09 5.82 1.09 12.4s4.74 11.4 11.39 11.4c3.14 0 5.73-1.02 7.6-3.01 1.93-1.93 2.58-4.39 2.58-6.91 0-.6-.05-1.19-.15-1.72H12.48z"></path></svg>
              Sign in with Google
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
