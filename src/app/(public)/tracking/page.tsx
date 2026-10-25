'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackingPage() {
  const router = useRouter();
  const [jobNumber, setJobNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const number = jobNumber.trim().toUpperCase();
    const last4 = phone.replace(/\D/g, '').slice(-4);
    if (!number) {
      setError('Enter the job number.');
      return;
    }
    if (last4.length !== 4) {
      setError('Enter the last 4 digits of the phone on the job.');
      return;
    }
    setError('');
    router.push(`/tracking/${encodeURIComponent(number)}?phone=${last4}`);
  };

  return (
    <div className="pubwrap">
      <section className="sec" style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32 }}>Track your car</h1>
        <p className="muted" style={{ margin: '8px 0 24px' }}>
          Enter the job number from your receipt, and the last 4 digits of the phone on the job.
        </p>
        <form className="card stack s" onSubmit={onSubmit}>
          {error ? <div className="errsum" role="alert"><b>{error}</b></div> : null}
          <div className="field">
            <label htmlFor="tr-q">Job number</label>
            <input id="tr-q" className={error && !jobNumber.trim() ? 'input err' : 'input'} value={jobNumber} onChange={(event) => setJobNumber(event.target.value)} placeholder="JOB-2026-088" />
          </div>
          <div className="field">
            <label htmlFor="tr-phone">Last 4 digits of the phone</label>
            <input id="tr-phone" className="input" inputMode="numeric" autoComplete="off" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="4410" />
            <span className="hint">The workshop asks for this so a job number alone is not enough.</span>
          </div>
          <div className="row end">
            <button type="submit" className="btn primary">Track</button>
          </div>
        </form>
      </section>
    </div>
  );
}
