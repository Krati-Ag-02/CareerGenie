import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { callAI, extractJSON } from "../config/gemini.js";
import { getDb } from "../config/firebase.js";

const router = express.Router();

// ─── ROLES LIST ──────────────────────────────────────────────────────────────
const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer', 'Cloud Architect',
  'Product Manager', 'UX Designer', 'UI Designer', 'Data Analyst',
  'Cybersecurity Analyst', 'Mobile Developer (iOS)', 'Mobile Developer (Android)',
  'QA Engineer', 'Site Reliability Engineer', 'Database Administrator',
  'Business Analyst', 'Scrum Master', 'Technical Writer', 'AI/ML Researcher',
  'Blockchain Developer', 'Embedded Systems Engineer', 'Systems Architect',
  'Sales Engineer', 'Marketing Analyst', 'HR Manager', 'Financial Analyst',
  'Operations Manager', 'Content Strategist', 'SEO Specialist', 'Growth Hacker',
  'Network Engineer', 'IT Support Specialist',
];

// ─── GET ROLES ────────────────────────────────────────────────────────────────
router.get('/interview/roles', requireAuth, (req, res) => {
  res.json({ roles: ROLES });
});

// ─── GENERATE QUESTIONS ───────────────────────────────────────────────────────
router.post('/interview/questions', requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required.' });

    const prompt = `You are a senior technical interviewer at a top tech company.

Generate EXACTLY 30 interview questions for the role: "${role}".

Rules:
- Mix of conceptual, coding, and behavioral
- Increasing difficulty (easy → hard)
- Be role-specific

STRICT FORMAT:
Return ONLY a valid JSON array of EXACTLY 30 strings.

Example:
["Q1","Q2","Q3",...,"Q30"]

IMPORTANT:
- No markdown
- No explanation
- No extra text
- Output MUST be valid JSON array only`;

    const raw = await callAI(prompt);
    const questions = extractJSON(raw);

    if (!Array.isArray(questions) || questions.length < 0) {
      throw new Error('AI returned invalid questions format.');
    }

    res.json({ questions });
  } catch (err) {
    console.error('[AI] Questions error:', err.message);
    res.status(500).json({ error: 'Failed to generate questions: ' + err.message });
  }
});

// ─── EVALUATE ANSWER ──────────────────────────────────────────────────────────
router.post('/interview/evaluate', requireAuth, async (req, res) => {
  try {
    const { role, question, answer } = req.body;

    if (!role || !question || !answer) {
      return res.status(400).json({ error: 'Role, question, and answer are required.' });
    }
    if (answer.trim().length < 15) {
      return res.status(400).json({ error: 'Please provide a more detailed answer.' });
    }

    const prompt = `You are a strict but fair senior technical interviewer at a top-tier company evaluating a candidate for the role of "${role}".

Interview Question: "${question}"

Candidate's Answer: "${answer}"

Evaluate thoroughly and return ONLY a raw JSON object (no markdown, no extra text):
{
  "score": <integer 0-100>,
  "grade": "<one of: A+, A, B+, B, C+, C, D, F>",
  "summary": "<2-3 sentences overall assessment of the answer>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "missingKeywords": ["<important technical term or concept missing>", "<another missing keyword>", "<third missing term>"],
  "improvements": ["<specific actionable improvement 1>", "<specific actionable improvement 2>", "<specific actionable improvement 3>"],
  "idealAnswerHints": "<2-3 sentences describing what an ideal answer would include>"
}

Scoring guide: 90-100 = excellent, 75-89 = good, 60-74 = average, 40-59 = below average, 0-39 = poor.
- Return ONLY valid JSON
- Do NOT include explanation or text outside JSON
- Response must start with { and end with }
- Ensure JSON is parseable using JSON.parse()`;

    const raw = await callAI(prompt);
    const evaluation = extractJSON(raw);

    // Validate structure
    const required = ['score', 'grade', 'summary', 'strengths', 'missingKeywords', 'improvements', 'idealAnswerHints'];
    for (const field of required) {
      if (evaluation[field] === undefined) throw new Error(`Missing field: ${field}`);
    }

    // Persist to Firestore
    const db = getDb();
    await db.collection('interview_sessions').add({
      userId: req.session.userId,
      role, question, answer, evaluation,
      timestamp: new Date().toISOString(),
    });

    res.json({ evaluation });
  } catch (err) {
    console.error('[AI] Evaluate error:', err.message);
    res.status(500).json({ error: 'Failed to evaluate answer: ' + err.message });
  }
});

// ─── INTERVIEW HISTORY ────────────────────────────────────────────────────────
router.get('/interview/history', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db
      .collection('interview_sessions')
      .where('userId', '==', req.session.userId)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const history = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ history });
  } catch (err) {
    console.error('[AI] History error:', err.message);
    res.status(500).json({ error: 'Failed to fetch interview history.' });
  }
});

