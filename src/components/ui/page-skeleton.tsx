import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

/** Prototype kinds. `dashboard` is the prototype's `dash`. */
export const SKELETON_KINDS = ['list', 'dashboard', 'detail', 'form', 'cards'] as const;

export type SkeletonKind = (typeof SKELETON_KINDS)[number];

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-4 rounded-[6px] bg-[var(--color-nt-bg-secondary)]', className)}
      aria-hidden="true"
    />
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[12px] border border-[var(--color-nt-border-default)] bg-[var(--color-nt-bg-primary)] p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

function PageHead() {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <Bone className="h-7 w-[220px]" />
        <Bone className="mt-2 h-3 w-[min(340px,70vw)]" />
      </div>
      <Bone className="h-10 w-[120px] rounded-[8px]" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Bone className="h-10 rounded-[8px]" />
          <Bone className="h-10 rounded-[8px]" />
          <Bone className="h-10 rounded-[8px]" />
          <Bone className="h-10 rounded-[8px]" />
        </div>
      </Card>
      <Card className="p-0">
        <div className="flex gap-6 bg-[var(--color-nt-bg-tertiary)] px-6 py-3">
          <Bone className="h-3 flex-1" />
          <Bone className="h-3 flex-1" />
          <Bone className="h-3 flex-1" />
          <Bone className="h-3 flex-1" />
        </div>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-6 border-b border-[var(--color-nt-border-subtle)] px-6 py-4 last:border-b-0"
          >
            <div className="flex-1">
              <Bone className="h-3 w-[70%]" />
              <Bone className="mt-2 h-2.5 w-[45%]" />
            </div>
            <Bone className="h-3 flex-1" />
            <Bone className="h-3 flex-1" />
            <Bone className="h-6 w-[84px] flex-none rounded-full" />
          </div>
        ))}
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {['w-[60%]', 'w-[50%]', 'w-[55%]', 'w-[45%]'].map((width) => (
            <div key={width}>
              <Bone className={cn('h-3', width)} />
              <Bone className="mt-2.5 h-[30px] w-[70%]" />
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {['w-[150px]', 'w-[170px]'].map((width) => (
          <Card key={width} className="p-0">
            <div className="px-6 pt-5 pb-2">
              <Bone className={cn('h-5', width)} />
            </div>
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="flex gap-6 border-b border-[var(--color-nt-border-subtle)] px-6 py-4 last:border-b-0"
              >
                <Bone className="h-3 w-[60%]" />
                <Bone className="h-3 w-[30%]" />
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Bone className="mb-5 h-5 w-[180px]" />
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="mb-3.5 flex items-center justify-between last:mb-0">
              <Bone className="h-3 w-20" />
              <Bone className="h-3 w-40" />
            </div>
          ))}
        </Card>
        <Card>
          <Bone className="mb-5 h-5 w-[200px]" />
          <Bone className="mb-3 h-3 w-full" />
          <Bone className="mb-3 h-3 w-[90%]" />
          <Bone className="h-3 w-[70%]" />
        </Card>
      </div>
      <Card className="p-0">
        <div className="px-6 pt-5 pb-2">
          <Bone className="h-5 w-40" />
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex gap-6 border-b border-[var(--color-nt-border-subtle)] px-6 py-4 last:border-b-0"
          >
            <Bone className="h-3 flex-1" />
            <Bone className="h-3 flex-1" />
            <Bone className="h-3 flex-1" />
          </div>
        ))}
      </Card>
    </div>
  );
}

function FormSkeleton() {
  return (
    <Card className="flex flex-col gap-6">
      <Bone className="h-[18px] w-[140px]" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Bone className="mb-2 h-3 w-20" />
          <Bone className="h-10 rounded-[8px]" />
        </div>
        <div>
          <Bone className="mb-2 h-3 w-[100px]" />
          <Bone className="h-10 rounded-[8px]" />
        </div>
      </div>
      <div>
        <Bone className="mb-2 h-3 w-[90px]" />
        <Bone className="h-24 rounded-[8px]" />
      </div>
      <div className="flex justify-end gap-3">
        <Bone className="h-10 w-[120px] rounded-[8px]" />
        <Bone className="h-10 w-[120px] rounded-[8px]" />
      </div>
    </Card>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index}>
          <Bone className="mb-4 h-5 w-[170px]" />
          <Bone className="mb-3 h-3 w-[80%]" />
          <Bone className="mb-4 h-3 w-[55%]" />
          <Bone className="h-8 w-[100px] rounded-[8px]" />
        </Card>
      ))}
    </div>
  );
}

const BODIES: Record<SkeletonKind, () => ReactNode> = {
  list: ListSkeleton,
  dashboard: DashboardSkeleton,
  detail: DetailSkeleton,
  form: FormSkeleton,
  cards: CardsSkeleton,
};

export function PageSkeleton({ kind, className }: { kind: SkeletonKind; className?: string }) {
  const Body = BODIES[kind];
  return (
    <div className={className} role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div aria-hidden="true">
        <PageHead />
        <Body />
      </div>
    </div>
  );
}
