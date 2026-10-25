'use client';

import { useEffect, useRef, useState } from 'react';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useAdminUsers, useAdminDeleteUser } from '@/hooks/useAdminUsers';
import { fullName } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import { notify } from '@/lib/notify';
import type { UserRole } from '@/lib/dto';

const ROLES: { label: string; value: UserRole | 'all' }[] = [
  { label: 'All roles', value: 'all' },
  { label: 'Customer', value: 'customer' },
  { label: 'Technician', value: 'technician' },
  { label: 'Admin', value: 'admin' },
  { label: 'Super Admin', value: 'super_admin' },
];

function roleLabel(role: UserRole) {
  return role.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function rolePill(role: UserRole) {
  if (role === 'super_admin') return 'pill bad';
  if (role === 'admin') return 'pill warn';
  if (role === 'technician') return 'pill brand';
  return 'pill';
}

function Pager({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="row">
      <button type="button" className="btn sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span className="muted sm">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default function AdminUsersPage() {
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useAdminUsers({
    search: search || undefined,
    role,
    page,
    limit: 20,
  });
  const { mutate: deleteUser, isPending: deleting } = useAdminDeleteUser();

  const users = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const failed = isError && !data;
  const pendingUser = users.find((user) => user.id === deleteId);

  useEffect(() => {
    if (!deleteId) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deleting) setDeleteId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deleteId, deleting]);

  if (isLoading && !data) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="list" />
      </>
    );
  }

  return (
    <>
      <TopProgress active={isLoading || deleting} />
      <div className="pagehead">
        <div className="ttl">
          <h1>Users</h1>
          <p className="muted">Who can sign in to the workshop. {total} total users.</p>
        </div>
        <div className="row">
          <button type="button" className="btn primary" onClick={() => notify('error', 'Invites are not available yet')}>
            Invite user
          </button>
        </div>
      </div>

      <form
        className="filters"
        style={{ marginBottom: 24 }}
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(draft.trim());
          setPage(1);
        }}
      >
        <div className="field">
          <label htmlFor="user-search">Search</label>
          <input
            id="user-search"
            className="input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search by name or email"
          />
        </div>
        <div className="field">
          <label htmlFor="user-role">Role</label>
          <select
            id="user-role"
            className="input"
            value={role ?? 'all'}
            onChange={(event) => {
              const next = event.target.value;
              setRole(next === 'all' ? undefined : (next as UserRole));
              setPage(1);
            }}
          >
            {ROLES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn">
          Search
        </button>
      </form>

      {failed ? (
        <div className="banner" role="alert">
          Failed to load users.
        </div>
      ) : users.length === 0 ? (
        <div className="card">
          <div className="empty">
            <h2>No users found</h2>
          </div>
        </div>
      ) : (
        <div className="stack">
          <div className="card flush">
            <div className="tw">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>
                      <span className="sr">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="two">
                          <b>{fullName(user.first_name, user.last_name)}</b>
                          <span>
                            {user.phone ? user.phone + ' · ' : ''}
                            Joined {formatDate(user.created_at)}
                            {' · '}
                            {user.email_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={rolePill(user.role)}>{roleLabel(user.role)}</span>
                      </td>
                      <td>
                        <span className={user.is_active ? 'pill ok' : 'pill'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="btn sm danger" onClick={() => setDeleteId(user.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pager page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {deleteId ? (
        <div
          className="scrim"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setDeleteId(null);
          }}
        >
          <div
            ref={dialogRef}
            className="dlg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-delete-title"
            tabIndex={-1}
          >
            <h2 id="user-delete-title">Delete user</h2>
            <p className="muted">
              This will permanently delete
              {pendingUser ? ' ' + fullName(pendingUser.first_name, pendingUser.last_name) : ' this user'}. This
              cannot be undone.
            </p>
            <div className="row end">
              <button type="button" className="btn" disabled={deleting} onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={deleting ? 'btn danger nt-loading' : 'btn danger'}
                data-variant="danger"
                disabled={deleting}
                onClick={() => {
                  deleteUser(deleteId, { onSuccess: () => setDeleteId(null) });
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
