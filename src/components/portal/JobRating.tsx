'use client';

import { useState, type FormEvent } from 'react';
import { useJobFeedback, useSubmitFeedback } from '@/hooks/useFeedback';
import { getStatusCode } from '@/lib/utils/errors';
import { formatDate } from '@/lib/utils/date';
import type { JobStatus } from '@/lib/dto';

const RATEABLE: JobStatus[] = ['completed', 'ready_for_pickup'];

function stars(count: number): string {
  return `${'★'.repeat(count)}${'☆'.repeat(5 - count)}`;
}

export function JobRating({ jobId, status }: { jobId: string; status: JobStatus }) {
  const feedback = useJobFeedback(RATEABLE.includes(status) ? jobId : '');
  const submit = useSubmitFeedback(jobId);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const missing = feedback.isError && getStatusCode(feedback.error) === 404;
  const failed = feedback.isError && !missing && !feedback.data;

  if (!RATEABLE.includes(status)) return null;

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (score < 1) {
      setError('Choose a star rating first.');
      return;
    }
    setError('');
    submit.mutate({ stars: score, comment: comment.trim() || undefined });
  };

  return (
    <div className="card stack s">
      <h2>Feedback</h2>
      {feedback.isPending ? <p className="muted">Loading feedback.</p> : null}
      {failed ? <div className="banner" role="alert">Could not load feedback.</div> : null}
      {feedback.data ? (
        <div className="stack s">
          <p><span className="b">{stars(feedback.data.stars)}</span> <span className="muted">{feedback.data.stars} out of 5</span></p>
          <p>{feedback.data.comment || 'No comment.'}</p>
          <p className="muted">Sent {formatDate(feedback.data.created_at)}</p>
          {feedback.data.reply ? (
            <div>
              <div className="faint sm">Workshop reply</div>
              <p>{feedback.data.reply}</p>
            </div>
          ) : null}
        </div>
      ) : null}
      {missing ? (
        <form className="stack s" onSubmit={save} noValidate>
          <p className="muted">How was the work on this job?</p>
          {error ? <div className="errsum" role="alert">{error}</div> : null}
          {submit.isError ? <div className="banner" role="alert">It was not saved. Try again.</div> : null}
          <div className="row" role="group" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={value <= score ? 'btn sm primary' : 'btn sm'}
                aria-pressed={score === value}
                aria-label={`${value} star${value > 1 ? 's' : ''}`}
                onClick={() => setScore(value)}
              >
                {value <= score ? '★' : '☆'}
              </button>
            ))}
          </div>
          <div className="field">
            <label htmlFor="job-rating-comment">Comment (optional)</label>
            <textarea id="job-rating-comment" className="input" value={comment} onChange={(event) => setComment(event.target.value)} />
          </div>
          <div className="row end">
            <button type="submit" className={submit.isPending ? 'btn primary nt-loading' : 'btn primary'} disabled={submit.isPending}>
              Send feedback
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
