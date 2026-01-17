'use client';

import { useState } from 'react';
import { Job, JobStatus } from '@/lib/types';
import JobCard from './JobCard';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  hasResume: boolean;
  resumeText: string | null;
}

const ALL_STATUSES: JobStatus[] = ['saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'];

export default function JobList({ jobs, onEdit, onDelete, onStatusChange, hasResume, resumeText }: JobListProps) {
  const [filter, setFilter] = useState<JobStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch = search === '' || 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = ALL_STATUSES.reduce((acc, status) => {
    acc[status] = jobs.filter(j => j.status === status).length;
    return acc;
  }, {} as Record<JobStatus, number>);

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No jobs tracked yet</p>
        <p className="text-sm">Paste a job posting URL above to get started</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({jobs.length})
          </button>
          {ALL_STATUSES.map(status => (
            statusCounts[status] > 0 && (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm capitalize ${
                  filter === status
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status} ({statusCounts[status]})
              </button>
            )
          ))}
        </div>
      </div>

      {/* Job Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No jobs match your filters
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              hasResume={hasResume}
              resumeText={resumeText}
            />
          ))}
        </div>
      )}
    </div>
  );
}
