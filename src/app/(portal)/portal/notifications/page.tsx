'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SectionLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications';
import { timeAgo } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';

export default function PortalNotificationsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotifications({ page, limit: 20 });
  const { mutate: markRead, isPending: markingOne } = useMarkNotificationRead();
  const { mutate: markAll,  isPending: markingAll }  = useMarkAllNotificationsRead();

  const notifications = data?.data       ?? [];
  const totalPages    = data?.totalPages ?? 1;
  const unreadCount   = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            {unreadCount > 0 ? unreadCount + " unread" : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll()}
            disabled={markingAll}
            className="gap-1.5"
          >
            {markingAll
              ? <LoadingSpinner size="sm" className="mr-1" />
              : <CheckCheck className="h-4 w-4" />}
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <SectionLoader />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title="No notifications"
          description="You&apos;re all caught up! Notifications about your repairs will appear here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={cn(
                'transition-all',
                !n.is_read && 'border-primary/30 bg-primary/5',
              )}
            >
              <CardContent className="flex items-start gap-3 p-4">
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0">
                  {!n.is_read ? (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-transparent" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm', !n.is_read ? 'font-semibold' : 'font-medium')}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    {timeAgo(n.created_at)}
                  </p>
                </div>

                {!n.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markRead(n.id)}
                    disabled={markingOne}
                    className="shrink-0 text-xs"
                  >
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}