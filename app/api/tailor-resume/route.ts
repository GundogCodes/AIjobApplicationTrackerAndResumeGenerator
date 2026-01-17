import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface TailoredContent {
  summary: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    bullets: string[];
  }[];
  education: string;
}

async function tailorResume(resumeText: string, job: {
  title: string;
  company: string;
  description: string;
  requirements: string[];
}): Promise<TailoredContent> {
  const prompt = `You are a professional resume writer. Tailor this resume for the job posting below.

ORIGINAL RESUME:
${resumeText}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Requirements: ${job.requirements.join(', ')}

Return a JSON object with:
- summary: A 2-3 sentence professional summary tailored to this role (highlight relevant experience)
- skills: Array of 8-12 relevant skills (prioritize skills mentioned in requirements)
- experience: Array of work experiences, each with:
  - title: job title
  - company: company name
  - duration: time period
  - bullets: Array of 3-4 achievement bullets, reworded to emphasize relevance to the target role
- education: Education section as a single string

Keep all factual information accurate - only reword and emphasize, don't fabricate.
Respond with only valid JSON, no markdown.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert resume writer. Output only valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content || '{}';
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  return JSON.parse(cleaned);
}

function createDocx(content: TailoredContent, jobTitle: string, company: string): Document {
  const children: Paragraph[] = [];

  // Header placeholder
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '[YOUR NAME]', bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: '[Email] | [Phone] | [LinkedIn] | [Location]', size: 20 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' })
  );

  // Summary
  children.push(
    new Paragraph({
      text: 'PROFESSIONAL SUMMARY',
      heading: HeadingLevel.HEADING_2,
      thematicBreak: true,
    }),
    new Paragraph({ text: content.summary }),
    new Paragraph({ text: '' })
  );

  // Skills
  children.push(
    new Paragraph({
      text: 'SKILLS',
      heading: HeadingLevel.HEADING_2,
      thematicBreak: true,
    }),
    new Paragraph({ text: content.skills.join(' • ') }),
    new Paragraph({ text: '' })
  );

  // Experience
  children.push(
    new Paragraph({
      text: 'EXPERIENCE',
      heading: HeadingLevel.HEADING_2,
      thematicBreak: true,
    })
  );

  for (const exp of content.experience) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: exp.title, bold: true }),
          new TextRun({ text: ` | ${exp.company}` }),
        ],
      }),
      new Paragraph({
        children: [new TextRun({ text: exp.duration, italics: true })],
      })
    );

    for (const bullet of exp.bullets) {
      children.push(
        new Paragraph({
          text: `• ${bullet}`,
          indent: { left: 360 },
        })
      );
    }

    children.push(new Paragraph({ text: '' }));
  }

  // Education
  children.push(
    new Paragraph({
      text: 'EDUCATION',
      heading: HeadingLevel.HEADING_2,
      thematicBreak: true,
    }),
    new Paragraph({ text: content.education })
  );

  return new Document({
    sections: [{ children }],
  });
}

export async function POST(request: NextRequest) {
  try {
    const { resumeText, job } = await request.json();

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    if (!job || !job.title) {
      return NextResponse.json({ error: 'Job details are required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const tailored = await tailorResume(resumeText, job);
    const doc = createDocx(tailored, job.title, job.company);
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Resume_${job.company.replace(/\s+/g, '_')}_${job.title.replace(/\s+/g, '_')}.docx"`,
      },
    });
  } catch (error) {
    console.error('Tailor resume error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to tailor resume' },
      { status: 500 }
    );
  }
}
