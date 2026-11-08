'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthBrand } from '@/components/auth/AuthBrand';
import { useForgotPassword } from '@/hooks/useAuth';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth.schema';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const { mutate: forgotPassword, isPending } = useForgotPassword();
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data, {
      onSuccess: () => setSent(true),
      onError: () => setSent(true),
    });
  };

  return (
    <main className="authcard">
      <AuthBrand />
      <div className="card stack s">
        <div>
          <h1>Forgot password</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Enter your email and we will send a reset link.
          </p>
        </div>
        {sent ? (
          <>
            <div className="banner ok" role="status">
              If an account exists, we sent a link.
            </div>
            <div className="row end">
              <button type="button" className="btn" onClick={() => router.push('/login')}>
                Back to sign in
              </button>
            </div>
          </>
        ) : (
          <form className="stack s" noValidate onSubmit={(event) => { event.preventDefault(); void form.handleSubmit(onSubmit)(event); }}>
            <div className="field">
              <label htmlFor="fg-email">Email</label>
              <input
                id="fg-email"
                className={form.formState.errors.email ? 'input err' : 'input'}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...form.register('email')}
              />
              {form.formState.errors.email ? <span className="hint err">{form.formState.errors.email.message}</span> : null}
            </div>
            <div className="row end">
              <button type="button" className="btn" onClick={() => router.push('/login')}>
                Back to sign in
              </button>
              <button type="button" className={isPending ? 'btn primary nt-loading' : 'btn primary'} data-variant="primary" disabled={isPending} onClick={() => void form.handleSubmit(onSubmit)()}>
                Send reset link
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
