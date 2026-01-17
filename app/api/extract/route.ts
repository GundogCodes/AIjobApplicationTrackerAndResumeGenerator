import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import * as cheerio from 'cheerio';
import { ExtractedJob } from '@/lib/types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function scrapeUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove scripts, styles, and other non-content elements
  $('script, style, nav, footer, header, aside, iframe, noscript').remove();

  // Get text content, preserving some structure
  const text = $('body').text()
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 15000); // Limit to avoid token limits

  return text;
}

async function extractJobDetails(text: string, url: string): Promise<ExtractedJob> {
  const prompt = `Extract job posting details from the following text. Return a JSON object with these fields:
- title: job title
- company: company name
- location: job location (remote, city, etc.)
- description: a 2-3 sentence summary of the role
- requirements: array of key requirements/qualifications (max 8 items)
- salary: salary range if mentioned, otherwise null

Text from ${url}:
${text}

Respond with only valid JSON, no markdown formatting.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that extracts structured job posting information. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content || '{}';
  
  // Clean up potential markdown code blocks
  const cleanedContent = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  try {
    return JSON.parse(cleanedContent);
  } catch {
    throw new Error('Failed to parse LLM response as JSON');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured. Add GROQ_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const text = await scrapeUrl(url);
    const extracted = await extractJobDetails(text, url);

    return NextResponse.json(extracted);
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract job details' },
      { status: 500 }
    );
  }
}
