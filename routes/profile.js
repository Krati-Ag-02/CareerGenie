import express from 'express';
import { requireAuth } from './auth.js';
import { db } from '../config/firebase.js';
import { generateText, AI_PROVIDERS, createAI } from '../config/ai.js';

const router = express.Router();

// Get user profile
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userDoc.data();
    delete userData.password;
    
    res.json({
      success: true,
      profile: {
        id: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// UPDATE USER PROFILE - THIS FIXES THE 404 ERROR
router.put('/update', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, skills, college, cgpa, phone, linkedin, github } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const updateData = {
      name,
      updatedAt: new Date().toISOString()
    };
    
    if (skills) updateData.skills = skills;
    if (college) updateData.college = college;
    if (cgpa) updateData.cgpa = cgpa;
    if (phone) updateData.phone = phone;
    if (linkedin) updateData.linkedin = linkedin;
    if (github) updateData.github = github;
    
    if (skills && college) {
      updateData.profileComplete = true;
    }
    
    await db.collection('users').doc(userId).update(updateData);
    
    req.session.user.name = name;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updateData
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const resumesSnapshot = await db.collection('resumes')
      .where('userId', '==', userId)
      .get();
    
    const interviewsSnapshot = await db.collection('interviews')
      .where('userId', '==', userId)
      .get();
    
    const careersSnapshot = await db.collection('career_recommendations')
      .where('userId', '==', userId)
      .get();
    
    res.json({
      success: true,
      stats: {
        resumeCount: resumesSnapshot.size,
        interviewCount: interviewsSnapshot.size,
        careerMatches: careersSnapshot.size,
        badgeCount: 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.json({ 
      success: true,
      stats: {
        resumeCount: 0,
        interviewCount: 0,
        careerMatches: 0,
        badgeCount: 0
      }
    });
  }
});

// Get recent activity
router.get('/activity', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const activities = [];
    
    const interviewsSnapshot = await db.collection('interviews')
      .where('userId', '==', userId)
      .limit(10)
      .get();
    
    interviewsSnapshot.forEach(doc => {
      const data = doc.data();
      activities.push({
        type: 'interview',
        title: `Completed ${data.role} Interview`,
        score: data.totalScore || 'N/A',
        date: data.createdAt
      });
    });
    
    const resumesSnapshot = await db.collection('resumes')
      .where('userId', '==', userId)
      .limit(10)
      .get();
    
    resumesSnapshot.forEach(doc => {
      const data = doc.data();
      activities.push({
        type: 'resume',
        title: 'Created Resume',
        template: data.template || 'Template 1',
        date: data.createdAt
      });
    });
    
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      success: true,
      activities: activities.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.json({
      success: true,
      activities: []
    });
  }
});

export default router;