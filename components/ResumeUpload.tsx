'use client';

import { useState, useRef } from 'react';
import { StoredResume } from '@/lib/types';
import { saveResume, deleteResume } from '@/lib/storage';

interface ResumeUploadProps {
  storedResume: StoredResume | null;
  onResumeChange: (resume: StoredResume | null) => void;
}

export default function ResumeUpload({ storedResume, onResumeChange }: ResumeUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      const resume: StoredResume = {
        fileName: data.fileName,
        text: data.text,
        uploadedAt: new Date().toISOString(),
      };

      saveResume(resume);
      onResumeChange(resume);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = () => {
    if (confirm('Remove your stored resume?')) {
      deleteResume();
      onResumeChange(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Your Resume</h3>
          {storedResume ? (
            <p className="text-sm text-gray-600">
              📄 {storedResume.fileName}
              <span className="text-gray-400 ml-2">
                (uploaded {new Date(storedResume.uploadedAt).toLocaleDateString()})
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-500">Upload your base resume to enable tailoring</p>
          )}
        </div>

        <div className="flex gap-2">
          {storedResume && (
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          )}
          <label className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 cursor-pointer">
            {loading ? 'Uploading...' : storedResume ? 'Replace' : 'Upload PDF'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}
