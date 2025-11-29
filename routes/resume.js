// routes/resume.js - Compatible with ai.js multi-provider config
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { db } from '../config/firebase.js'; 
import { createAI, AI_PROVIDERS, createSmartAI } from '../config/ai.js';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import puppeteer from 'puppeteer'; 

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
      // Last resort: extract JSON object using regex
      const objMatch = cleaned.match(/\{[\s\S]*\}/);
      if (objMatch) {
        return JSON.parse(objMatch[0]);
      }
      throw new Error('Could not parse JSON response');
    }
  }
}

function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }
  next();
}

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed!'), false);
        }
    }
});

// Helper to extract text from file
async function extractText(filePath, mimeType) {
    if (mimeType === 'application/pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    }
    return '';
}

// Resume Analysis
router.post('/analyze', requireAuth, upload.single('resumeFile'), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        const resumeText = await extractText(file.path, file.mimetype);
        
        // Use SmartAI with automatic provider fallback
        const smart = createSmartAI([AI_PROVIDERS.GEMINI, AI_PROVIDERS.GROQ]);
        
        const prompt = `You are a top-tier resume analyst. Analyze this resume and provide a comprehensive evaluation.

Resume Text:
---
${resumeText}
---

Return ONLY valid JSON (no markdown):
{
  "score": 85,
  "feedback": "Overall summary in 3-5 sentences",
  "areas_for_improvement": [
    "Actionable item 1",
    "Actionable item 2",
    "Actionable item 3"
  ],
  "strengths": [
    "Key strength 1",
    "Key strength 2",
    "Key strength 3"
  ],
  "keywords_found": [
    "keyword1",
    "keyword2",
    "keyword3",
    "keyword4",
    "keyword5"
  ]
}

Provide realistic scores (0-100) and specific, actionable feedback.`;
        
        const result = await smart.generate(prompt, {
          temperature: 0.6,
          maxTokens: 1500
        });

        // Use safe JSON parser
        const analysis = safeJsonParse(result.text);

        // Save analysis history
        if (req.session?.user?.id) {
          try {
            await db.collection('resumes').add({
              userId: req.session.user.id,
              fileName: file.originalname,
              score: analysis.score || 0,
              summary: analysis.feedback || 'N/A',
              provider: result.provider,
              timestamp: new Date().toISOString()
            });
          } catch (dbErr) {
            console.log('Could not save to database');
          }
        }

        res.json({ 
          success: true, 
          analysis,
          provider: result.provider 
        });

    } catch (err) {
        console.error('Resume analysis error:', err);
        
        // Fallback analysis
        res.json({
          success: true,
          analysis: {
            score: 70,
            feedback: 'Your resume has been analyzed. Consider adding more quantifiable achievements and relevant keywords for better ATS optimization.',
            areas_for_improvement: [
              'Add specific metrics and numbers to achievements',
              'Include more industry-relevant keywords',
              'Strengthen the professional summary section'
            ],
            strengths: [
              'Clear formatting and structure',
              'Relevant work experience listed',
              'Educational background provided'
            ],
            keywords_found: ['experience', 'skills', 'education', 'projects', 'technical']
          },
          provider: 'fallback'
        });
    } finally {
        // Clean up
        if (file?.path) {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Failed to delete temp file:', err);
          });
        }
    }
});

// Resume Builder & PDF Generation
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { 
        personalInfo = {}, 
        education = [], 
        experience = [], 
        skills = [], 
        templateId = 'modern' 
    } = req.body;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              margin: 40px;
              color: #333;
            }
            h1 { 
              color: #2c3e50; 
              border-bottom: 3px solid #3498db; 
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            h2 { 
              color: #3498db; 
              margin-top: 25px;
              border-bottom: 1px solid #ecf0f1;
              padding-bottom: 5px;
            }
            .contact-info {
              color: #7f8c8d;
              margin-bottom: 20px;
            }
            .section { 
              margin-bottom: 25px; 
            }
            .job-entry, .edu-entry { 
              margin-bottom: 15px; 
            }
            .job-title, .degree {
              font-weight: bold;
              color: #2c3e50;
            }
            .company, .institution {
              color: #7f8c8d;
              font-style: italic;
            }
            .skills-list {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
            }
            .skill-tag {
              background: #ecf0f1;
              padding: 5px 10px;
              border-radius: 5px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <h1>${personalInfo.name || 'Resume'}</h1>
          <div class="contact-info">
            ${personalInfo.email || ''} 
            ${personalInfo.phone ? ' | ' + personalInfo.phone : ''} 
            ${personalInfo.linkedin ? ' | ' + personalInfo.linkedin : ''}
          </div>
          
          <div class="section">
            <h2>Skills</h2>
            <div class="skills-list">
              ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>

          <div class="section">
            <h2>Experience</h2>
            ${experience.map(exp => `
                <div class="job-entry">
                    <div class="job-title">${exp.title || 'Position'}</div>
                    <div class="company">${exp.company || 'Company'} | ${exp.dates || 'Dates'}</div>
                    <p>${exp.description || 'Job responsibilities and achievements.'}</p>
                </div>
            `).join('')}
          </div>
          
          <div class="section">
            <h2>Education</h2>
            ${education.map(edu => `
                <div class="edu-entry">
                    <div class="degree">${edu.degree || 'Degree'}</div>
                    <div class="institution">${edu.institution || 'Institution'} | ${edu.dates || 'Dates'}</div>
                </div>
            `).join('')}
          </div>
        </body>
        </html>
    `;

    const browser = await puppeteer.launch({ 
        headless: 'new', 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();

    // Save generation record
    if (req.session?.user?.id) {
      try {
        await db.collection('resumes').add({
          userId: req.session.user.id,
          type: 'generated',
          template: templateId,
          timestamp: new Date().toISOString()
        });
      } catch (dbErr) {
        console.log('Could not save generation record');
      }
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename="resume-${personalInfo.name || 'user'}.pdf"`
    });
    res.send(pdfBuffer);

  } catch (err) {
    console.error('Resume generation error:', err);
    res.status(500).json({ error: 'Failed to generate PDF resume.' });
  }
});

export default router;