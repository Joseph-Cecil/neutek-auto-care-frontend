'use client';

import Link from 'next/link';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useAssignSchedule, useSchedule, useSetBay } from '@/hooks/useSchedule';
import type { ScheduleBay, ScheduleCell, ScheduleJob } from '@/lib/dto';

function toneClass(tone: ScheduleCell['tone']): string {
  if (tone === 'over') return 'pill bad';
  if (tone === 'busy') return 'pill warn';
  if (tone === 'ok') return 'pill ok';
  return 'pill';
}

function statusLabel(status: string | null): string {
  if (!status) return 'Free';
  return status.replace(/_/g, ' ');
}

function bayOptions(bay: ScheduleBay, jobs: ScheduleJob[]): ScheduleJob[] {
  if (!bay.jobId || jobs.some((job) => job.id === bay.jobId)) return jobs;
  return [{ id: bay.jobId, jobNumber: bay.jobNumber || 'Job', title: bay.title || 'Job' }, ...jobs];
}

export default function AdminSchedulePage() {
  const board = useSchedule();
  const assign = useAssignSchedule();
  const setBay = useSetBay();
  const data = board.data;
  const waiting = board.isPending && !data;
  const failed = board.isError && !data;

  return (
    <>
      <TopProgress active={board.isFetching || assign.isPending || setBay.isPending} />
      {waiting ? <PageSkeleton kind="list" /> : (
        <div className="stack">
          <div className="pagehead">
            <div className="ttl">
              <h1>Schedule</h1>
              <p className="muted">Who is working on what over the next workshop days. A full day is 8 hours, Saturday is 5. Sunday is closed. Technicians cannot assign from here.</p>
            </div>
          </div>
          {failed || !data ? (
            <div className="banner" role="alert">Could not load the schedule. Refresh the page to try again.</div>
          ) : (
            <>
              {data.unassigned.length > 0 ? (
                <div className="card stack s">
                  <h2>Waiting for a technician</h2>
                  {data.technicians.length === 0 ? <p className="muted">Add a technician before these jobs can be assigned.</p> : null}
                  {data.unassigned.map((job) => (
                    <div className="row sb" key={job.id}>
                      <div>
                        <div className="b">{job.jobNumber}</div>
                        <div className="faint sm">{job.title}</div>
                      </div>
                      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                        {data.technicians.map((tech) => (
                          <button
                            key={tech.id}
                            type="button"
                            className="btn sm"
                            disabled={assign.isPending}
                            onClick={() => assign.mutate({ jobId: job.id, technicianId: tech.id })}
                          >
                            Assign to {tech.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {data.technicians.length === 0 ? (
                <div className="empty">
                  <h2>No technicians yet</h2>
                  <p className="muted">An active technician shows on this week.</p>
                </div>
              ) : (
                <div className="card flush">
                  <div className="tw">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>Technician</th>
                          {data.days.map((day) => <th key={day.date}>{day.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {data.technicians.map((tech) => (
                          <tr key={tech.id}>
                            <td className="b">{tech.name}</td>
                            {tech.cells.map((cell) => (
                              <td key={cell.date} style={{ verticalAlign: 'top' }}>
                                <div className="stack s">
                                  <span className={toneClass(cell.tone)}>{cell.label}</span>
                                  {cell.jobs.map((job) => (
                                    <Link key={`${cell.date}-${job.id}`} className="lnk sm" href={`/admin/jobs/${job.id}`}>
                                      {job.jobNumber} · {job.hours} h
                                    </Link>
                                  ))}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="card stack s">
                <h2>Bays right now</h2>
                <p className="muted sm">The prototype only displayed bays. Place a job here, or clear the bay.</p>
                <div className="grid g2">
                  {data.bays.map((bay) => (
                    <div className="card stack s" key={bay.id}>
                      <div className="row sb">
                        <div>
                          <div className="b">{bay.name}</div>
                          <div className="faint sm">{bay.jobId ? `${bay.jobNumber} · ${bay.title}` : 'Empty'}</div>
                        </div>
                        <span className={bay.jobId ? 'pill' : 'pill ok'}>{statusLabel(bay.status)}</span>
                      </div>
                      <div className="field">
                        <label htmlFor={`bay-${bay.id}`}>Job in this bay</label>
                        <select
                          id={`bay-${bay.id}`}
                          className="input"
                          value={bay.jobId ?? ''}
                          disabled={setBay.isPending}
                          onChange={(event) => setBay.mutate({ id: bay.id, jobId: event.target.value || null })}
                        >
                          <option value="">Clear</option>
                          {bayOptions(bay, data.openJobs).map((job) => (
                            <option key={job.id} value={job.id}>{job.jobNumber} · {job.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
