'use client';

import { useState } from 'react';
import { Shield, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PageHeader }    from '@/components/admin/shared/PageHeader';
import { SearchInput }   from '@/components/admin/shared/SearchInput';
import { StatusBadge }   from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import { ErrorAlert }    from '@/components/shared/ErrorAlert';
import { Pagination }    from '@/components/shared/Pagination';
import { useAdminUsers, useAdminDeleteUser } from '@/hooks/useAdminUsers';
import { fullName } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import type { UserRole } from '@/lib/dto';

const ROLE_VARIANT: Record<UserRole, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  customer:    'muted',
  technician:  'info',
  admin:       'warning',
  super_admin: 'danger',
};

export default function AdminUsersPage() {
  const [search,   setSearch]   = useState('');
  const [role,     setRole]     = useState<UserRole | undefined>(undefined);
  const [page,     setPage]     = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useAdminUsers({
    search: search || undefined,
    role,
    page,
    limit: 20,
  });
  const { mutate: deleteUser, isPending: deleting } = useAdminDeleteUser();

  const users      = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description={total + " total users"} />

      <div className="flex flex-wrap gap-3">
        <SearchInput
          onSearch={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name or email..."
          className="max-w-sm flex-1"
        />
        <Select
          value={role ?? 'all'}
          onValueChange={(v) => {
            setRole(v === 'all' ? undefined : v as UserRole);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="technician">Technician</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <SectionLoader />
      ) : error ? (
        <ErrorAlert message="Failed to load users. Please refresh the page." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-6 w-6" />}
          title="No users found"
        />
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {fullName(user.first_name, user.last_name)}
                    </p>
                    <StatusBadge
                      label={user.role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      variant={ROLE_VARIANT[user.role]}
                    />
                    {!user.is_active && (
                      <StatusBadge label="Inactive" variant="muted" />
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{user.email}</span>
                    {user.phone && <span>{user.phone}</span>}
                    <span>Joined {formatDate(user.created_at)}</span>
                    <span className={user.email_verified ? 'text-green-500' : 'text-amber-500'}>
                      {user.email_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="ghost"
                  className="shrink-0 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(user.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete User"
        description="This will permanently delete the user account. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteUser(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        isPending={deleting}
      />
    </div>
  );
}