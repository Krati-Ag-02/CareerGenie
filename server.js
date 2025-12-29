
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAvailableProviders } from './config/ai.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import careerRoutes from './routes/career.js';
import interviewRoutes from './routes/interview.js';
import resumeRoutes from './routes/resume.js';
import chatRoutes from './routes/chatbot.js';
import progressRoutes from './routes/progress.js';

const app = express();
const PORT = process.env.PORT || 5000;



app.use(express.static(path.join(__dirname, 'public')));


app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use(session({
  secret: process.env.SESSION_SECRET || 'careergenie-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));


app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', progressRoutes);



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/auth/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth', 'login.html'));
});

app.get('/auth/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth', 'register.html'));
});


app.get('/career', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'career.html'));
});

app.get('/roles', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'roles.html'));
});

app.get('/interview', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'interview.html'));
});

app.get('/resume', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'resume.html'));
});

app.get('/resume/builder', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'resume-builder.html'));
});


const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login?redirect=' + req.path);
  }
  next();
};

app.get('/profile', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/progress', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'progress.html'));
});


app.get('/health', (req, res) => {
  const availableProviders = getAvailableProviders();
  
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    session: !!req.session.user,
    ai: {
      providers: availableProviders,
      configured: availableProviders.length > 0
    }
  });
});


app.get('/api/ai/status', (req, res) => {
  const availableProviders = getAvailableProviders();
  
  res.json({
    success: true,
    providers: availableProviders,
    details: {
      gemini: !!process.env.GEMINI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      huggingface: !!process.env.HUGGINGFACE_API_KEY,
      together: !!process.env.TOGETHER_API_KEY
    }
  });
});


app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  

  const notFoundPath = path.join(__dirname, 'public', '404.html');
  res.status(404).sendFile(notFoundPath, (err) => {
    if (err) {
      res.status(404).send('<h1>404 - Page Not Found</h1><p><a href="/">Go Home</a></p>');
    }
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
  
  res.status(500).send('<h1>500 - Internal Server Error</h1><p>Something went wrong. <a href="/">Go Home</a></p>');
});


app.listen(PORT, () => {
  const availableProviders = getAvailableProviders();
  
  console.log('');
  console.log('🚀 ========================================');
  console.log(`   CareerGenie Server Started!`);
  console.log('   ========================================');
  console.log(`   📍 URL: http://localhost:${PORT}`);
  console.log(`   📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   ⏰ Started: ${new Date().toLocaleString()}`);
  console.log(`   🔑 Session: ${process.env.SESSION_SECRET ? '✅ Custom' : '⚠️  Default'}`);
  console.log('   ----------------------------------------');
  console.log('   🤖 AI Configuration:');
  
  if (availableProviders.length > 0) {
    console.log(`   ✅ Available Providers: ${availableProviders.join(', ')}`);
    availableProviders.forEach(provider => {
      console.log(`      ✓ ${provider}`);
    });
  } else {
    console.log('   ⚠️  No AI providers configured');
    console.log('   💡 Add API keys to .env:');
    console.log('      - GEMINI_API_KEY');
    console.log('      - GROQ_API_KEY (recommended)');
  }
  
  console.log('   ========================================');
  console.log('');
  

  if (availableProviders.length === 0) {
    console.log('⚠️  WARNING: No AI providers configured!');
    console.log('📝 Add at least one API key to .env for AI features to work.');
    console.log('');
  }
});