'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useCreateReminder, useReminders, useSendDueReminders, useSendReminder, useUpdateReminderSettings } from '@/hooks/useReminders';
import { vehicleDal } from '@/lib/dal/vehicle.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { fullName } from '@/lib/utils/format';
import { format } from 'date-fns';
import type { ReminderDisplayStatus } from '@/lib/dto';

const STATUS_LABEL: Record<ReminderDisplayStatus, string> = {
  due_soon: 'Due soon',
  overdue: 'Overdue',
  upcoming: 'Upcoming',
  reminder_sent: 'Reminder sent',
  booked: 'Booked',
};

function statusPill(status: ReminderDisplayStatus): string {
  if (status === 'overdue') return 'pill bad';
  if (status === 'due_soon') return 'pill warn';
  if (status === 'reminder_sent') return 'pill brand';
  if (status === 'booked') return 'pill ok';
  return 'pill';
}

function dueLabel(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-').map((part) => Number(part));
  if (!year || !month || !day) return '—';
  return format(new Date(year, month - 1, day), 'MMM d, yyyy');
}

function canSend(status: ReminderDisplayStatus): boolean {
  return status === 'due_soon' || status === 'overdue' || status === 'upcoming';
}

export default function AdminRemindersPage() {
  const [page, setPage] = useState(1);
  const list = useReminders(page);
  const create = useCreateReminder();
  const sendOne = useSendReminder();
  const sendDue = useSendDueReminders();
  const saveRules = useUpdateReminderSettings();
  const rows = list.data?.data ?? [];
  const summary = list.data?.summary;
  const settings = list.data?.settings;
  const total = list.data?.total ?? 0;
  const totalPages = list.data?.totalPages ?? 1;
  const waiting = list.isPending && !list.data;
  const failed = list.isError && !list.data;

  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [vehicleLabel, setVehicleLabel] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [basis, setBasis] = useState('');
  const [dueOn, setDueOn] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(draft.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const vehicles = useQuery({
    queryKey: queryKeys.vehicles.list({ search, page: 1 }),
    queryFn: async () => (await vehicleDal.list({ search, limit: 8, page: 1 })).data.data,
    enabled: search.length > 0,
  });
  const matches = vehicles.data ?? [];

  const add = (event: FormEvent) => {
    event.preventDefault();
    const next: string[] = [];
    if (!vehicleId) next.push('Choose a vehicle.');
    if (!serviceName.trim()) next.push('Enter the service.');
    if (!basis.trim()) next.push('Enter how often it is due.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueOn)) next.push('Choose a due date.');
    setFormError(next[0] ?? '');
    if (next.length > 0) return;
    create.mutate(
      { vehicleId, serviceName: serviceName.trim(), basis: basis.trim(), dueOn },
      {
        onSuccess: () => {
          setVehicleId('');
          setVehicleLabel('');
          setServiceName('');
          setBasis('');
          setDueOn('');
          setDraft('');
        },
      },
    );
  };

  return (
    <>
      <TopProgress active={list.isFetching || create.isPending || sendOne.isPending || sendDue.isPending || saveRules.isPending} />
      {waiting ? <PageSkeleton kind="list" /> : (
        <div className="stack">
          <div className="pagehead">
            <div className="ttl">
              <h1>Service reminders</h1>
              <p className="muted">Bring customers back before the next service is due. Marking a reminder sent does not text or email anyone. The daily scheduler stays off.</p>
            </div>
            <button
              type="button"
              className={sendDue.isPending ? 'btn primary nt-loading' : 'btn primary'}
              disabled={sendDue.isPending || (summary?.dueOrOverdue ?? 0) === 0}
              onClick={() => sendDue.mutate()}
            >
              Send all due reminders
            </button>
          </div>
          {failed ? (
            <div className="banner" role="alert">Could not load reminders. Refresh the page to try again.</div>
          ) : (
            <>
              <div className="grid g2">
                <div className="card stack s">
                  <div className="faint sm">Due or overdue now</div>
                  <p className="b">{summary?.dueOrOverdue ?? 0}</p>
                  <p className="muted">Waiting for a reminder</p>
                </div>
                <div className="card stack s">
                  <div className="faint sm">Reminders marked sent this month</div>
                  <p className="b">{summary?.sentThisMonth ?? 0}</p>
                </div>
              </div>
              {rows.length === 0 ? (
                <div className="empty">
                  <h2>No service schedules yet</h2>
                  <p className="muted">Add a vehicle and a due date. Customers with an open booking show as booked.</p>
                </div>
              ) : (
                <div className="card flush">
                  <div className="tw">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Vehicle</th>
                          <th>Service</th>
                          <th>Due</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <div className="two">
                                <b>{fullName(row.first_name, row.last_name)}</b>
                                <span>{row.phone || '—'}</span>
                              </div>
                            </td>
                            <td>
                              <div className="two">
                                <b>{row.year} {row.make} {row.model}</b>
                                <span>{row.license_plate}</span>
                              </div>
                            </td>
                            <td>
                              <div className="two">
                                <b>{row.service_name}</b>
                                <span>{row.basis}</span>
                              </div>
                            </td>
                            <td>{dueLabel(row.due_on)}</td>
                            <td><span className={statusPill(row.display_status)}>{STATUS_LABEL[row.display_status]}</span></td>
                            <td>
                              {canSend(row.display_status) ? (
                                <button type="button" className="btn sm" onClick={() => sendOne.mutate(row.id)}>Send reminder</button>
                              ) : (
                                <span className="faint sm">{row.display_status === 'booked' ? 'Already booked' : 'Sent'}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {totalPages > 1 ? (
                <div className="row">
                  <button type="button" className="btn sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
                  <span className="muted">Page {page} of {totalPages}. {total} total.</span>
                  <button type="button" className="btn sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
                </div>
              ) : null}
              <form className="card stack s" onSubmit={add} noValidate>
                <h2>Add a schedule</h2>
                <p className="muted sm">The prototype only showed sample rows. A schedule is saved here so the board has real vehicles.</p>
                {formError ? <div className="errsum" role="alert">{formError}</div> : null}
                {create.isError ? <div className="banner" role="alert">It was not saved. Check the vehicle and the date.</div> : null}
                <div className="field">
                  <label htmlFor="rem-vehicle">Vehicle</label>
                  <input id="rem-vehicle" className="input" type="search" placeholder="Plate" value={draft} onChange={(event) => setDraft(event.target.value)} />
                  {vehicleId ? <p>Selected <span className="b">{vehicleLabel}</span></p> : null}
                  {draft.trim() ? (
                    draft.trim() !== search || vehicles.isFetching ? <p className="hint">Searching vehicles.</p>
                    : matches.length === 0 ? <p className="hint">No vehicles match</p>
                    : (
                      <div className="pick" aria-label="Matching vehicles">
                        {matches.map((vehicle) => (
                          <button
                            key={vehicle.id}
                            type="button"
                            className="btn sm"
                            aria-pressed={vehicleId === vehicle.id}
                            onClick={() => {
                              setVehicleId(vehicle.id);
                              setVehicleLabel(`${vehicle.license_plate} · ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
                              setDraft('');
                            }}
                          >
                            <span className="b">{vehicle.license_plate}</span> {vehicle.year} {vehicle.make} {vehicle.model}
                          </button>
                        ))}
                      </div>
                    )
                  ) : null}
                </div>
                <div className="grid g2">
                  <div className="field">
                    <label htmlFor="rem-service">Service</label>
                    <input id="rem-service" className="input" value={serviceName} onChange={(event) => setServiceName(event.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="rem-basis">How often</label>
                    <input id="rem-basis" className="input" placeholder="Every 10,000 km" value={basis} onChange={(event) => setBasis(event.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="rem-due">Due date</label>
                    <input id="rem-due" className="input" type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)} />
                  </div>
                </div>
                <div className="row end">
                  <button type="submit" className={create.isPending ? 'btn primary nt-loading' : 'btn primary'} disabled={create.isPending}>Save schedule</button>
                </div>
              </form>
              {settings ? (
                <div className="card stack s">
                  <h2>Reminder rules</h2>
                  <p className="muted sm">Saved for every schedule. Automatic sending stays off, so these do not send a message by themselves.</p>
                  <label className="row" style={{ gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={settings.remind_days_before}
                      onChange={(event) => saveRules.mutate({ remindDaysBefore: event.target.checked })}
                    />
                    <span>Remind 14 days before a service is due</span>
                  </label>
                  <label className="row" style={{ gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={settings.remind_again}
                      onChange={(event) => saveRules.mutate({ remindAgain: event.target.checked })}
                    />
                    <span>Remind again 3 days after if the customer has not booked</span>
                  </label>
                  <label className="row" style={{ gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={settings.whatsapp_then_sms}
                      onChange={(event) => saveRules.mutate({ whatsappThenSms: event.target.checked })}
                    />
                    <span>Send on WhatsApp first, then SMS if it fails</span>
                  </label>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </>
  );
}