// ─── RESUME ANALYZER ──────────────────────────────────────────────────────────
router.post('/resume/analyze', requireAuth, async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({ error: 'Please paste a complete resume (minimum 100 characters).' });
    }

    const roleContext = targetRole ? `Target Role: "${targetRole}"` : 'No specific target role provided (analyze generally).';

    const prompt = `You are an expert ATS (Applicant Tracking System) and career coach with 15+ years of experience.

${roleContext}

Resume Content:
---
${resumeText.substring(0, 4000)}
---

Analyze this resume comprehensively and return ONLY a raw JSON object (no markdown):
{
  "atsScore": <integer 0-100>,
  "scoreBreakdown": {
    "formatting": <integer 0-25>,
    "keywords": <integer 0-25>,
    "experience": <integer 0-25>,
    "skills": <integer 0-25>
  },
  "overallAssessment": "<3-4 sentence overall assessment>",
  "strengths": ["<resume strength 1>", "<resume strength 2>", "<resume strength 3>"],
  "missingKeywords": ["<critical missing keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],
  "improvements": [
    { "section": "<section name>", "issue": "<what's wrong>", "fix": "<specific fix>" },
    { "section": "<section name>", "issue": "<what's wrong>", "fix": "<specific fix>" },
    { "section": "<section name>", "issue": "<what's wrong>", "fix": "<specific fix>" }
  ],
  "suggestedRoles": ["<matching role 1>", "<matching role 2>", "<matching role 3>"],
  "industryFit": "<which industries/domains this resume targets well>",
  "quickWins": ["<easy improvement 1>", "<easy improvement 2>", "<easy improvement 3>"]
}
  - Return ONLY valid JSON
- Do NOT include explanation or text outside JSON
- Response must start with { and end with }
- Ensure JSON is parseable using JSON.parse()`;

    const raw = await callAI(prompt);
    const analysis = extractJSON(raw);

    // Save to Firestore
    const db = getDb();
    await db.collection('resume_analyses').add({
      userId: req.session.userId,
      targetRole: targetRole || 'General',
      resumeSnippet: resumeText.substring(0, 200),
      analysis,
      timestamp: new Date().toISOString(),
    });

    res.json({ analysis });
  } catch (err) {
    console.error('[AI] Resume error:', err.message);
    res.status(500).json({ error: 'Failed to analyze resume: ' + err.message });
  }
});

// ─── CAREER GUIDANCE ──────────────────────────────────────────────────────────
router.post('/career/guidance', requireAuth, async (req, res) => {
  try {
    const { skills, education, interests, experience } = req.body;

    if (!skills || skills.trim().length < 3) {
      return res.status(400).json({ error: 'Please provide your skills.' });
    }
    if (!education || education.trim().length < 3) {
      return res.status(400).json({ error: 'Please provide your education background.' });
    }

    const prompt = `You are a world-class career counselor with deep knowledge of the global job market.

Candidate Profile:
- Skills: ${skills}
- Education: ${education}
- Interests: ${interests || 'Not specified'}
- Experience Level: ${experience || 'Not specified'}

Provide comprehensive, personalized career guidance. Return ONLY a raw JSON object (no markdown):
{
  "topRecommendedRoles": [
    {
      "title": "<exact job title>",
      "matchScore": <integer 60-100>,
      "description": "<2 sentence description of the role>",
      "whyItFits": "<why this matches the candidate's profile>",
      "salaryRange": {
        "entry": "<salary range for 0-2 years>",
        "mid": "<salary range for 3-6 years>",
        "senior": "<salary range for 7+ years>",
        "currency": "USD"
      },
      "topCompanies": ["<company 1>", "<company 2>", "<company 3>"],
      "requiredSkills": ["<must-have skill 1>", "<skill 2>", "<skill 3>", "<skill 4>"],
      "learningPath": ["<step 1>", "<step 2>", "<step 3>"]
    }
  ],
  "skillGaps": ["<skill you should learn 1>", "<skill 2>", "<skill 3>"],
  "certifications": ["<recommended certification 1>", "<cert 2>", "<cert 3>"],
  "careerTimeline": {
    "shortTerm": "<what to achieve in 6 months>",
    "mediumTerm": "<what to achieve in 1-2 years>",
    "longTerm": "<what to achieve in 3-5 years>"
  },
  "industryTrends": "<2-3 sentences on relevant industry trends>",
  "actionableAdvice": ["<concrete step 1>", "<concrete step 2>", "<concrete step 3>"]
}

Provide exactly 5 recommended roles. Be specific with salary figures (use real market data).
- Return ONLY valid JSON
- Do NOT include explanation or text outside JSON
- Response must start with { and end with }
- Ensure JSON is parseable using JSON.parse()`;

    const raw = await callAI(prompt);
    const guidance = extractJSON(raw);

    // Save to Firestore
    const db = getDb();
    await db.collection('career_guidance').add({
      userId: req.session.userId,
      input: { skills, education, interests, experience },
      guidance,
      timestamp: new Date().toISOString(),
    });

    res.json({ guidance });
  } catch (err) {
    console.error('[AI] Career error:', err.message);
    res.status(500).json({ error: 'Failed to generate career guidance: ' + err.message });
  }
});

export default router;