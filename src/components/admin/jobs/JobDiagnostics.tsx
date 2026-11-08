'use client';

import { useState, type FormEvent } from 'react';
import { useCreateDiagnostic, useJobDiagnostic } from '@/hooks/useDiagnostics';
import { getStatusCode } from '@/lib/utils/errors';
import { formatDateTime } from '@/lib/utils/date';

function partLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

export function JobDiagnostics({ jobId }: { jobId: string }) {
  const report = useJobDiagnostic(jobId);
  const create = useCreateDiagnostic(jobId);
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [error, setError] = useState('');
  const missing = report.isError && getStatusCode(report.error) === 404;
  const failed = report.isError && !missing && !report.data;

  const save = (event: FormEvent) => {
    event.preventDefault();
    const text = findings.trim();
    if (!text) {
      setError('Write what you found.');
      return;
    }
    setError('');
    create.mutate({ findings: text, recommendations: recommendations.trim() || undefined });
  };

  return (
    <div className="card stack s">
      <h2>Diagnostics</h2>
      {report.isPending ? <p className="muted">Loading diagnostics.</p> : null}
      {failed ? <div className="banner" role="alert">Could not load diagnostics.</div> : null}
      {report.data ? (
        <div className="stack s">
          <div>
            <div className="faint sm">Findings</div>
            <p>{report.data.findings}</p>
          </div>
          {report.data.recommendations ? (
            <div>
              <div className="faint sm">Recommendations</div>
              <p>{report.data.recommendations}</p>
            </div>
          ) : null}
          {partLines(report.data.parts_needed).length > 0 ? (
            <div>
              <div className="faint sm">Parts</div>
              <ul>{partLines(report.data.parts_needed).map((part) => <li key={part}>{part}</li>)}</ul>
            </div>
          ) : null}
          {(report.data.photos ?? []).length > 0 ? (
            <div className="stack s">
              <div className="faint sm">Photos</div>
              {(report.data.photos ?? []).map((photo) => (
                photo.url.startsWith('http') ? (
                  <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer">
                    {photo.caption || 'Open photo'}
                  </a>
                ) : (
                  <p key={photo.id} className="muted">{photo.caption || 'Photo is stored without a public link.'}</p>
                )
              ))}
            </div>
          ) : null}
          <p className="muted">Recorded {formatDateTime(report.data.created_at)}</p>
        </div>
      ) : null}
      {missing ? (
        <form className="stack s" onSubmit={save} noValidate>
          <p className="muted">No diagnostic report for this job yet.</p>
          {error ? <div className="errsum" role="alert">{error}</div> : null}
          {create.isError ? <div className="banner" role="alert">It was not saved. Try again.</div> : null}
          <div className="field">
            <label htmlFor="diag-findings">Findings</label>
            <textarea id="diag-findings" className="input" value={findings} onChange={(event) => setFindings(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="diag-recs">Recommendations (optional)</label>
            <textarea id="diag-recs" className="input" value={recommendations} onChange={(event) => setRecommendations(event.target.value)} />
          </div>
          <div className="row end">
            <button type="submit" className={create.isPending ? 'btn primary nt-loading' : 'btn primary'} disabled={create.isPending}>
              Save diagnostic
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
