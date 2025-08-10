#!/usr/bin/env node

// Direct server implementation - no need to use ts-node
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Basic auth routes for testing
const authRouter = express.Router();

// Simplified routes with mock responses
authRouter.post('/signup', (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    
    // Validate request
    const { email, password, firstName, lastName, username } = req.body;
    
    if (!email || !password || !firstName || !lastName || !username) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Mock successful response
    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email. Please check your inbox.',
      data: { email }
    });
  } catch (error) {
    console.error('Error in signup route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during signup' 
    });
  }
});

authRouter.post('/verify-signup', (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }
    
    // Mock successful response
    res.status(200).json({
      success: true,
      message: 'Account created successfully! Welcome to Golden Arrow Capital.',
      user: {
        id: `user_${Date.now()}`,
        username: req.body.username || 'user123',
        email: email,
        firstName: 'Test',
        lastName: 'User',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      token: `token_${Date.now()}`
    });
  } catch (error) {
    console.error('Error in verify signup route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during verification'
    });
  }
});

authRouter.post('/login', (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    
    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required'
      });
    }
    
    // Mock successful response
    res.status(200).json({
      success: true,
      message: 'Password verified. Please check your email for the verification code.',
      data: { email: usernameOrEmail, userId: `user_${Date.now()}` }
    });
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during login'
    });
  }
});

authRouter.post('/verify-login', (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }
    
    // Mock successful response
    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      user: {
        id: `user_${Date.now()}`,
        username: 'demouser',
        email: email,
        firstName: 'Test',
        lastName: 'User',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      token: `token_${Date.now()}`
    });
  } catch (error) {
    console.error('Error in verify login route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during verification'
    });
  }
});

authRouter.post('/resend-otp', (req, res) => {
  try {
    const { email, type } = req.body;
    
    if (!email || !type || !['signup', 'login'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Email and valid type (signup or login) are required'
      });
    }
    
    // Mock successful response
    res.status(200).json({
      success: true,
      message: `Verification code resent for ${type}. Please check your email.`
    });
  } catch (error) {
    console.error('Error in resend OTP route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error while resending OTP'
    });
  }
});

// Mount auth routes
app.use('/api/auth', authRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check at http://localhost:${PORT}/api/health`);
});

// Handle clean shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});