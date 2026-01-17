'use client';

import { useState } from 'react';
import { Job, JobStatus } from '@/lib/types';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
  hasResume: boolean;
  resumeText: string | null;
}

const STATUS_COLORS: Record<JobStatus, string> = {
  saved: 'bg-gray-100 text-gray-800',
  applied: 'bg-blue-100 text-blue-800',
  interviewing: 'bg-yellow-100 text-yellow-800',
  offer: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-purple-100 text-purple-800',
};

const STATUS_LABELS: Record<JobStatus, string> = {
  saved: '📌 Saved',
  applied: '📤 Applied',
  interviewing: '💬 Interviewing',
  offer: '🎉 Offer',
  rejected: '❌ Rejected',
  withdrawn: '🚫 Withdrawn',
};

export default function JobCard({ job, onEdit, onDelete, onStatusChange, hasResume, resumeText }: JobCardProps) {
  const [tailoring, setTailoring] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleTailorResume = async () => {
    if (!resumeText) return;

    setTailoring(true);

    try {
      const response = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          job: {
            title: job.title,
            company: job.company,
            description: job.description,
            requirements: job.requirements,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate resume');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resume_${job.company.replace(/\s+/g, '_')}_${job.title.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to tailor resume');
    } finally {
      setTailoring(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
          {job.location && (
            <p className="text-sm text-gray-500">📍 {job.location}</p>
          )}
        </div>
        <select
          value={job.status}
          onChange={e => onStatusChange(job.id, e.target.value as JobStatus)}
          className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[job.status]} border-0 cursor-pointer`}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-gray-700 text-sm mb-3">{job.description}</p>
      )}

      {/* Requirements */}
      {job.requirements.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Requirements</p>
          <div className="flex flex-wrap gap-1">
            {job.requirements.slice(0, 5).map((req, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {req}
              </span>
            ))}
            {job.requirements.length > 5 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{job.requirements.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Salary */}
      {job.salary && (
        <p className="text-sm text-green-600 font-medium mb-3">💰 {job.salary}</p>
      )}

      {/* Notes */}
      {job.notes && (
        <div className="mb-3 p-2 bg-yellow-50 rounded text-sm text-gray-700">
          <span className="font-medium">Notes:</span> {job.notes}
        </div>
      )}

      {/* Tailor Resume Button */}
      {hasResume && (
        <button
          onClick={handleTailorResume}
          disabled={tailoring}
          className="w-full mb-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {tailoring ? '✨ Generating...' : '✨ Tailor Resume for This Job'}
        </button>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          Added {formatDate(job.createdAt)}
        </div>
        <div className="flex gap-2">
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View Posting ↗
            </a>
          )}
          <button
            onClick={() => onEdit(job)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
