'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail, Zap } from 'lucide-react';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input }  from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useForgotPassword } from '@/hooks/useAuth';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth.schema';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver:      zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data, {
      onSuccess: () => setSubmitted(true),
      onError:   () => setSubmitted(true),
    });
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-2 mx-auto max-w-xs text-sm text-white/60">
            If an account exists for{' '}
            <strong className="text-white">{form.getValues('email')}</strong>,
            you&apos;ll receive a reset link shortly.
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
          </Button>
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
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="mt-1 text-sm text-white/60">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white">Forgot your password?</CardTitle>
          <CardDescription className="text-white/60">No worries — enter your email below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending
                  ? <><LoadingSpinner size="sm" className="mr-2" />Sending link...</>
                  : 'Send Reset Link'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Link href="/login">
        <Button variant="ghost" className="w-full text-white/60 hover:bg-white/10 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
        </Button>
      </Link>
    </div>
  );
}