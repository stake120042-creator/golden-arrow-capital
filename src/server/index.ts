import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Import database connection
import db from '../config/database';

// Import services
import userService from '../services/userService';
import otpService from '../services/otpService';

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

// API Routes for Authentication
const authRouter = express.Router();

// Signup route
authRouter.post('/signup', async (req, res) => {
  try {
    const result = await userService.initiateSignup(req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error in signup route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during signup'
    });
  }
});

// Verify signup OTP route
authRouter.post('/verify-signup', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const result = await userService.verifySignupOTP(email, otp);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error in verify signup route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during verification'
    });
  }
});

// Login route
authRouter.post('/login', async (req, res) => {
  try {
    const result = await userService.initiateLogin(req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error in login route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during login'
    });
  }
});

// Verify login OTP route
authRouter.post('/verify-login', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const result = await userService.verifyLoginOTP(email, otp);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error in verify login route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during verification'
    });
  }
});

// Resend OTP route
authRouter.post('/resend-otp', async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email || !type || !['signup', 'login'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Email and valid type (signup or login) are required'
      });
    }

    const result = await userService.resendOTP(email, type as 'signup' | 'login');
    res.status(result.success ? 200 : 400).json(result);
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

// User routes (protected by auth middleware in a real app)
const userRouter = express.Router();

// Get user profile
userRouter.get('/profile', async (req, res) => {
  // This would normally use authentication middleware to get the user
  // For now, just return a mock response
  res.status(200).json({
    success: true,
    user: {
      id: 'mock-user-id',
      username: 'demouser',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      isVerified: true
    }
  });
});

// Mount user routes
app.use('/api/user', userRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
});

export default app;