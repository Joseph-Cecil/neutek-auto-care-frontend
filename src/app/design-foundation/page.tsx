'use client';

import { useState, type FormEvent } from 'react';

import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { NtButton } from '@/components/ui/nt-button';
import { NtEmpty } from '@/components/ui/nt-empty';
import { NtInput } from '@/components/ui/nt-input';
import { NtToaster } from '@/components/ui/nt-toaster';
import { PageSkeleton, SKELETON_KINDS, type SkeletonKind } from '@/components/ui/page-skeleton';
import { Pill } from '@/components/ui/pill';
import { TopProgress } from '@/components/ui/top-progress';
import { notify } from '@/lib/notify';

export default function DesignFoundationPage() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [kind, setKind] = useState<SkeletonKind>('list');

  function onSave(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Enter a name.');
      return;
    }
    setError('');
    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      notify('success', 'Saved just now');
    }, 800);
  }

  return (
    <main className="nt min-h-screen px-6 py-10">
      <NtToaster />
      <TopProgress active={pending} />
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Foundation</h1>
          <p className="mt-2 text-sm text-[var(--color-nt-text-secondary)]">
            Prototype tokens and primitives. Existing screens still use the current theme.
          </p>
        </header>

        <section className="flex flex-wrap gap-3" aria-label="Buttons">
          <NtButton type="button">Default</NtButton>
          <NtButton type="button" variant="primary">
            Primary
          </NtButton>
          <NtButton type="button" variant="danger">
            Danger
          </NtButton>
          <NtButton type="button" variant="ghost">
            Ghost
          </NtButton>
          <NtButton type="button" size="sm" variant="primary">
            Small
          </NtButton>
          <NtButton type="button" variant="primary" loading>
            Saving
          </NtButton>
          <NtButton type="button" disabled>
            Disabled
          </NtButton>
        </section>

        <form className="flex max-w-sm flex-col gap-3" onSubmit={onSave}>
          <label className="text-[13px] font-semibold" htmlFor="foundation-name">
            Name
          </label>
          <NtInput
            id="foundation-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'foundation-name-error' : undefined}
          />
          {error ? (
            <p id="foundation-name-error" className="text-sm text-[var(--color-nt-text-danger)]">
              {error}
            </p>
          ) : null}
          <NtButton type="submit" variant="primary" loading={pending}>
            Save
          </NtButton>
          <Button type="submit" pending={pending}>
            Save
          </Button>
        </form>

        <section className="flex flex-col gap-3" aria-label="Banners">
          <Banner tone="info">Info banner</Banner>
          <Banner tone="ok">Success banner</Banner>
          <Banner tone="warn">Warning banner</Banner>
        </section>

        <section className="flex flex-wrap gap-2" aria-label="Pills">
          <Pill>Default</Pill>
          <Pill tone="ok">Ok</Pill>
          <Pill tone="warn">Watch</Pill>
          <Pill tone="bad">Fix</Pill>
          <Pill tone="brand">Brand</Pill>
        </section>

        <NtEmpty title="Nothing matches that." description="Try another search." />

        <section className="flex flex-col gap-4" aria-label="Skeletons">
          <h2 className="text-base font-semibold">Skeletons</h2>
          <div className="flex flex-wrap gap-2">
            {SKELETON_KINDS.map((item) => (
              <NtButton
                key={item}
                type="button"
                size="sm"
                variant={item === kind ? 'primary' : 'default'}
                onClick={() => setKind(item)}
                aria-pressed={item === kind}
              >
                {item}
              </NtButton>
            ))}
          </div>
          <PageSkeleton kind={kind} />
        </section>
      </div>
    </main>
  );
}
