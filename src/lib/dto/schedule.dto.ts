export interface ScheduleDay {
  date: string;
  label: string;
  capacityHours: number;
}

export interface ScheduleChip {
  id: string;
  jobNumber: string;
  hours: number;
}

export interface ScheduleCell {
  date: string;
  hours: number;
  capacityHours: number;
  label: string;
  tone: 'over' | 'busy' | 'ok' | 'free';
  jobs: ScheduleChip[];
}

export interface ScheduleTechnician {
  id: string;
  name: string;
  cells: ScheduleCell[];
}

export interface ScheduleJob {
  id: string;
  jobNumber: string;
  title: string;
}

export interface ScheduleBay {
  id: string;
  name: string;
  jobId: string | null;
  jobNumber: string | null;
  title: string | null;
  status: string | null;
}

export interface ScheduleBoard {
  days: ScheduleDay[];
  technicians: ScheduleTechnician[];
  unassigned: ScheduleJob[];
  openJobs: ScheduleJob[];
  bays: ScheduleBay[];
}

export interface ScheduleAssignment {
  jobId: string;
  technicianId: string;
  workDate: string;
  hours: number;
}
