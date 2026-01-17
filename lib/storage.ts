import { Job, StoredResume } from './types';

const STORAGE_KEY = 'job-tracker-jobs';
const RESUME_KEY = 'job-tracker-resume';

export function getJobs(): Job[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveJobs(jobs: Job[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function addJob(job: Job): Job[] {
  const jobs = getJobs();
  jobs.unshift(job);
  saveJobs(jobs);
  return jobs;
}

export function updateJob(updatedJob: Job): Job[] {
  const jobs = getJobs();
  const index = jobs.findIndex(j => j.id === updatedJob.id);
  if (index !== -1) {
    jobs[index] = { ...updatedJob, updatedAt: new Date().toISOString() };
    saveJobs(jobs);
  }
  return jobs;
}

export function deleteJob(id: string): Job[] {
  const jobs = getJobs().filter(j => j.id !== id);
  saveJobs(jobs);
  return jobs;
}

export function generateId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Resume storage
export function getStoredResume(): StoredResume | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(RESUME_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveResume(resume: StoredResume): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RESUME_KEY, JSON.stringify(resume));
}

export function deleteResume(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RESUME_KEY);
}
