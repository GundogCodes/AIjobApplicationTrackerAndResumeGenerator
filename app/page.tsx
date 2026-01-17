'use client';

import { useState, useEffect } from 'react';
import { Job, JobStatus, StoredResume } from '@/lib/types';
import { getJobs, addJob, updateJob, deleteJob, getStoredResume } from '@/lib/storage';
import JobForm from '@/components/JobForm';
import JobList from '@/components/JobList';
import ResumeUpload from '@/components/ResumeUpload';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [storedResume, setStoredResume] = useState<StoredResume | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load jobs and resume from localStorage on mount
  useEffect(() => {
    setJobs(getJobs());
    setStoredResume(getStoredResume());
    setIsLoaded(true);
  }, []);

  const handleSave = (job: Job) => {
    if (editingJob) {
      setJobs(updateJob(job));
      setEditingJob(null);
    } else {
      setJobs(addJob(job));
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this job?')) {
      setJobs(deleteJob(id));
    }
  };

  const handleStatusChange = (id: string, status: JobStatus) => {
    const job = jobs.find(j => j.id === id);
    if (job) {
      setJobs(updateJob({ ...job, status }));
    }
  };

  const handleCancel = () => {
    setEditingJob(null);
  };

  // Prevent hydration mismatch
  if (!isLoaded) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Tracker</h1>
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Tracker</h1>
      <p className="text-gray-600 mb-8">
        Paste a job posting URL, extract details with AI, and track your applications.
      </p>

      <ResumeUpload
        storedResume={storedResume}
        onResumeChange={setStoredResume}
      />

      <JobForm
        onSave={handleSave}
        editingJob={editingJob}
        onCancel={editingJob ? handleCancel : undefined}
      />

      <JobList
        jobs={jobs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        hasResume={!!storedResume}
        resumeText={storedResume?.text || null}
      />
    </main>
  );
}
