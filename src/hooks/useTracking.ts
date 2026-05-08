'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { trackingDal } from '@/lib/dal/tracking.dal';
import { queryKeys }   from '@/lib/api/queryKeys';
import { APP_CONSTANTS } from '@/config/constants';
import type { TrackingUpdate } from '@/lib/dto';

export function useTrackingRest(jobNumber: string) {
  return useQuery({
    queryKey: queryKeys.tracking.byNumber(jobNumber),
    queryFn:  async () => {
      const res = await trackingDal.getByJobNumber(jobNumber);
      return res.data.data;
    },
    enabled:   !!jobNumber && jobNumber.length > 0,
    staleTime: 30 * 1000,
    retry:     false,
  });
}

export function useTrackingSocket(jobNumber: string) {
  const [data,      setData]      = useState<TrackingUpdate | null>(null);
  const [connected, setConnected] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!jobNumber) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000';
    const socket: Socket = io(wsUrl, { withCredentials: true, transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      socket.emit(APP_CONSTANTS.WS_EVENTS.JOIN_JOB, jobNumber);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on(APP_CONSTANTS.WS_EVENTS.JOB_UPDATED, (update: TrackingUpdate) => {
      setData(update);
    });

    socket.on('connect_error', () => {
      setError('Real-time connection unavailable — using polling');
      setConnected(false);
    });

    return () => {
      socket.emit(APP_CONSTANTS.WS_EVENTS.LEAVE_JOB, jobNumber);
      socket.disconnect();
    };
  }, [jobNumber]);

  return { data, connected, error };
}

export function useBlogPosts(params?: { categoryId?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ['blog', 'list', params],
    queryFn:  async () => {
      const { blogDal } = await import('@/lib/dal/blog.dal');
      const res = await blogDal.list({ ...params, status: 'published', limit: 10 });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogCategories() {
  return useQuery({
    queryKey: ['blog', 'categories'],
    queryFn:  async () => {
      const { blogDal } = await import('@/lib/dal/blog.dal');
      const res = await blogDal.listCategories();
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog', 'slug', slug],
    queryFn:  async () => {
      const { blogDal } = await import('@/lib/dal/blog.dal');
      const res = await blogDal.getBySlug(slug);
      return res.data.data;
    },
    enabled:   !!slug,
    staleTime: 5 * 60 * 1000,
    retry:     false,
  });
}