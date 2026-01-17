# Job Tracker

A simple job application tracker that extracts job posting details using AI.

## Features

- Paste a job URL → AI extracts title, company, description, requirements, salary
- Edit extracted fields
- Track application status (Saved, Applied, Interviewing, Offer, Rejected, Withdrawn)
- Add notes
- Filter and search jobs
- Data persists in localStorage

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Groq API key (free):**
   ```bash
   cp .env.local.example .env.local
   ```
   Get a free API key from https://console.groq.com/keys, then edit `.env.local`:
   ```
   GROQ_API_KEY=gsk_your-api-key-here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## Usage

1. Paste a job posting URL in the input field
2. Click "Extract" to fetch and parse the job details
3. Review and edit the extracted information
4. Set the status and add any notes
5. Click "Save Job" to add it to your tracker

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Groq API (Llama 3.3 70B - free tier)
- Cheerio (HTML parsing)
- localStorage (persistence)

## Notes

- Some job sites may block scraping (LinkedIn, etc.). The tool works best with direct company career pages.
- Uses Groq's free tier with Llama 3.3 70B for extraction.
# AIjobApplicationTrackerAndResumeGenerator
