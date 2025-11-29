// routes/interview.js - Compatible with ai.js multi-provider config
import express from 'express';
import { createAI, AI_PROVIDERS, createSmartAI } from '../config/ai.js';
import { db } from '../config/firebase.js';

const router = express.Router();

// Helper function to safely parse AI JSON responses
function safeJsonParse(text) {
  // Remove markdown code blocks
  let cleaned = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  try {
    // Try direct parse first
    return JSON.parse(cleaned);
  } catch (e) {
    // If that fails, try to fix common issues
    try {
      // Replace literal newlines in string values
      cleaned = cleaned.replace(/: "([^"]*?)"/g, (match, content) => {
        const fixed = content
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, ' ');
        return `: "${fixed}"`;
      });
      return JSON.parse(cleaned);
    } catch (e2) {
      // Last resort: extract JSON array using regex
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }
      throw new Error('Could not parse JSON response');
    }
  }
}

// Available roles for interview practice
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

// Get available roles endpoint
router.get('/roles', (req, res) => {
  res.json({
    success: true,
    roles: AVAILABLE_ROLES
  });
});

// Comprehensive fallback questions
const FALLBACK_QUESTIONS = {
  'Frontend Developer': [
    { question: 'Explain the difference between let, const, and var in JavaScript.', type: 'technical', difficulty: 'medium', sampleAnswer: 'let and const are block-scoped, while var is function-scoped. const creates immutable bindings, while let allows reassignment.' },
    { question: 'What is the virtual DOM in React?', type: 'technical', difficulty: 'medium', sampleAnswer: 'The virtual DOM is a lightweight copy of the actual DOM that React uses to optimize updates.' },
    { question: 'How do you optimize website performance?', type: 'technical', difficulty: 'hard', sampleAnswer: 'Key strategies include code splitting, lazy loading, image optimization, minification, and caching.' },
    { question: 'Explain CSS specificity.', type: 'technical', difficulty: 'medium', sampleAnswer: 'CSS specificity determines which styles apply when multiple rules target the same element.' },
    { question: 'What are React hooks?', type: 'technical', difficulty: 'medium', sampleAnswer: 'Hooks let you use state and lifecycle features in functional components.' }
  ],
  'Backend Developer': [
    { question: 'Explain RESTful API design principles.', type: 'technical', difficulty: 'medium', sampleAnswer: 'REST uses HTTP methods, stateless communication, resource-based URLs, and standardized responses.' },
    { question: 'What is the difference between SQL and NoSQL?', type: 'technical', difficulty: 'medium', sampleAnswer: 'SQL databases are relational with fixed schemas. NoSQL offers flexible schemas and horizontal scaling.' },
    { question: 'How do you handle authentication?', type: 'technical', difficulty: 'hard', sampleAnswer: 'Use JWT tokens, OAuth, session management, or API keys with proper validation.' },
    { question: 'Explain middleware in Express.js.', type: 'technical', difficulty: 'medium', sampleAnswer: 'Middleware functions have access to request and response objects and can modify them or end the request.' },
    { question: 'What are microservices?', type: 'technical', difficulty: 'hard', sampleAnswer: 'Microservices break applications into small, independent services for better scalability.' }
  ],
  'General': [
    { question: 'Tell me about yourself.', type: 'behavioral', difficulty: 'easy', sampleAnswer: 'Provide a concise overview of your background and key experiences.' },
    { question: 'What are your greatest strengths?', type: 'behavioral', difficulty: 'easy', sampleAnswer: 'Choose 2-3 strengths relevant to the role with specific examples.' },
    { question: 'What is your biggest weakness?', type: 'behavioral', difficulty: 'medium', sampleAnswer: 'Choose a genuine weakness and explain how you\'re working to improve it.' },
    { question: 'Why do you want to work here?', type: 'behavioral', difficulty: 'medium', sampleAnswer: 'Research the company and mention specific aspects that excite you.' },
    { question: 'Describe a challenging situation.', type: 'behavioral', difficulty: 'medium', sampleAnswer: 'Use STAR method: Situation, Task, Action, Result.' }
  ]
};

