'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useFeedbackList, useUpdateFeedback } from '@/hooks/useFeedback';
import { fullName } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';

function stars(count: number): string {
  return `${'★'.repeat(count)}${'☆'.repeat(Math.max(0, 5 - count))}`;
}

export default function AdminFeedbackPage() {
  const [page, setPage] = useState(1);
  const [replying, setReplying] = useState('');
  const [draft, setDraft] = useState('');
  const [replyError, setReplyError] = useState('');
  const list = useFeedbackList(page);
  const update = useUpdateFeedback();
  const rows = list.data?.data ?? [];
  const summary = list.data?.summary;
  const total = list.data?.total ?? 0;
  const totalPages = list.data?.totalPages ?? 1;
  const waiting = list.isPending && !list.data;
  const failed = list.isError && !list.data;

  const saveReply = (id: string) => {
    const text = draft.trim();
    if (!text) {
      setReplyError('Write a reply first.');
      return;
    }
    setReplyError('');
    update.mutate({ id, body: { reply: text } }, { onSuccess: () => setReplying('') });
  };

  return (
    <>
      <TopProgress active={list.isFetching || update.isPending} />
      {waiting ? <PageSkeleton kind="list" /> : (
        <div className="stack">
          <div className="pagehead">
            <div className="ttl">
              <h1>Feedback</h1>
              <p className="muted">What customers said after the work. Featuring a review does not change the website.</p>
            </div>
          </div>
          {failed ? (
            <div className="banner" role="alert">Could not load feedback. Refresh the page to try again.</div>
          ) : rows.length === 0 ? (
            <div className="empty">
              <h2>No feedback yet</h2>
              <p className="muted">Customers can rate a job once it is ready or completed.</p>
            </div>
          ) : (
            <>
              <div className="grid g2">
                <div className="card stack s">
                  <div className="faint sm">Average</div>
                  <p className="b">{summary ? summary.average.toFixed(1) : '0.0'} from {summary?.count ?? 0}</p>
                  <p className="muted">{summary?.featured ?? 0} featured</p>
                </div>
                <div className="card stack s">
                  {[5, 4, 3, 2, 1].map((score) => {
                    const count = summary?.distribution[String(score) as '1' | '2' | '3' | '4' | '5'] ?? 0;
                    const width = summary && summary.count > 0 ? Math.round((count / summary.count) * 100) : 0;
                    return (
                      <p key={score} className="sm">{score} star{score > 1 ? 's' : ''} · {count}{width > 0 ? ` · ${width}%` : ''}</p>
                    );
                  })}
                </div>
              </div>
              <div className="card flush">
                <div className="tw">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Job</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th>When</th>
                        <th>Featured</th>
                        <th>Reply</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td>{fullName(row.first_name, row.last_name)}</td>
                          <td><Link className="lnk" href={`/admin/jobs/${row.job_id}`}>{row.job_number}</Link></td>
                          <td><span aria-label={`${row.stars} out of 5`}>{stars(row.stars)}</span></td>
                          <td>{row.comment || 'No comment.'}</td>
                          <td>{formatDate(row.created_at)}</td>
                          <td>
                            <button
                              type="button"
                              className={row.featured ? 'btn sm primary' : 'btn sm'}
                              aria-pressed={row.featured}
                              onClick={() => update.mutate({ id: row.id, body: { featured: !row.featured } })}
                            >
                              {row.featured ? 'Featured' : 'Feature'}
                            </button>
                          </td>
                          <td>
                            {replying === row.id ? (
                              <div className="stack s">
                                {replyError ? <div className="errsum" role="alert">{replyError}</div> : null}
                                <label htmlFor={`reply-${row.id}`}>Reply</label>
                                <textarea id={`reply-${row.id}`} className="input" value={draft} onChange={(event) => setDraft(event.target.value)} />
                                <div className="row">
                                  <button type="button" className="btn sm primary" onClick={() => saveReply(row.id)}>Send reply</button>
                                  <button type="button" className="btn sm" onClick={() => { setReplying(''); setReplyError(''); }}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div className="stack s">
                                {row.reply ? <p>{row.reply}</p> : null}
                                <button
                                  type="button"
                                  className="btn sm"
                                  onClick={() => { setReplying(row.id); setDraft(row.reply ?? ''); setReplyError(''); }}
                                >
                                  {row.reply ? 'Edit reply' : 'Reply'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {totalPages > 1 ? (
                <div className="row">
                  <button type="button" className="btn sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
                  <span className="muted">Page {page} of {totalPages}. {total} total.</span>
                  <button type="button" className="btn sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </>
  );
}
