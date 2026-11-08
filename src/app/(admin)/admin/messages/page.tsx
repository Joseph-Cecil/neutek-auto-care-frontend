'use client';

import { useState, type FormEvent } from 'react';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useMessageLog, useMessageTemplates, useRecordMessageTest, useUpdateMessageTemplate } from '@/hooks/useMessages';
import { formatDateTime } from '@/lib/utils/date';
import type { MessageTemplate } from '@/lib/dto';

const SAMPLE: Record<string, string> = {
  name: 'the customer',
  car: 'the vehicle',
  job: 'the job',
  link: 'the tracking link',
  service: 'the service',
};

function preview(body: string): string {
  return body.replace(/\{(\w+)\}/g, (token, key: string) => SAMPLE[key] ?? token);
}

export default function AdminMessagesPage() {
  const [tab, setTab] = useState<'templates' | 'log'>('templates');
  const [templatePage, setTemplatePage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [formError, setFormError] = useState('');

  const templates = useMessageTemplates(templatePage);
  const log = useMessageLog(logPage);
  const update = useUpdateMessageTemplate();
  const record = useRecordMessageTest();

  const rows = templates.data?.data ?? [];
  const summary = templates.data?.summary;
  const logRows = log.data?.data ?? [];
  const logSummary = log.data?.summary;
  const waiting = (templates.isPending && !templates.data) || (log.isPending && !log.data);
  const failed = (templates.isError && !templates.data) || (log.isError && !log.data);

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (!draft.trim()) {
      setFormError('Write the message.');
      return;
    }
    setFormError('');
    update.mutate(
      { id: editing, body: { body: draft.trim() } },
      { onSuccess: () => setEditing(null) },
    );
  };

  const toggle = (row: MessageTemplate, key: 'automatic' | 'sms' | 'whatsapp', checked: boolean) => {
    update.mutate({ id: row.id, body: { [key]: checked } });
  };

  return (
    <>
      <TopProgress active={templates.isFetching || log.isFetching || update.isPending || record.isPending} />
      {waiting ? <PageSkeleton kind="list" /> : (
        <div className="stack">
          <div className="pagehead">
            <div className="ttl">
              <h1>Messages</h1>
              <p className="muted">What customers would hear from the workshop. A test is stored on the log. It is not sent by SMS, WhatsApp, or email.</p>
            </div>
            <div className="row" role="group" aria-label="View">
              <button type="button" className={tab === 'templates' ? 'btn primary' : 'btn'} aria-pressed={tab === 'templates'} onClick={() => setTab('templates')}>Templates</button>
              <button type="button" className={tab === 'log' ? 'btn primary' : 'btn'} aria-pressed={tab === 'log'} onClick={() => setTab('log')}>Sent log</button>
            </div>
          </div>
          {failed ? (
            <div className="banner" role="alert">Could not load messages. Refresh the page to try again.</div>
          ) : (
            <>
              <div className="grid g2">
                <div className="card stack s">
                  <div className="faint sm">Automatic messages on</div>
                  <p className="b">{summary?.automatic ?? 0}</p>
                  <p className="muted">of {summary?.total ?? 0} templates</p>
                </div>
                <div className="card stack s">
                  <div className="faint sm">Recorded this week</div>
                  <p className="b">{logSummary?.recordedThisWeek ?? 0}</p>
                  <p className="muted">None left the workshop. Delivered stays {logSummary?.delivered ?? 0}.</p>
                </div>
              </div>
              {tab === 'templates' ? (
                rows.length === 0 ? (
                  <div className="empty">
                    <h2>No templates yet</h2>
                    <p className="muted">The workshop messages will show here.</p>
                  </div>
                ) : (
                  <div className="stack">
                    {rows.map((row) => {
                      const open = editing === row.id;
                      return (
                        <div className="card stack s" key={row.id}>
                          <div className="row sb">
                            <div className="row" style={{ gap: 12 }}>
                              <h2>{row.name}</h2>
                              <span className="pill">{row.stage}</span>
                              <span className={row.automatic ? 'pill ok' : 'pill'}>{row.automatic ? 'Automatic' : 'Off'}</span>
                            </div>
                            <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
                              <label className="row sm" style={{ gap: 6 }}>
                                <input type="checkbox" checked={row.automatic} onChange={(event) => toggle(row, 'automatic', event.target.checked)} />
                                Send automatically
                              </label>
                              <label className="row sm" style={{ gap: 6 }}>
                                <input type="checkbox" checked={row.whatsapp_enabled} onChange={(event) => toggle(row, 'whatsapp', event.target.checked)} />
                                WhatsApp
                              </label>
                              <label className="row sm" style={{ gap: 6 }}>
                                <input type="checkbox" checked={row.sms_enabled} onChange={(event) => toggle(row, 'sms', event.target.checked)} />
                                SMS
                              </label>
                            </div>
                          </div>
                          {open ? (
                            <form onSubmit={save} noValidate>
                              <div className="field">
                                <label htmlFor={`tpl-body-${row.id}`}>Message</label>
                                <textarea id={`tpl-body-${row.id}`} className="input" value={draft} onChange={(event) => setDraft(event.target.value)} />
                                <span className="hint">Use {'{name}'}, {'{car}'}, {'{job}'}, {'{link}'} and {'{service}'}. They stay as written until a later sender fills them in.</span>
                                {formError ? <span className="hint err">{formError}</span> : null}
                              </div>
                              <div className="row end">
                                <button type="button" className="btn" onClick={() => { setEditing(null); setFormError(''); }}>Cancel</button>
                                <button type="submit" className={update.isPending ? 'btn primary nt-loading' : 'btn primary'} disabled={update.isPending}>Save message</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div>
                                <div className="faint sm" style={{ marginBottom: 6 }}>Sample preview. Nothing is sent.</div>
                                <div className="banner info">{preview(row.body)}</div>
                              </div>
                              <div className="row">
                                <button type="button" className="btn sm" onClick={() => { setEditing(row.id); setDraft(row.body); setFormError(''); }}>Edit message</button>
                                <button type="button" className="btn sm" disabled={record.isPending} onClick={() => record.mutate(row.id)}>Record a test</button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                    {(templates.data?.totalPages ?? 1) > 1 ? (
                      <div className="row">
                        <button type="button" className="btn sm" disabled={templatePage <= 1} onClick={() => setTemplatePage((current) => current - 1)}>Previous</button>
                        <span className="muted">Page {templatePage} of {templates.data?.totalPages}</span>
                        <button type="button" className="btn sm" disabled={templatePage >= (templates.data?.totalPages ?? 1)} onClick={() => setTemplatePage((current) => current + 1)}>Next</button>
                      </div>
                    ) : null}
                  </div>
                )
              ) : logRows.length === 0 ? (
                <div className="empty">
                  <h2>No tests recorded yet</h2>
                  <p className="muted">Recording a test stores a row here. It does not text or email anyone.</p>
                </div>
              ) : (
                <div className="stack">
                  <div className="card flush">
                    <div className="tw">
                      <table className="tbl">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Message</th>
                            <th>Channel</th>
                            <th>Status</th>
                            <th>When</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logRows.map((row) => (
                            <tr key={row.id}>
                              <td>
                                <div className="two">
                                  <b>{row.recipient_name}</b>
                                  <span>{row.recipient_phone || '—'}</span>
                                </div>
                              </td>
                              <td>{row.template_name}</td>
                              <td>Not sent</td>
                              <td><span className="pill">Recorded</span></td>
                              <td>{formatDateTime(row.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {(log.data?.totalPages ?? 1) > 1 ? (
                    <div className="row">
                      <button type="button" className="btn sm" disabled={logPage <= 1} onClick={() => setLogPage((current) => current - 1)}>Previous</button>
                      <span className="muted">Page {logPage} of {log.data?.totalPages}</span>
                      <button type="button" className="btn sm" disabled={logPage >= (log.data?.totalPages ?? 1)} onClick={() => setLogPage((current) => current + 1)}>Next</button>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
