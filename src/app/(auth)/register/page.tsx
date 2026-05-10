'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Zap } from 'lucide-react';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input }  from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormRootError } from '@/components/shared/ErrorAlert';
import { LoadingSpinner, PageLoader } from '@/components/shared/LoadingSpinner';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { useRegister, useCurrentUser } from '@/hooks/useAuth';
import { applyServerErrors } from '@/lib/utils/errors';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schema';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(user?.role === 'customer' ? '/portal/dashboard' : '/admin/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const form = useForm<RegisterFormData>({
    resolver:      zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '' },
  });

  const { mutate: register, isPending } = useRegister();
  const password = form.watch('password');

  if (isLoading || isAuthenticated) return <PageLoader />;

  const onSubmit = (data: RegisterFormData) => {
    register(
      { firstName: data.firstName, lastName: data.lastName, email: data.email,
        password: data.password, phone: data.phone || undefined },
      { onError: (error) => applyServerErrors(error, form.setError, 'root') },
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <Zap className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-white">Create Account</h1>
        <p className="mt-1 text-sm text-white/60">Join Neutek Auto Care today</p>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white">Get started</CardTitle>
          <CardDescription className="text-white/60">
            Create your customer account to book services and track repairs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormRootError message={form.formState.errors.root?.message} />

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">First name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Jane" autoComplete="given-name" disabled={isPending}
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Last name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Doe" autoComplete="family-name" disabled={isPending}
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Email address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="you@example.com"
                      autoComplete="email" disabled={isPending}
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:border-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">
                    Phone <span className="text-white/40">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="0XX XXX XXXX"
                      autoComplete="tel" disabled={isPending}
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:border-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password" autoComplete="new-password"
                        disabled={isPending}
                        className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-white/30 focus:border-primary" />
                      <button type="button" onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <PasswordStrength password={password} />
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} type={showConfirm ? 'text' : 'password'}
                        placeholder="Repeat your password" autoComplete="new-password"
                        disabled={isPending}
                        className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-white/30 focus:border-primary" />
                      <button type="button" onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending
                  ? <><LoadingSpinner size="sm" className="mr-2" />Creating account...</>
                  : 'Create Account'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}