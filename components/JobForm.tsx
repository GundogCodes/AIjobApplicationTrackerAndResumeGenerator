'use client';

import { useState } from 'react';
import { Job, JobStatus, ExtractedJob } from '@/lib/types';
import { generateId } from '@/lib/storage';

interface JobFormProps {
  onSave: (job: Job) => void;
  editingJob?: Job | null;
  onCancel?: () => void;
}

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'saved', label: '📌 Saved' },
  { value: 'applied', label: '📤 Applied' },
  { value: 'interviewing', label: '💬 Interviewing' },
  { value: 'offer', label: '🎉 Offer' },
  { value: 'rejected', label: '❌ Rejected' },
  { value: 'withdrawn', label: '🚫 Withdrawn' },
];

export default function JobForm({ onSave, editingJob, onCancel }: JobFormProps) {
  const [url, setUrl] = useState(editingJob?.url || '');
  const [title, setTitle] = useState(editingJob?.title || '');
  const [company, setCompany] = useState(editingJob?.company || '');
  const [location, setLocation] = useState(editingJob?.location || '');
  const [description, setDescription] = useState(editingJob?.description || '');
  const [requirements, setRequirements] = useState(editingJob?.requirements.join('\n') || '');
  const [salary, setSalary] = useState(editingJob?.salary || '');
  const [status, setStatus] = useState<JobStatus>(editingJob?.status || 'saved');
  const [notes, setNotes] = useState(editingJob?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract job details');
      }

      const extracted = data as ExtractedJob;
      setTitle(extracted.title || '');
      setCompany(extracted.company || '');
      setLocation(extracted.location || '');
      setDescription(extracted.description || '');
      setRequirements(extracted.requirements?.join('\n') || '');
      setSalary(extracted.salary || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract job details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !company) {
      setError('Title and company are required');
      return;
    }

    const job: Job = {
      id: editingJob?.id || generateId(),
      url,
      title,
      company,
      location,
      description,
      requirements: requirements.split('\n').filter(r => r.trim()),
      salary: salary || undefined,
      status,
      notes,
      createdAt: editingJob?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(job);

    // Reset form if not editing
    if (!editingJob) {
      setUrl('');
      setTitle('');
      setCompany('');
      setLocation('');
      setDescription('');
      setRequirements('');
      setSalary('');
      setStatus('saved');
      setNotes('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {editingJob ? 'Edit Job' : 'Add New Job'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* URL Input with Extract Button */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Posting URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleExtract}
            disabled={loading || !url}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Extracting...' : 'Extract'}
          </button>
        </div>
      </div>

      {/* Basic Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company *
          </label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Remote, NYC, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description Summary
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Requirements */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Requirements (one per line)
        </label>
        <textarea
          value={requirements}
          onChange={e => setRequirements(e.target.value)}
          rows={4}
          placeholder="5+ years experience&#10;Python proficiency&#10;..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Salary and Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salary
          </label>
          <input
            type="text"
            value={salary}
            onChange={e => setSalary(e.target.value)}
            placeholder="$100k - $150k"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as JobStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Your thoughts, contacts, interview dates..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {editingJob ? 'Update Job' : 'Save Job'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
