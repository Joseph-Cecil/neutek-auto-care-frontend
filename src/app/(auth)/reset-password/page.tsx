'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertTriangle, Zap } from 'lucide-react';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input }  from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormRootError } from '@/components/shared/ErrorAlert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { useResetPassword } from '@/hooks/useAuth';
import { applyServerErrors } from '@/lib/utils/errors';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth.schema';

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const searchParams = useSearchParams();
  const token        = searchParams.get('token');

  const form = useForm<ResetPasswordFormData>({
    resolver:      zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const { mutate: resetPassword, isPending } = useResetPassword();
  const password = form.watch('password');

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;
    resetPassword(
      { token, password: data.password },
      { onError: (error) => applyServerErrors(error, form.setError, 'root') },
    );
  };

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive">
          <AlertTriangle className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Invalid link</h1>
          <p className="mt-2 text-sm text-white/60">This reset link is missing or invalid.</p>
        </div>
        <Link href="/forgot-password">
          <Button className="w-full">Request a new link</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <Zap className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-white">Set new password</h1>
        <p className="mt-1 text-sm text-white/60">Choose a strong password for your account</p>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white">New password</CardTitle>
          <CardDescription className="text-white/60">
            Must be at least 8 characters with uppercase, lowercase, number, and special character.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormRootError message={form.formState.errors.root?.message} />

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">New password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password" autoComplete="new-password"
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
                        placeholder="Repeat new password" autoComplete="new-password"
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
                  ? <><LoadingSpinner size="sm" className="mr-2" />Resetting...</>
                  : 'Reset Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Link href="/login">
        <Button variant="ghost" className="w-full text-white/60 hover:bg-white/10 hover:text-white">
          Back to sign in
        </Button>
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}