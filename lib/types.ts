export type JobStatus = 
  | 'saved'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface Job {
  id: string;
  url: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  status: JobStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
}

export interface StoredResume {
  fileName: string;
  text: string;
  uploadedAt: string;
}

export interface TailoredResume {
  summary: string;
  skills: string[];
  experience: TailoredExperience[];
  education: string;
  fullText: string;
}

export interface TailoredExperience {
  title: string;
  company: string;
  duration: string;
  bullets: string[];
}
