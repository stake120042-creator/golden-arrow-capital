import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import otpService from '../services/otpService';
import authService from '../services/authService';

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
  void req;
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API Routes for Authentication
const authRouter = express.Router();

// Signup route: generate and send OTP
authRouter.post('/signup', async (req, res) => {
  try {
    const { email, firstName } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const result = await otpService.generateAndSendOTP({ email, type: 'signup', firstName });
    res.status(result.success ? 200 : 400).json({ success: result.success, message: result.message, data: { email } });
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

    const verify = await otpService.verifyOTP({ email, otp, type: 'signup' });
    
    if (verify.success) {
      // Create user account after successful OTP verification
      const user = await authService.createUserAfterSignup(email);
      const token = authService.generateToken(user);
      
      res.status(200).json({
        success: true,
        message: 'Account created successfully! You can now log in.',
        user,
        token
      });
    } else {
      res.status(400).json(verify);
    }
  } catch (error) {
    console.error('Error in verify signup route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during verification'
    });
  }
});

// Login route: generate and send OTP
authRouter.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail } = req.body || {};
    if (!usernameOrEmail) {
      return res.status(400).json({ success: false, message: 'Username/email is required' });
    }

    const result = await otpService.generateAndSendOTP({ email: usernameOrEmail, type: 'login' });
    res.status(result.success ? 200 : 400).json({ success: result.success, message: result.message, data: { email: usernameOrEmail } });
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

    const verify = await otpService.verifyOTP({ email, otp, type: 'login' });
    
    if (verify.success) {
      // Get user and generate token for successful login
      const user = await authService.getUserForLogin(email);
      
      if (user) {
        const token = authService.generateToken(user);
        
        res.status(200).json({
          success: true,
          message: 'Login successful! Welcome back.',
          user,
          token
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'User not found. Please sign up first.'
        });
      }
    } else {
      res.status(400).json(verify);
    }
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
    const { email, type, firstName } = req.body;
    if (!email || !type || !['signup', 'login'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Email and valid type (signup or login) are required'
      });
    }

    const result = await otpService.resendOTP(email, type as 'signup' | 'login', firstName);
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

// Start server (only in development or non-Vercel environments)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API available at http://localhost:${PORT}/api`);
  });
}

export default app;