// Generate interview questions
router.post('/questions', async (req, res) => {
  try {
    const { role, count = 10 } = req.body;
    
    if (!role) {
      return res.status(400).json({ 
        success: false,
        error: 'Role is required' 
      });
    }

    console.log(`🎤 Generating ${count} interview questions for: ${role}`);

    let questions = [];

    // Try AI generation first
    try {
      const smart = createSmartAI([AI_PROVIDERS.GEMINI, AI_PROVIDERS.GROQ]);
      
      const prompt = `You are an expert technical interviewer. Generate ${count} realistic interview questions for: "${role}".

Return ONLY a valid JSON array (no markdown, no code blocks):
[
  {
    "question": "What is your experience with React hooks?",
    "type": "technical",
    "difficulty": "medium",
    "sampleAnswer": "React hooks like useState and useEffect allow functional components to manage state..."
  }
]

Requirements:
- Generate exactly ${count} questions
- Mix: technical (60%), behavioral (30%), scenario (10%)
- Difficulty: easy (30%), medium (50%), hard (20%)
- Questions must be specific to "${role}"
- Sample answers should be 2-3 sentences

Return ONLY the JSON array.`;

      const result = await smart.generate(prompt, {
        temperature: 0.8,
        maxTokens: 2000
      });
      
      // Use safe JSON parser
      questions = safeJsonParse(result.text);
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format');
      }
      
      questions = questions.slice(0, count).map(q => ({
        question: q.question || 'Invalid question',
        type: q.type || 'technical',
        difficulty: q.difficulty || 'medium',
        sampleAnswer: q.sampleAnswer || q.sample_answer || 'No sample answer.'
      }));
      
      console.log(`✅ Generated ${questions.length} AI questions via ${result.provider}`);
      
    } catch (aiErr) {
      console.error('❌ AI generation failed:', aiErr.message);
      questions = [];
    }

    // Use fallback if AI failed
    if (questions.length === 0) {
      console.log('📋 Using fallback questions');
      questions = getFallbackQuestions(role, count);
    }

    // Save to database
    if (req.session?.user) {
      try {
        await db.collection('interviews').add({
          userId: req.session.user.id,
          role,
          questionsGenerated: questions.length,
          timestamp: new Date().toISOString()
        });
      } catch (dbErr) {
        console.log('Note: Could not save to database');
      }
    }

    return res.json({ 
      success: true,
      questions,
      role,
      count: questions.length
    });

  } catch (err) {
    console.error('❌ Interview questions error:', err);
    return res.json({
      success: true,
      questions: getFallbackQuestions(req.body.role || 'General', req.body.count || 10),
      role: req.body.role || 'General'
    });
  }
});

// Evaluate interview answer
router.post('/evaluate', async (req, res) => {
  try {
    const { question, answer, role } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ 
        success: false,
        error: 'Question and answer are required' 
      });
    }

    console.log(`📊 Evaluating answer for: ${role || 'General'}`);

    let evaluation = null;

    // Try AI evaluation
    try {
      const smart = createSmartAI([AI_PROVIDERS.GEMINI, AI_PROVIDERS.GROQ]);
      
      const prompt = `You are an expert interviewer evaluating a candidate's answer.

Role: ${role || 'General'}
Question: ${question}
Answer: ${answer}

Return ONLY valid JSON (no markdown):
{
  "communication": 8,
  "technical": 7,
  "clarity": 8,
  "confidence": 7,
  "correctness": 8,
  "feedback": "Your answer demonstrates solid understanding...",
  "suggestions": [
    "Include specific metrics",
    "Mention relevant tools"
  ],
  "strengths": [
    "Clear explanation",
    "Good examples"
  ]
}

Score each metric 0-10. Be realistic (most good answers: 6-8).
Provide specific, actionable feedback.`;

      const result = await smart.generate(prompt, {
        temperature: 0.6,
        maxTokens: 1024
      });
      
      // Use safe JSON parser
      evaluation = safeJsonParse(result.text);
      
      // Validate scores
      ['communication', 'technical', 'clarity', 'confidence', 'correctness'].forEach(metric => {
        if (typeof evaluation[metric] !== 'number' || evaluation[metric] < 0) {
          evaluation[metric] = 7;
        }
      });
      
      console.log(`✅ Evaluation complete via ${result.provider}`);
      
    } catch (evalErr) {
      console.error('❌ AI evaluation failed:', evalErr.message);
      evaluation = null;
    }

    // Use fallback if AI failed
    if (!evaluation) {
      console.log('📋 Using fallback evaluation');
      evaluation = generateFallbackEvaluation(answer);
    }

    return res.json({ 
      success: true,
      evaluation
    });

  } catch (err) {
    console.error('❌ Evaluation error:', err);
    return res.json({
      success: true,
      evaluation: generateFallbackEvaluation(req.body.answer || '')
    });
  }
});

