'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Camera, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { useUpdateProfile, useUpdateAvatar } from '@/hooks/useUser';
import { useAuthStore } from '@/stores/auth.store';
import { fullName, getInitials } from '@/lib/utils/format';
import { toast } from 'sonner';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName:  z.string().min(1, 'Last name is required').max(100),
  phone:     z.string().min(9).max(20).optional().or(z.literal('')),
});
type ProfileFormData = z.infer<typeof profileSchema>;

export default function PortalProfilePage() {
  const user      = useAuthStore((s) => s.user);
  const avatarRef = useRef<HTMLInputElement>(null);

  const { mutate: updateProfile, isPending: saving }       = useUpdateProfile();
  const { mutate: updateAvatar,  isPending: uploadingAvatar } = useUpdateAvatar();

  const name     = fullName(user?.firstName, user?.lastName);
  const initials = getInitials(name);

  const form = useForm<ProfileFormData>({
    resolver:      zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
      phone:     '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile({
      firstName: data.firstName,
      lastName:  data.lastName,
      phone:     data.phone || undefined,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image must be less than 10MB');
      return;
    }

    updateAvatar(file);
    e.target.value = '';
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account information</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="relative">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={name}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground ring-2 ring-primary/20">
                {initials}
              </div>
            )}
            <button
              onClick={() => avatarRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-50"
              aria-label="Change avatar"
            >
              {uploadingAvatar
                ? <LoadingSpinner size="sm" />
                : <Camera className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div>
            <p className="font-semibold text-lg">{name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="mt-0.5 text-xs capitalize text-muted-foreground">{user?.role}</p>
          </div>
          <input
            ref={avatarRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" /> Personal Information
          </CardTitle>
          <CardDescription>Update your name and contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormItem>
                <FormLabel>Email address</FormLabel>
                <Input value={user?.email ?? ''} disabled className="opacity-60" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </FormItem>

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="0XX XXX XXXX" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving && <LoadingSpinner size="sm" className="mr-2" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Change password */}
      <ChangePasswordForm />

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" /> Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email verified</span>
            <span className={user?.email_verified ? 'text-green-500' : 'text-amber-500'}>
              {user?.email_verified ? 'Verified' : 'Not verified'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Account status</span>
            <span className="text-green-500">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="capitalize">{user?.role}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}