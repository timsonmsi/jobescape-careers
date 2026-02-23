import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function parseResume(resumeText: string) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Extract the following information from this resume and return as JSON:
{
  "name": string,
  "email": string,
  "phone": string,
  "location": string,
  "linkedin": string,
  "website": string,
  "skills": string[],
  "experience_years": number,
  "education": string,
  "workHistory": [{"company": string, "title": string, "duration": string, "description": string}]
}

Resume text:
${resumeText.substring(0, 15000)}

Return ONLY valid JSON, no other text.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    try {
      return JSON.parse(content.text);
    } catch {
      return null;
    }
  }
  return null;
}

export async function scoreCandidate(
  resumeText: string,
  jobDescription: string
) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this candidate's resume against the job description.

Return a JSON response with:
{
  "score": number (0-100),
  "summary": string (2-3 sentences),
  "strengths": string[],
  "weaknesses": string[],
  "redFlags": string[]
}

JOB DESCRIPTION:
${jobDescription.substring(0, 5000)}

RESUME:
${resumeText.substring(0, 10000)}

Return ONLY valid JSON, no other text.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    try {
      return JSON.parse(content.text);
    } catch {
      return null;
    }
  }
  return null;
}

export async function generateScreeningQuestions(jobDescription: string) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate 5 screening questions for this job posting.
Return JSON array with format:
[
  {
    "question": string,
    "type": "text" | "yes_no" | "multiple_choice",
    "options": string[] (for multiple_choice),
    "correctAnswer": string (optional, for auto-grading)
  }
]

JOB DESCRIPTION:
${jobDescription.substring(0, 5000)}

Return ONLY valid JSON, no other text.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    try {
      return JSON.parse(content.text);
    } catch {
      return null;
    }
  }
  return null;
}

export async function summarizeCandidateProfile(
  candidate: {
    name: string;
    skills: string[];
    experience?: number | null;
    education?: string | null;
    resumeText?: string | null;
  },
  jobTitle: string
) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Write a brief 2-sentence summary of this candidate for the ${jobTitle} role.

CANDIDATE:
Name: ${candidate.name}
Skills: ${candidate.skills.join(", ")}
Experience: ${candidate.experience || "N/A"} years
Education: ${candidate.education || "N/A"}

${candidate.resumeText ? `RESUME: ${candidate.resumeText.substring(0, 3000)}` : ""}

Return only the summary text.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }
  return null;
}
