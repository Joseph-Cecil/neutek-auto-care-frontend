'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthBrand } from '@/components/auth/AuthBrand';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { useRegister, useCurrentUser } from '@/hooks/useAuth';
import { applyServerErrors } from '@/lib/utils/errors';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schema';
import { homeForRole } from '@/lib/utils/permissions';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useCurrentUser();
  const { mutate: register, isPending } = useRegister();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '' },
  });
  const password = form.watch('password');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(user ? homeForRole(user.role) : '/portal/dashboard');
    }
  }, [isLoading, isAuthenticated, user, router]);

  const messages = Object.values(form.formState.errors)
    .map((error) => (error && 'message' in error ? error.message : undefined))
    .filter((message): message is string => Boolean(message));

  const onSubmit = (data: RegisterFormData) => {
    register(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      },
      { onError: (error) => applyServerErrors(error, form.setError, 'root') },
    );
  };

  return (
    <main className="authcard">
      <AuthBrand />
      <div className="card stack s">
        <div>
          <h1>Create an account</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Book faster and follow every repair in one place.
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
        <form className="stack s" noValidate onSubmit={(event) => { event.preventDefault(); void form.handleSubmit(onSubmit)(event); }}>
          <div className="grid g2" style={{ gap: 12 }}>
            <div className="field">
              <label htmlFor="rg-first">First name</label>
              <input id="rg-first" className={form.formState.errors.firstName ? 'input err' : 'input'} placeholder="Ama" {...form.register('firstName')} />
              {form.formState.errors.firstName ? <span className="hint err">{form.formState.errors.firstName.message}</span> : null}
            </div>
            <div className="field">
              <label htmlFor="rg-last">Last name</label>
              <input id="rg-last" className={form.formState.errors.lastName ? 'input err' : 'input'} placeholder="Mensah" {...form.register('lastName')} />
              {form.formState.errors.lastName ? <span className="hint err">{form.formState.errors.lastName.message}</span> : null}
            </div>
          </div>
          <div className="field">
            <label htmlFor="rg-email">Email</label>
            <input id="rg-email" className={form.formState.errors.email ? 'input err' : 'input'} type="email" placeholder="you@example.com" autoComplete="email" {...form.register('email')} />
            {form.formState.errors.email ? <span className="hint err">{form.formState.errors.email.message}</span> : null}
          </div>
          <div className="field">
            <label htmlFor="rg-phone">Phone</label>
            <input id="rg-phone" className={form.formState.errors.phone ? 'input err' : 'input'} type="tel" placeholder="024 000 0000" {...form.register('phone')} />
            {form.formState.errors.phone ? <span className="hint err">{form.formState.errors.phone.message}</span> : null}
          </div>
          <div className="field">
            <label htmlFor="rg-pw">Password</label>
            <input id="rg-pw" className={form.formState.errors.password ? 'input err' : 'input'} type="password" placeholder="At least 8 characters" autoComplete="new-password" {...form.register('password')} />
            <PasswordStrength password={password} />
            {form.formState.errors.password ? <span className="hint err">{form.formState.errors.password.message}</span> : <span className="hint">Use 8 or more characters, with a capital letter, a number, and a symbol.</span>}
          </div>
          <div className="field">
            <label htmlFor="rg-pw2">Confirm password</label>
            <input id="rg-pw2" className={form.formState.errors.confirmPassword ? 'input err' : 'input'} type="password" placeholder="Type it again" autoComplete="new-password" {...form.register('confirmPassword')} />
            {form.formState.errors.confirmPassword ? <span className="hint err">{form.formState.errors.confirmPassword.message}</span> : null}
          </div>
          <div className="row end">
            <button type="button" className="btn" onClick={() => router.push('/login')}>
              Back to sign in
            </button>
            <button type="button" className={isPending ? 'btn primary nt-loading' : 'btn primary'} data-variant="primary" disabled={isPending} onClick={() => void form.handleSubmit(onSubmit)()}>
              Create account
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
