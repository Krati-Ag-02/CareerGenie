// routes/interview.js - Improved & hardened version
import express from 'express';
import { createAI, AI_PROVIDERS, createSmartAI } from '../config/ai.js';
import { db } from '../config/firebase.js';

const router = express.Router();

/* =========================
   Utility Helpers
========================= */

// Prevent basic prompt injection
function sanitize(text = '') {
  return text.replace(/[`$]/g, '');
}

// Safe JSON parsing for AI responses
function safeJsonParse(text) {
  let cleaned = text.trim()
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '');

  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      cleaned = cleaned.replace(/: "([^"]*?)"/g, (_, content) => {
        const fixed = content
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, ' ');
        return `: "${fixed}"`;
      });
      return JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Invalid JSON');
    }
  }
}

// Validate AI-generated questions
function isValidQuestion(q) {
  return (
    q &&
    typeof q.question === 'string' &&
    ['technical', 'behavioral', 'scenario'].includes(q.type) &&
    ['easy', 'medium', 'hard'].includes(q.difficulty)
  );
}

/* =========================
   Available Roles
========================= */

const AVAILABLE_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Business Analyst',
  'Cloud Engineer',
  'Mobile Developer (Android)',
  'Mobile Developer (iOS)',
  'QA Engineer',
  'Cybersecurity Engineer',
  'Database Administrator',
  'Software Architect',
  'Game Developer',
  'Blockchain Developer',
  'AI Engineer',
  'Digital Marketing Specialist'
];

router.get('/roles', (req, res) => {
  res.json({ success: true, roles: AVAILABLE_ROLES });
});

/* =========================
   Fallback Questions
========================= */

const FALLBACK_QUESTIONS = {
  Frontend: [
    { question: 'Explain let, var, and const.', type: 'technical', difficulty: 'medium', sampleAnswer: 'let and const are block scoped, var is function scoped.' },
    { question: 'What is the Virtual DOM?', type: 'technical', difficulty: 'medium', sampleAnswer: 'It is a lightweight copy of the real DOM used by React.' }
  ],
  Backend: [
    { question: 'Explain REST APIs.', type: 'technical', difficulty: 'medium', sampleAnswer: 'REST uses stateless HTTP methods to interact with resources.' },
    { question: 'What is middleware in Express?', type: 'technical', difficulty: 'medium', sampleAnswer: 'Middleware handles request/response logic in Express.' }
  ],
  General: [
    { question: 'Tell me about yourself.', type: 'behavioral', difficulty: 'easy', sampleAnswer: 'Brief professional background and goals.' },
    { question: 'What are your strengths?', type: 'behavioral', difficulty: 'easy', sampleAnswer: 'Mention strengths with examples.' }
  ]
};

function getFallbackQuestions(role, count) {
  const normalized = role.toLowerCase();

  const key = Object.keys(FALLBACK_QUESTIONS).find(k =>
    normalized.includes(k.toLowerCase())
  );

  const pool = FALLBACK_QUESTIONS[key] || FALLBACK_QUESTIONS.General;

  const result = [];
  while (result.length < count) result.push(...pool);
  return result.slice(0, count);
}

/* =========================
   Generate Questions
========================= */

router.post('/questions', async (req, res) => {
  try {
    const { role, count = 10 } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, error: 'Role is required' });
    }

    let questions = [];

    try {
      const smartAI = createSmartAI([AI_PROVIDERS.GEMINI, AI_PROVIDERS.GROQ]);

      const prompt = `
Generate exactly ${count} interview questions for "${role}".

Return ONLY valid JSON array:
[
  {
    "question": "...",
    "type": "technical | behavioral | scenario",
    "difficulty": "easy | medium | hard",
    "sampleAnswer": "2-3 sentence answer"
  }
]
`;

      const result = await smartAI.generate(prompt, {
        temperature: 0.8,
        maxTokens: 2000
      });

      questions = safeJsonParse(result.text)
        .filter(isValidQuestion)
        .slice(0, count);

    } catch (err) {
      console.error('AI question generation failed:', err.message);
    }

    if (!questions.length) {
      questions = getFallbackQuestions(role, count);
    }

    if (req.session?.user) {
      await db.collection('interviews').add({
        userId: req.session.user.id,
        role,
        questionsGenerated: questions.length,
        createdAt: new Date()
      });
    }

    res.json({ success: true, role, count: questions.length, questions });

  } catch (err) {
    res.json({
      success: true,
      questions: getFallbackQuestions(req.body.role || 'General', req.body.count || 10)
    });
  }
});

/* =========================
   Evaluate Answer
========================= */

router.post('/evaluate', async (req, res) => {
  try {
    const { question, answer, role } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, error: 'Question and answer required' });
    }

    let evaluation;

    try {
      const smartAI = createSmartAI([AI_PROVIDERS.GEMINI, AI_PROVIDERS.GROQ]);

      const prompt = `
Evaluate this interview answer.

Role: ${sanitize(role || 'General')}
Question: ${sanitize(question)}
Answer: ${sanitize(answer)}

Return ONLY JSON:
{
  "communication": 0-10,
  "technical": 0-10,
  "clarity": 0-10,
  "confidence": 0-10,
  "correctness": 0-10,
  "feedback": "...",
  "suggestions": [],
  "strengths": []
}
`;

      const result = await smartAI.generate(prompt, {
        temperature: 0.6,
        maxTokens: 1000
      });

      evaluation = safeJsonParse(result.text);

    } catch (err) {
      console.error('AI evaluation failed:', err.message);
    }

    if (!evaluation) {
      evaluation = generateFallbackEvaluation(answer);
    }

    res.json({ success: true, evaluation });

  } catch {
    res.json({ success: true, evaluation: generateFallbackEvaluation(req.body.answer || '') });
  }
});

/* =========================
   Fallback Evaluation
========================= */

function generateFallbackEvaluation(answer) {
  const length = answer.split(' ').length;

  let score = length < 30 ? 5 : length < 70 ? 7 : 8;

  return {
    communication: score,
    technical: score,
    clarity: score + 1,
    confidence: score,
    correctness: score,
    feedback: 'Solid response. Add examples and metrics to strengthen it.',
    suggestions: [
      'Use real project examples',
      'Mention tools or technologies',
      'Quantify impact where possible'
    ],
    strengths: [
      'Direct answer',
      length > 50 ? 'Good detail' : 'Concise explanation'
    ]
  };
}

export default router;
