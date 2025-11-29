// routes/chatbot.js - Compatible with ai.js multi-provider config
import express from 'express';
import { createAI, AI_PROVIDERS, createSmartAI } from '../config/ai.js';
import { db } from '../config/firebase.js';

const router = express.Router();

function requireAuth(req, res, next) {
    if (!req.session?.user) {
        return res.status(401).json({ error: 'Unauthorized. Please login.' });
    }
    next();
}

router.post('/message', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user profile to provide context
    let userProfile = null;
    if (req.session?.user?.id) {
      try {
        const doc = await db
          .collection('users')
          .doc(req.session.user.id)
          .get();
        if (doc.exists) {
          userProfile = doc.data();
        }
      } catch (err) {
        console.log('Could not fetch user profile for context:', err);
      }
    }
    
    // Build context-aware prompt
    let profileSnippet = '';
    if (userProfile) {
      profileSnippet = `
User Profile:
- Name: ${userProfile.name || 'Not provided'}
- Skills: ${userProfile.skills || 'Not provided'}
- Degree: ${userProfile.degree || 'Not provided'}
- College: ${userProfile.college || 'Not provided'}

Keep this profile in mind when providing advice.
      `;
    }

    const systemInstruction = `You are the CareerGenie AI. Your purpose is to provide helpful, actionable advice on careers, resumes, interview preparation, and skill development. Be encouraging and concise.`;
    
    const prompt = `${systemInstruction}\n\n${profileSnippet}\n\nUser Question: ${message}`;
    
    // Use SmartAI with automatic fallback
    const smart = createSmartAI([AI_PROVIDERS.GEMINI, AI_PROVIDERS.GROQ]);
    const result = await smart.generate(prompt, {
      temperature: 0.7,
      maxTokens: 1024
    });
    
    const reply = result.text || 'Sorry, I could not generate a response.';
    
    // Save chat history
    if (req.session?.user?.id) {
      try {
        await db.collection('chatHistory').add({
          userId: req.session.user.id,
          message,
          reply,
          provider: result.provider,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to save chat history:', err);
      }
    }
    
    res.json({ 
      success: true, 
      reply,
      provider: result.provider 
    });
    
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ 
      error: 'Failed to process message',
      reply: 'I apologize, but I encountered an error. Please try again or rephrase your question.'
    });
  }
});

// Get chat history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const chats = await db
      .collection('chatHistory')
      .where('userId', '==', req.session.user.id)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();
    
    const history = [];
    chats.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, history });
    
  } catch (err) {
    console.error('Get chat history error:', err);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

export default router;