'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthBrand } from '@/components/auth/AuthBrand';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { useResetPassword } from '@/hooks/useAuth';
import { applyServerErrors } from '@/lib/utils/errors';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth.schema';

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const { mutate: resetPassword, isPending } = useResetPassword();
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const password = form.watch('password');
  const messages = Object.values(form.formState.errors)
    .map((error) => (error && 'message' in error ? error.message : undefined))
    .filter((message): message is string => Boolean(message));

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;
    resetPassword(
      { token, password: data.password },
      { onError: (error) => applyServerErrors(error, form.setError, 'root') },
    );
  };

  return (
    <main className="authcard">
      <AuthBrand />
      <div className="card stack s">
        <div>
          <h1>Choose a new password</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Use at least 8 characters.
          </p>
        </div>
        {!token ? (
          <div className="banner" role="alert">
            This reset link is missing its token. Ask for a new link.
          </div>
        ) : null}
        {messages.length > 0 ? (
          <div className="errsum" role="alert">
            <b>Fix these fields</b>
            <ul>
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <form className="stack s" noValidate onSubmit={(event) => { event.preventDefault(); void form.handleSubmit(onSubmit)(event); }}>
          <div className="field">
            <label htmlFor="rs-pw">New password</label>
            <input id="rs-pw" className={form.formState.errors.password ? 'input err' : 'input'} type="password" placeholder="At least 8 characters" autoComplete="new-password" {...form.register('password')} />
            <PasswordStrength password={password} />
            {form.formState.errors.password ? <span className="hint err">{form.formState.errors.password.message}</span> : null}
          </div>
          <div className="field">
            <label htmlFor="rs-pw2">Confirm new password</label>
            <input id="rs-pw2" className={form.formState.errors.confirmPassword ? 'input err' : 'input'} type="password" placeholder="Type it again" autoComplete="new-password" {...form.register('confirmPassword')} />
            {form.formState.errors.confirmPassword ? <span className="hint err">{form.formState.errors.confirmPassword.message}</span> : null}
          </div>
          <div className="row end">
            <button type="button" className="btn" onClick={() => router.push('/login')}>
              Back to sign in
            </button>
            <button type="button" className={isPending ? 'btn primary nt-loading' : 'btn primary'} data-variant="primary" disabled={isPending || !token} onClick={() => void form.handleSubmit(onSubmit)()}>
              Save new password
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="authcard"><p className="muted">Loading the reset form.</p></main>}>
      <ResetForm />
    </Suspense>
  );
}
