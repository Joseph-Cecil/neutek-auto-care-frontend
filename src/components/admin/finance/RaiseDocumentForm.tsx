'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { TopProgress } from '@/components/ui/top-progress';
import { useAdminJob, useAdminJobs } from '@/hooks/useAdminJobs';
import { ghsAmount, ghsToPesewas } from '@/lib/utils/format';
import type { CreateInvoiceRequest, CreateQuoteRequest } from '@/lib/dto';

type Kind = 'quote' | 'invoice';

interface Line {
  key: string;
  description: string;
  quantity: string;
  price: string;
}

function blankLine(key: string): Line {
  return { key, description: '', quantity: '1', price: '' };
}

function jobHeadline(job: { job_number: string; title?: string | null; customer_concern?: string | null }) {
  const concern = job.title || job.customer_concern;
  return concern ? `${job.job_number} · ${concern}` : job.job_number;
}

export function RaiseDocumentForm({
  kind,
  presetJobId,
  pending,
  failed,
  onSubmit,
}: {
  kind: Kind;
  presetJobId?: string;
  pending: boolean;
  failed: boolean;
  onSubmit: (body: CreateQuoteRequest | CreateInvoiceRequest) => void;
}) {
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [jobId, setJobId] = useState(presetJobId ?? '');
  const [jobLabel, setJobLabel] = useState('');
  const [seq, setSeq] = useState(1);
  const [lines, setLines] = useState<Line[]>([blankLine('line-1')]);
  const [tax, setTax] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [days, setDays] = useState('7');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(draft.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const jobs = useAdminJobs({ search: search || undefined, limit: 8 });
  const preset = useAdminJob(presetJobId ?? '');
  const matches = jobs.data?.data ?? [];
  const shownJob = jobLabel
    || (preset.data && jobId === preset.data.id ? jobHeadline(preset.data) : '');

  const updateLine = (key: string, patch: Partial<Line>) => {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: string[] = [];
    if (!jobId) nextErrors.push('Choose a job.');
    const parsedLines = lines.map((line) => {
      const quantity = Number.parseInt(line.quantity, 10);
      const price = Number.parseFloat(line.price);
      return { line, quantity, price };
    });
    if (parsedLines.every((item) => !item.line.description.trim())) {
      nextErrors.push('Add at least one line.');
    }
    for (const item of parsedLines) {
      if (!item.line.description.trim()) continue;
      if (!Number.isInteger(item.quantity) || item.quantity < 1) nextErrors.push('Quantity must be at least 1.');
      if (!Number.isFinite(item.price) || item.price < 0) nextErrors.push('Price must be 0 or more.');
    }
    const taxPercent = Number.parseFloat(tax);
    const discountPercent = Number.parseFloat(discount);
    const dayCount = Number.parseInt(days, 10);
    if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) nextErrors.push('Tax must be between 0 and 100.');
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) nextErrors.push('Discount must be between 0 and 100.');
    if (!Number.isInteger(dayCount) || dayCount < (kind === 'quote' ? 1 : 0)) {
      nextErrors.push(kind === 'quote' ? 'Valid days must be at least 1.' : 'Due days must be 0 or more.');
    }
    setErrors([...new Set(nextErrors)]);
    if (nextErrors.length > 0) return;
    const lineItems = parsedLines
      .filter((item) => item.line.description.trim())
      .map((item) => ({
        description: item.line.description.trim(),
        quantity: item.quantity,
        unitPricePesewas: ghsToPesewas(item.price),
      }));
    const shared = {
      jobId,
      lineItems,
      taxPercent,
      discountPercent,
      notes: notes.trim() || undefined,
    };
    if (kind === 'quote') onSubmit({ ...shared, validDays: dayCount });
    else onSubmit({ ...shared, dueDays: dayCount });
  };

  const preview = lines.reduce((sum, line) => {
    const quantity = Number.parseInt(line.quantity, 10);
    const price = Number.parseFloat(line.price);
    if (!Number.isFinite(quantity) || !Number.isFinite(price)) return sum;
    return sum + ghsToPesewas(price) * quantity;
  }, 0);

  return (
    <div className="stack">
      <TopProgress active={pending || jobs.isFetching} />
      <div className="pagehead">
        <div className="ttl">
          <div className="row">
            <Link href={kind === 'quote' ? '/admin/quotes' : '/admin/invoices'} className="btn sm">
              {kind === 'quote' ? 'Back to quotes' : 'Back to invoices'}
            </Link>
          </div>
          <h1>{kind === 'quote' ? 'New quote' : 'New invoice'}</h1>
          <p className="muted">Raise it against a job. The customer sees it after you send it.</p>
        </div>
      </div>
      <form className="card stack" onSubmit={submit} noValidate>
        {errors.length > 0 ? (
          <div className="errsum" role="alert">
            <b>Fix these fields</b>
            <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
          </div>
        ) : null}
        {failed ? <div className="banner" role="alert">It was not saved. Check the job and the lines, then try again.</div> : null}
        <section className="stack s">
          <h2>Job</h2>
          {jobId ? <p>Selected <span className="b">{shownJob || 'This job'}</span></p> : null}
          {preset.isError && presetJobId ? <div className="banner" role="alert">Could not load the job from this page.</div> : null}
          <div className="field">
            <label htmlFor="raise-job">Search jobs</label>
            <input
              id="raise-job"
              className="input"
              type="search"
              placeholder="Job number or concern"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>
          {jobs.isError && !jobs.data ? <div className="banner" role="alert">Could not load jobs.</div> : null}
          {draft.trim() ? (
            draft.trim() !== search || jobs.isFetching ? (
              <p className="hint">Searching jobs.</p>
            ) : matches.length === 0 ? (
              jobs.isError ? null : <p className="hint">No jobs match</p>
            ) : (
              <div className="pick" aria-label="Matching jobs">
                {matches.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    className="btn sm"
                    aria-pressed={jobId === job.id}
                    onClick={() => {
                      setJobId(job.id);
                      setJobLabel(jobHeadline(job));
                      setDraft('');
                    }}
                  >
                    <span className="b">{job.job_number}</span> {job.title}
                  </button>
                ))}
              </div>
            )
          ) : null}
        </section>
        <section className="stack s">
          <h2>Lines</h2>
          {lines.map((line, index) => (
            <div key={line.key} className="grid g2">
              <div className="field">
                <label htmlFor={`line-desc-${line.key}`}>Description</label>
                <input
                  id={`line-desc-${line.key}`}
                  className="input"
                  value={line.description}
                  onChange={(event) => updateLine(line.key, { description: event.target.value })}
                />
              </div>
              <div className="grid g2">
                <div className="field">
                  <label htmlFor={`line-qty-${line.key}`}>Qty</label>
                  <input
                    id={`line-qty-${line.key}`}
                    className="input"
                    inputMode="numeric"
                    value={line.quantity}
                    onChange={(event) => updateLine(line.key, { quantity: event.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`line-price-${line.key}`}>Price (GHS)</label>
                  <input
                    id={`line-price-${line.key}`}
                    className="input"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={line.price}
                    onChange={(event) => updateLine(line.key, { price: event.target.value })}
                  />
                </div>
              </div>
              {lines.length > 1 ? (
                <button type="button" className="btn sm" onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}>
                  Remove line {index + 1}
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="btn sm"
            onClick={() => {
              const next = seq + 1;
              setSeq(next);
              setLines((current) => [...current, blankLine(`line-${next}`)]);
            }}
          >
            Add line
          </button>
          <p className="muted">Subtotal GHS {ghsAmount(preview)}. Tax and discount are applied when it is saved.</p>
        </section>
        <div className="grid g2">
          <div className="field">
            <label htmlFor="raise-tax">Tax %</label>
            <input id="raise-tax" className="input" inputMode="decimal" value={tax} onChange={(event) => setTax(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="raise-discount">Discount %</label>
            <input id="raise-discount" className="input" inputMode="decimal" value={discount} onChange={(event) => setDiscount(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="raise-days">{kind === 'quote' ? 'Valid for (days)' : 'Due in (days)'}</label>
            <input id="raise-days" className="input" inputMode="numeric" value={days} onChange={(event) => setDays(event.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="raise-notes">Notes (optional)</label>
          <textarea id="raise-notes" className="input" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>
        <div className="row end">
          <button type="submit" className={pending ? 'btn primary nt-loading' : 'btn primary'} disabled={pending}>
            {kind === 'quote' ? 'Save quote' : 'Save invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
