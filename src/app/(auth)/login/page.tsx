'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthBrand } from '@/components/auth/AuthBrand';
import { useLogin, useCurrentUser } from '@/hooks/useAuth';
import { applyServerErrors } from '@/lib/utils/errors';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { homeForRole } from '@/lib/utils/permissions';

const SAMPLES = [
  { email: 'admin@neutekautocare.com', name: 'Kofi Mensah', note: 'Workshop manager', pill: 'Admin' },
  { email: 'tech@neutekautocare.com', name: 'Kwame Asante', note: 'Technician', pill: 'Technician' },
  { email: 'customer@test.com', name: 'Ama Boateng', note: 'Customer', pill: 'Customer' },
] as const;

const SAMPLE_PASSWORD = 'Admin@12345';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useCurrentUser();
  const { mutate: login, isPending } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(user ? homeForRole(user.role) : '/admin/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const messages = [
    form.formState.errors.root?.message,
    form.formState.errors.email?.message,
    form.formState.errors.password?.message,
  ].filter((message): message is string => Boolean(message));

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onError: (error) => applyServerErrors(error, form.setError, 'root'),
    });
  };

  return (
    <main className="authcard">
      <AuthBrand />
      <div className="card stack s">
        <div>
          <h1>Sign in</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Track your car, approve quotes and pay invoices, or run the workshop.
          </p>
        </div>
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
        <form
          className="stack s"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit(onSubmit)(event);
          }}
        >
          <div className="field">
            <label htmlFor="si-email">Email</label>
            <input
              id="si-email"
              className={form.formState.errors.email ? 'input err' : 'input'}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isPending}
              {...form.register('email')}
            />
            {form.formState.errors.email ? (
              <span className="hint err">{form.formState.errors.email.message}</span>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="si-pw">Password</label>
            <input
              id="si-pw"
              className={form.formState.errors.password ? 'input err' : 'input'}
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              disabled={isPending}
              {...form.register('password')}
            />
            {form.formState.errors.password ? (
              <span className="hint err">{form.formState.errors.password.message}</span>
            ) : null}
          </div>
          <div className="row sb">
            <Link href="/forgot-password" className="lnk">
              Forgot password?
            </Link>
            <button
              type="button"
              className={isPending ? 'btn primary nt-loading' : 'btn primary'}
              data-variant="primary"
              disabled={isPending}
              onClick={() => void form.handleSubmit(onSubmit)()}
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="row sb" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
          <span className="muted sm">New here?</span>
          <Link href="/register" className="lnk">
            Create an account
          </Link>
        </div>
      </div>
      <div className="card stack s">
        <h2>Try a sample account</h2>
        <p className="muted sm">These sign in to the seeded workshop accounts.</p>
        {SAMPLES.map((sample) => (
          <button
            key={sample.email}
            type="button"
            className="btn"
            style={{ justifyContent: 'space-between' }}
            disabled={isPending}
            onClick={() => login({ email: sample.email, password: SAMPLE_PASSWORD })}
          >
            <span>
              {sample.name} <span className="faint sm">{sample.note}</span>
            </span>
            <span className="pill">{sample.pill}</span>
          </button>
        ))}
      </div>
      <div className="row">
        <Link href="/home" className="lnk">
          Back to the website
        </Link>
      </div>
    </main>
  );
}
