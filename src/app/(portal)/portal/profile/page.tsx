'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useUpdateProfile, useUpdateAvatar } from '@/hooks/useUser';
import { useChangePassword } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth.store';
import { fullName, getInitials } from '@/lib/utils/format';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations/auth.schema';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName:  z.string().min(1, 'Last name is required').max(100),
  phone:     z.string().min(9).max(20).optional().or(z.literal('')),
});
type ProfileFormData = z.infer<typeof profileSchema>;

function errorMessages(errors: FieldErrors): string[] {
  return Object.values(errors).flatMap((error) => {
    if (!error || typeof error !== 'object' || !('message' in error)) return [];
    return typeof error.message === 'string' ? [error.message] : [];
  });
}

export default function PortalProfilePage() {
  const user = useAuthStore((s) => s.user);
  const avatarRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);
  const [saved, setSaved] = useState(false);

  const { mutate: updateProfile, isPending: saving } = useUpdateProfile();
  const { mutate: updateAvatar, isPending: uploadingAvatar } = useUpdateAvatar();

  const name = fullName(user?.firstName, user?.lastName);
  const initials = getInitials(name);

  const details = useForm<ProfileFormData>({
    resolver:      zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
      phone:     '',
    },
  });

  const password = useForm<ChangePasswordFormData>({
    resolver:      zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const { mutate: changePassword, isPending: changing } = useChangePassword<ChangePasswordFormData>({
    setError:  password.setError,
    onSuccess: () => password.reset(),
  });

  useEffect(() => {
    if (!user || hydrated.current) return;
    hydrated.current = true;
    details.reset({
      firstName: user.firstName ?? '',
      lastName:  user.lastName ?? '',
      phone:     '',
    });
  }, [user, details]);

  const onSubmit = (data: ProfileFormData) => {
    setSaved(false);
    updateProfile({
      firstName: data.firstName,
      lastName:  data.lastName,
      phone:     data.phone || undefined,
    }, {
      onSuccess: () => setSaved(true),
    });
  };

  const onPassword = (data: ChangePasswordFormData) => {
    changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image must be less than 10MB');
      return;
    }

    updateAvatar(file);
    event.target.value = '';
  };

  const detailErrors = errorMessages(details.formState.errors);
  const passwordErrors = errorMessages(password.formState.errors);

  return (
    <>
      <div className="pagehead">
        <div className="ttl">
          <h1>Profile</h1>
          <p className="muted">Your details and password.</p>
        </div>
      </div>
      <div className="card stack">
        {saved ? <div className="banner ok" role="status">The profile was saved.</div> : null}
        <div className="row">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              width={64}
              height={64}
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <span className="pill brand">{initials}</span>
          )}
          <div>
            <div className="b">{name}</div>
            <div className="muted sm">{user?.email}</div>
          </div>
          <button
            type="button"
            className={uploadingAvatar ? 'btn sm nt-loading' : 'btn sm'}
            disabled={uploadingAvatar}
            onClick={() => avatarRef.current?.click()}
          >
            Change photo
          </button>
          <input
            ref={avatarRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleAvatarChange}
          />
        </div>

        <form onSubmit={details.handleSubmit(onSubmit)} className="stack">
          <h2>Details</h2>
          {details.formState.isSubmitted && detailErrors.length > 0 ? (
            <div className="errsum" role="alert">
              <b>Fix these fields</b>
              <ul>{detailErrors.map((message) => <li key={message}>{message}</li>)}</ul>
            </div>
          ) : null}
          <div className="grid g2">
            <div className="field">
              <label htmlFor="profile-first">First name</label>
              <input id="profile-first" className="input" autoComplete="given-name" {...details.register('firstName')} />
              {details.formState.errors.firstName ? <span className="hint err">{details.formState.errors.firstName.message}</span> : null}
            </div>
            <div className="field">
              <label htmlFor="profile-last">Last name</label>
              <input id="profile-last" className="input" {...details.register('lastName')} />
              {details.formState.errors.lastName ? <span className="hint err">{details.formState.errors.lastName.message}</span> : null}
            </div>
            <div className="field">
              <label htmlFor="profile-email">Email</label>
              <input id="profile-email" className="input" type="email" value={user?.email ?? ''} disabled />
              <span className="hint">Email cannot be changed</span>
            </div>
            <div className="field">
              <label htmlFor="profile-phone">Phone</label>
              <input id="profile-phone" className="input" type="tel" placeholder="024 000 0000" {...details.register('phone')} />
              {details.formState.errors.phone ? <span className="hint err">{details.formState.errors.phone.message}</span> : null}
            </div>
          </div>
          <div className="row end">
            <button
              type="submit"
              className={saving ? 'btn primary nt-loading' : 'btn primary'}
              data-variant="primary"
              disabled={saving}
            >
              Save changes
            </button>
          </div>
        </form>

        <form onSubmit={password.handleSubmit(onPassword)} className="stack">
          <h2>Change password</h2>
          {password.formState.isSubmitted && passwordErrors.length > 0 ? (
            <div className="errsum" role="alert">
              <b>Fix these fields</b>
              <ul>{passwordErrors.map((message) => <li key={message}>{message}</li>)}</ul>
            </div>
          ) : null}
          <div className="grid g3">
            <div className="field">
              <label htmlFor="profile-current-password">Current password</label>
              <input id="profile-current-password" className="input" type="password" autoComplete="current-password" placeholder="Current password" {...password.register('currentPassword')} />
              {password.formState.errors.currentPassword ? <span className="hint err">{password.formState.errors.currentPassword.message}</span> : null}
            </div>
            <div className="field">
              <label htmlFor="profile-new-password">New password</label>
              <input id="profile-new-password" className="input" type="password" autoComplete="new-password" placeholder="At least 8 characters" {...password.register('newPassword')} />
              {password.formState.errors.newPassword ? <span className="hint err">{password.formState.errors.newPassword.message}</span> : (
                <span className="hint">At least 8 characters, with upper and lower case, a number, and a special character.</span>
              )}
            </div>
            <div className="field">
              <label htmlFor="profile-confirm-password">Confirm new password</label>
              <input id="profile-confirm-password" className="input" type="password" autoComplete="new-password" placeholder="Type it again" {...password.register('confirmPassword')} />
              {password.formState.errors.confirmPassword ? <span className="hint err">{password.formState.errors.confirmPassword.message}</span> : null}
            </div>
          </div>
          <div className="row end">
            <button
              type="submit"
              className={changing ? 'btn primary nt-loading' : 'btn primary'}
              data-variant="primary"
              disabled={changing}
            >
              Change password
            </button>
          </div>
        </form>

        <div className="stack s">
          <h2>Account</h2>
          <dl className="kv">
            <dt>Email verified</dt>
            <dd>{user?.email_verified ? <span className="pill ok">Verified</span> : <span className="pill warn">Not verified</span>}</dd>
            <dt>Account status</dt>
            <dd><span className="pill ok">Active</span></dd>
            <dt>Role</dt>
            <dd className="b">{user?.role ?? '—'}</dd>
          </dl>
        </div>
      </div>
    </>
  );
}
