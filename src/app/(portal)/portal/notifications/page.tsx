'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications';
import { timeAgo } from '@/lib/utils/date';
import type { Notification } from '@/lib/dto';

function jobHref(note: Notification): string | null {
  const meta = note.metadata ?? note.data;
  if (!meta || typeof meta !== 'object') return null;
  const jobId = (meta as Record<string, unknown>).jobId;
  return typeof jobId === 'string' && jobId ? '/portal/jobs/' + jobId : null;
}

export default function PortalNotificationsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useNotifications({ page, limit: 20 });
  const { mutate: markRead, isPending: markingOne } = useMarkNotificationRead();
  const { mutate: markAll, isPending: markingAll } = useMarkAllNotificationsRead();

  const notifications = data?.data       ?? [];
  const totalPages    = data?.totalPages ?? 1;
  const unreadCount   = notifications.filter((note) => !note.is_read).length;

  return (
    <>
      <TopProgress active={isLoading} />
      {isLoading ? <PageSkeleton kind="list" /> : (
        <>
          <div className="pagehead">
            <div className="ttl">
              <h1>Notifications</h1>
              <p className="muted">Updates on your jobs, quotes and invoices.</p>
              {isError && !data ? (
                <p className="faint sm">Could not load notifications</p>
              ) : unreadCount > 0 ? (
                <p className="faint sm">{unreadCount} unread</p>
              ) : (
                <p className="faint sm">All caught up</p>
              )}
            </div>
            {unreadCount > 0 ? (
              <div className="row">
                <button
                  type="button"
                  className={markingAll ? 'btn nt-loading' : 'btn'}
                  disabled={markingAll}
                  onClick={() => markAll()}
                >
                  Mark all read
                </button>
              </div>
            ) : null}
          </div>
          {isError && !data ? (
            <div className="banner" role="alert">Failed to load notifications. Please refresh the page.</div>
          ) : notifications.length === 0 ? (
            <div className="card">
              <div className="empty">
                <h2>No notifications</h2>
                <p className="muted">You&apos;re all caught up. Notifications about your repairs will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="stack">
              <div className="card">
                <div className="stack">
                  {notifications.map((note) => {
                    const href = jobHref(note);
                    return (
                      <div key={note.id} className="row sb">
                        <div>
                          <div className="row">
                            {!note.is_read ? <span className="pill brand">Unread</span> : null}
                            {href ? (
                              <Link href={href} className="b" onClick={() => { if (!note.is_read) markRead(note.id); }}>
                                {note.title}
                              </Link>
                            ) : (
                              <span className="b">{note.title}</span>
                            )}
                          </div>
                          <p className="muted sm">{note.body}</p>
                          <p className="faint sm">{timeAgo(note.created_at)}</p>
                        </div>
                        {!note.is_read ? (
                          <button
                            type="button"
                            className="btn sm ghost"
                            disabled={markingOne}
                            onClick={() => markRead(note.id)}
                          >
                            Mark read
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
              {totalPages > 1 ? (
                <div className="row sb">
                  <span className="muted sm">Page {page} of {totalPages}</span>
                  <div className="row">
                    <button type="button" className="btn sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                    <button type="button" className="btn sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </>
  );
}
