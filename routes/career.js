
import express from 'express';
import { generateText, createAI, AI_PROVIDERS, createSmartAI } from '../config/ai.js';

const router = express.Router();

function safeJsonParse(text) {

  let cleaned = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  try {
    
    return JSON.parse(cleaned);
  } catch (e) {
   
    try {
      
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

// Fallback recommendations (used if AI fails)
const FALLBACK_RECOMMENDATIONS = [
  {
    title: 'Software Developer',
    matchScore: 85,
    whyItFits: 'Your technical skills and problem-solving abilities make you an excellent fit for software development.',
    requiredSkills: ['Programming', 'Problem Solving', 'Git', 'Algorithms', 'Testing'],
    skillRoadmap: 'Step 1: Master a programming language\nStep 2: Learn data structures\nStep 3: Build projects\nStep 4: Contribute to open source\nStep 5: Practice interviews',
    salaryRange: '$60,000 - $120,000 per year',
    futureScope: 'Excellent growth with high demand globally.',
    tools: ['VS Code', 'Git', 'Docker', 'AWS']
  },
  {
    title: 'Full Stack Developer',
    matchScore: 80,
    whyItFits: 'Your versatility makes you perfect for full-stack development.',
    requiredSkills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'REST APIs'],
    skillRoadmap: 'Step 1: Learn frontend\nStep 2: Learn backend\nStep 3: Master databases\nStep 4: Build full apps\nStep 5: Deploy to cloud',
    salaryRange: '$70,000 - $130,000 per year',
    futureScope: 'Very high demand with excellent salary growth.',
    tools: ['React', 'Node.js', 'MongoDB', 'Docker']
  },
  {
    title: 'Data Analyst',
    matchScore: 75,
    whyItFits: 'Your analytical skills are perfect for data analysis roles.',
    requiredSkills: ['SQL', 'Excel', 'Python', 'Data Visualization', 'Statistics'],
    skillRoadmap: 'Step 1: Master SQL\nStep 2: Learn Excel\nStep 3: Study Python\nStep 4: Learn visualization\nStep 5: Build portfolio',
    salaryRange: '$55,000 - $95,000 per year',
    futureScope: 'Growing importance as companies become data-driven.',
    tools: ['Excel', 'SQL', 'Python', 'Tableau']
  },
  {
    title: 'Frontend Developer',
    matchScore: 78,
    whyItFits: 'Your design sense and technical skills are ideal for frontend work.',
    requiredSkills: ['JavaScript', 'React', 'HTML5', 'CSS3', 'TypeScript'],
    skillRoadmap: 'Step 1: Master JavaScript\nStep 2: Learn React\nStep 3: Study CSS frameworks\nStep 4: Build websites\nStep 5: Learn TypeScript',
    salaryRange: '$60,000 - $120,000 per year',
    futureScope: 'Strong demand with remote opportunities.',
    tools: ['VS Code', 'React', 'Git', 'Figma']
  },
  {
    title: 'DevOps Engineer',
    matchScore: 72,
    whyItFits: 'Your technical depth makes you suitable for DevOps roles.',
    requiredSkills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS'],
    skillRoadmap: 'Step 1: Learn Linux\nStep 2: Master Docker\nStep 3: Study Kubernetes\nStep 4: Learn CI/CD\nStep 5: Get certified',
    salaryRange: '$75,000 - $140,000 per year',
    futureScope: 'Critical role with growing demand.',
    tools: ['Docker', 'Kubernetes', 'Jenkins', 'AWS']
  }
];

router.post('/recommend', async (req, res) => {
  try {
    const { skills = '', degree = '', interests = '' } = req.body;
    
    console.log('🎯 Career recommendation requested:', { skills, degree, interests });

    // Try AI generation with smart fallback
    try {
      console.log('🤖 Attempting AI generation...');
      
      // Use SmartAI which automatically tries multiple providers
      const smart = createSmartAI([AI_PROVIDERS.GEMINI, AI_PROVIDERS.GROQ]);

      const prompt = `You are an expert career counselor. Analyze this profile:

Skills: ${skills}
Degree: ${degree}
Interests: ${interests}

Provide exactly 5 career recommendations in this JSON format (return ONLY valid JSON, no markdown):

[
  {
    "title": "Job Title",
    "matchScore": 85,
    "whyItFits": "2-3 sentences why this fits",
    "requiredSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "skillRoadmap": "Step 1: ...\nStep 2: ...\nStep 3: ...\nStep 4: ...\nStep 5: ...",
    "salaryRange": "$XX,000 - $YY,000 per year",
    "futureScope": "Career outlook",
    "tools": ["tool1", "tool2", "tool3", "tool4"]
  }
]

Make realistic recommendations with accurate salaries. Return ONLY the JSON array.`;

      const result = await smart.generate(prompt, {
        temperature: 0.7,
        maxTokens: 2000
      });
      
      console.log('✅ Got AI response from:', result.provider);
      
      // Use safe JSON parser
      const recommendations = safeJsonParse(result.text);
      
      if (Array.isArray(recommendations) && recommendations.length > 0) {
        console.log('✅ AI recommendations generated successfully');
        return res.json({
          success: true,
          recommendations: recommendations.slice(0, 5),
          source: 'ai',
          provider: result.provider
        });
      }
      
      throw new Error('Invalid AI response format');
      
    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError.message);
      console.log('📋 Falling back to curated recommendations');
    }

    // Use fallback recommendations
    return res.json({
      success: true,
      recommendations: FALLBACK_RECOMMENDATIONS,
      source: 'fallback'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.json({
      success: true,
      recommendations: FALLBACK_RECOMMENDATIONS,
      source: 'error-fallback'
    });
  }
});

export default router;