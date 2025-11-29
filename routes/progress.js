// routes/progress.js - FIXED WITH PROPER IMPORTS AND ERROR HANDLING
import express from 'express';
import admin from 'firebase-admin';
import { generateText, AI_PROVIDERS, createAI } from '../config/ai.js';

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user || !req.session.user.uid) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized. Please login.' 
    });
  }
  next();
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.uid;
    
    console.log(`📊 Loading progress for user: ${userId}`);

    // Initialize all counters
    let interviewsCompleted = 0;
    let resumesCreated = 0;
    let careersExplored = 0;
    let avgScore = 0;

    // Try to get Firestore instance
    let db;
    try {
      db = admin.firestore();
    } catch (err) {
      console.log('⚠️ Firebase not initialized, using default values');
      return res.json({
        success: true,
        progress: getDefaultProgress(),
        message: 'Firebase not configured. Using default data.'
      });
    }

    // Try to fetch interviews
    try {
      const interviewsSnapshot = await db
        .collection('interviews')
        .where('userId', '==', userId)
        .get();
      
      interviewsCompleted = interviewsSnapshot.size;
      
      // Calculate average score
      if (interviewsCompleted > 0) {
        let totalScore = 0;
        interviewsSnapshot.forEach(doc => {
          const data = doc.data();
          totalScore += data.averageScore || 0;
        });
        avgScore = Math.round(totalScore / interviewsCompleted);
      }
      console.log(`✅ Found ${interviewsCompleted} interviews`);
    } catch (err) {
      console.log('Note: Could not fetch interviews:', err.message);
    }

    // Try to fetch resumes
    try {
      const resumesSnapshot = await db
        .collection('resumes')
        .where('userId', '==', userId)
        .get();
      
      resumesCreated = resumesSnapshot.size;
      console.log(`✅ Found ${resumesCreated} resumes`);
    } catch (err) {
      console.log('Note: Could not fetch resumes:', err.message);
    }

    // Try to fetch career history
    try {
      const careersSnapshot = await db
        .collection('careerHistory')
        .where('userId', '==', userId)
        .get();
      
      careersExplored = careersSnapshot.size;
      console.log(`✅ Found ${careersExplored} career explorations`);
    } catch (err) {
      console.log('Note: Could not fetch career history:', err.message);
    }

    // Generate badges based on achievements
    const badges = generateBadges(interviewsCompleted, resumesCreated, careersExplored, avgScore);

    console.log(`✅ Progress loaded successfully with ${badges.length} badges`);

    res.json({
      success: true,
      progress: {
        interviewsCompleted,
        resumesCreated,
        careersExplored,
        avgInterviewScore: avgScore,
        badges,
        totalActivities: interviewsCompleted + resumesCreated + careersExplored
      }
    });
    
  } catch (err) {
    console.error('❌ Progress error:', err);
    
    // Return default progress instead of error
    res.json({
      success: true,
      progress: getDefaultProgress(),
      message: 'Using default progress data'
    });
  }
});

function generateBadges(interviews, resumes, careers, avgScore) {
  const badges = [];
  
  // Interview badges
  if (interviews >= 1) {
    badges.push({ 
      name: 'First Interview', 
      icon: '🎤', 
      description: 'Completed your first mock interview' 
    });
  }
  if (interviews >= 5) {
    badges.push({ 
      name: 'Interview Pro', 
      icon: '⭐', 
      description: 'Completed 5 mock interviews' 
    });
  }
  if (interviews >= 10) {
    badges.push({ 
      name: 'Interview Master', 
      icon: '👑', 
      description: 'Completed 10 mock interviews' 
    });
  }
  
  // Resume badges
  if (resumes >= 1) {
    badges.push({ 
      name: 'Resume Creator', 
      icon: '📄', 
      description: 'Created your first resume' 
    });
  }
  if (resumes >= 3) {
    badges.push({ 
      name: 'Resume Expert', 
      icon: '💼', 
      description: 'Created 3 or more resumes' 
    });
  }
  
  // Performance badges
  if (avgScore >= 80) {
    badges.push({ 
      name: 'High Achiever', 
      icon: '🏆', 
      description: 'Average interview score above 80%' 
    });
  }
  if (avgScore >= 90) {
    badges.push({ 
      name: 'Excellence', 
      icon: '🌟', 
      description: 'Average interview score above 90%' 
    });
  }
  
  // Career exploration badges
  if (careers >= 1) {
    badges.push({ 
      name: 'Career Explorer', 
      icon: '🗺️', 
      description: 'Explored career paths' 
    });
  }
  if (careers >= 5) {
    badges.push({ 
      name: 'Path Finder', 
      icon: '🧭', 
      description: 'Explored 5+ career paths' 
    });
  }

  // Welcome badge if no activity
  if (interviews === 0 && resumes === 0 && careers === 0) {
    badges.push({ 
      name: 'Welcome to CareerGenie', 
      icon: '🎉', 
      description: 'Start your journey today!' 
    });
  }

  return badges;
}

function getDefaultProgress() {
  return {
    interviewsCompleted: 0,
    resumesCreated: 0,
    careersExplored: 0,
    avgInterviewScore: 0,
    badges: [
      { 
        name: 'Getting Started', 
        icon: '🚀', 
        description: 'Begin your career journey with CareerGenie!' 
      }
    ],
    totalActivities: 0
  };
}

// Optional: Save career exploration
router.post('/career-explored', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.uid;
    const { careers } = req.body;

    const db = admin.firestore();
    await db.collection('careerHistory').add({
      userId,
      careers,
      exploredAt: new Date().toISOString()
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving career exploration:', err);
    res.json({ success: false, error: err.message });
  }
});

export default router;