// Helper functions
function getFallbackQuestions(role, count) {
  let matchingQuestions = FALLBACK_QUESTIONS['General'];
  
  for (const key of Object.keys(FALLBACK_QUESTIONS)) {
    if (role.toLowerCase().includes(key.toLowerCase())) {
      matchingQuestions = FALLBACK_QUESTIONS[key];
      break;
    }
  }
  
  const result = [];
  while (result.length < count) {
    result.push(...matchingQuestions);
  }
  
  return result.slice(0, count);
}

function generateFallbackEvaluation(answer) {
  const answerLength = answer.trim().split(' ').length;
  
  // Generate more varied scores based on answer quality
  let scores = {
    communication: 6,
    technical: 6,
    clarity: 7,
    confidence: 6,
    correctness: 7
  };
  
  // Adjust based on length
  if (answerLength < 20) {
    scores.communication = Math.max(4, Math.floor(Math.random() * 2) + 5);
    scores.technical = Math.max(4, Math.floor(Math.random() * 2) + 5);
    scores.clarity = Math.max(4, Math.floor(Math.random() * 2) + 5);
    scores.confidence = Math.max(4, Math.floor(Math.random() * 2) + 5);
    scores.correctness = Math.max(4, Math.floor(Math.random() * 2) + 5);
  } else if (answerLength < 50) {
    scores.communication = Math.floor(Math.random() * 2) + 6;
    scores.technical = Math.floor(Math.random() * 2) + 6;
    scores.clarity = Math.floor(Math.random() * 2) + 7;
    scores.confidence = Math.floor(Math.random() * 2) + 6;
    scores.correctness = Math.floor(Math.random() * 2) + 6;
  } else if (answerLength >= 100) {
    scores.communication = Math.min(10, Math.floor(Math.random() * 2) + 8);
    scores.technical = Math.min(10, Math.floor(Math.random() * 2) + 7);
    scores.clarity = Math.min(10, Math.floor(Math.random() * 2) + 8);
    scores.confidence = Math.min(10, Math.floor(Math.random() * 2) + 7);
    scores.correctness = Math.min(10, Math.floor(Math.random() * 2) + 8);
  } else {
    scores.communication = Math.floor(Math.random() * 3) + 6;
    scores.technical = Math.floor(Math.random() * 3) + 6;
    scores.clarity = Math.floor(Math.random() * 3) + 6;
    scores.confidence = Math.floor(Math.random() * 3) + 6;
    scores.correctness = Math.floor(Math.random() * 3) + 6;
  }
  
  // Check for quality indicators
  const hasExamples = /example|instance|experience|project|case/i.test(answer);
  const hasTechnical = /code|algorithm|data|system|api|database|framework/i.test(answer);
  const hasNumbers = /\d+/.test(answer);
  const hasSpecifics = /specific|particular|exactly|precisely/i.test(answer);
  
  if (hasExamples) scores.communication = Math.min(10, scores.communication + 1);
  if (hasTechnical) scores.technical = Math.min(10, scores.technical + 1);
  if (hasNumbers) scores.correctness = Math.min(10, scores.correctness + 1);
  if (hasSpecifics) scores.clarity = Math.min(10, scores.clarity + 1);
  
  return {
    ...scores,
    feedback: answerLength < 50 
      ? 'Your answer is concise but could be more detailed. Consider adding specific examples and technical details to strengthen your response.'
      : 'Good answer that demonstrates understanding. You\'ve provided relevant information. Adding specific examples with measurable results would make it even stronger.',
    suggestions: [
      'Include specific examples from your experience',
      'Add quantifiable results or metrics where possible',
      'Mention relevant tools or technologies you\'ve used',
      answerLength < 50 ? 'Expand on your answer with more detail' : 'Consider using the STAR method for behavioral questions'
    ],
    strengths: [
      'Addresses the question directly',
      hasExamples ? 'Includes relevant examples' : 'Clear communication',
      answerLength >= 50 ? 'Good level of detail' : 'Concise response'
    ]
  };
}

export default router;