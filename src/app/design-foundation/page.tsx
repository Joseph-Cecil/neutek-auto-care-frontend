'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Banner } from '@/components/ui/banner';
import { NtButton } from '@/components/ui/nt-button';
import { NtEmpty } from '@/components/ui/nt-empty';
import { NtInput } from '@/components/ui/nt-input';
import { NtToaster } from '@/components/ui/nt-toaster';
import { Pill } from '@/components/ui/pill';

export default function DesignFoundationPage() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function onSave(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Enter a name.');
      return;
    }
    setError('');
    toast.success('Saved just now');
  }

  return (
    <main className="nt min-h-screen px-6 py-10">
      <NtToaster />
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
          <NtButton type="submit" variant="primary">
            Save
          </NtButton>
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
      </div>
    </main>
  );
}
