'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Shield, Award } from 'lucide-react';
import userService from '@/services/userService';
import { SignupData, LoginData } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import OTPInput from '@/components/OTPInput';

export default function LandingPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signup' | 'login' | 'otp' | 'login-otp'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  
  // Form data states
  const [signupFormData, setSignupFormData] = useState<SignupData>({
    sponsor: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Password validation state
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  
  // Real-time validation states
  const [sponsorValidation, setSponsorValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    message: string;
  }>({ isValidating: false, isValid: null, message: '' });
  
  const [usernameValidation, setUsernameValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    message: string;
  }>({ isValidating: false, isValid: null, message: '' });
  
  const [loginFormData, setLoginFormData] = useState<LoginData>({
    usernameOrEmail: '',
    password: '',
    rememberMe: false
  });

  // Validate password matching
  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    const match = password === confirmPassword && password !== '';
    setPasswordsMatch(match);
    return match;
  };

  // Validate sponsor username
  const validateSponsor = async (sponsor: string) => {
    if (!sponsor.trim()) {
      setSponsorValidation({ isValidating: false, isValid: null, message: '' });
      return;
    }

    setSponsorValidation({ isValidating: true, isValid: null, message: '' });

    try {
      const response = await fetch('/api/auth/verify-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: sponsor.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.exists) {
          setSponsorValidation({
            isValidating: false,
            isValid: true,
            message: 'Sponsor username is valid'
          });
        } else {
          setSponsorValidation({
            isValidating: false,
            isValid: false,
            message: 'Invalid sponsor username'
          });
        }
      } else {
        setSponsorValidation({
          isValidating: false,
          isValid: false,
          message: 'Failed to verify sponsor username'
        });
      }
    } catch (error) {
      setSponsorValidation({
        isValidating: false,
        isValid: false,
        message: 'Error checking sponsor username'
      });
    }
  };

  // Validate username availability
  const validateUsername = async (username: string) => {
    if (!username.trim()) {
      setUsernameValidation({ isValidating: false, isValid: null, message: '' });
      return;
    }

    // Basic validation
    if (username.length < 3) {
      setUsernameValidation({
        isValidating: false,
        isValid: false,
        message: 'Username must be at least 3 characters'
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameValidation({
        isValidating: false,
        isValid: false,
        message: 'Username can only contain letters, numbers, and underscores'
      });
      return;
    }

    setUsernameValidation({ isValidating: true, isValid: null, message: '' });

    try {
      const response = await fetch('/api/auth/verify-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.exists) {
          setUsernameValidation({
            isValidating: false,
            isValid: false,
            message: 'Username is already taken'
          });
        } else {
          setUsernameValidation({
            isValidating: false,
            isValid: true,
            message: 'Username is available'
          });
        }
      } else {
        setUsernameValidation({
          isValidating: false,
          isValid: false,
          message: 'Failed to check username availability'
        });
      }
    } catch (error) {
      setUsernameValidation({
        isValidating: false,
        isValid: false,
        message: 'Error checking username availability'
      });
    }
  };
  
  useEffect(() => {
    // Check for sponsor parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sponsorParam = urlParams.get('sponsor');
    
    if (sponsorParam) {
      setSignupFormData(prev => ({
        ...prev,
        sponsor: sponsorParam
      }));
      // Switch to signup tab if not already there
      setActiveTab('signup');
    }
    
    // Trigger animation after component mount
    setTimeout(() => {
      setAnimateIn(true);
    }, 100);
  }, []);
  
  useEffect(() => {
    // Reset animation when tab changes
    setAnimateIn(false);
    setErrorMessage('');
    setSuccessMessage('');
    // Reset validation states when switching tabs
    setSponsorValidation({ isValidating: false, isValid: null, message: '' });
    setUsernameValidation({ isValidating: false, isValid: null, message: '' });
    setTimeout(() => {
      setAnimateIn(true);
    }, 50);
  }, [activeTab]);
  
  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // OTP completion handler for the new OTPInput component
  const handleOtpComplete = (otp: string) => {
    setOtpValue(otp);
  };
  
  const handleSignupInputChange = (field: keyof SignupData, value: string) => {
    const newFormData = { ...signupFormData, [field]: value };
    setSignupFormData(newFormData);

    // Validate password matching on change
    if (field === 'password') {
      validatePasswordMatch(value, newFormData.confirmPassword);
    } else if (field === 'confirmPassword') {
      validatePasswordMatch(newFormData.password, value);
    }
  };

  const handleSignupInputBlur = async (field: keyof SignupData, value: string) => {
    // Validate sponsor on blur
    if (field === 'sponsor') {
      await validateSponsor(value);
    }
    
    // Validate username on blur
    if (field === 'username') {
      await validateUsername(value);
    }
  };
  
  const handleLoginInputChange = (field: keyof LoginData, value: string | boolean) => {
    setLoginFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validate password matching
    const passwordMatch = validatePasswordMatch(signupFormData.password, signupFormData.confirmPassword);

    if (!passwordMatch) {
      setErrorMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate sponsor if provided
    if (signupFormData.sponsor && signupFormData.sponsor.trim() && sponsorValidation.isValid === false) {
      setErrorMessage('Please enter a valid sponsor username');
      setIsLoading(false);
      return;
    }

    // Validate username
    if (usernameValidation.isValid === false) {
      setErrorMessage('Please choose a valid username');
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await userService.initiateSignup(signupFormData);
      
      if (result.success) {
        setCurrentEmail(signupFormData.email);
        setActiveTab('otp');
        setSuccessMessage(result.message);
        startResendTimer();
        // Reset OTP values
        setOtpValue('');
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const result = await userService.initiateLogin(loginFormData);
      
      if (result.success) {
        setCurrentEmail(result.data?.email || '');
        setActiveTab('login-otp');
        setSuccessMessage(result.message);
        startResendTimer();
        // Reset OTP values
        setOtpValue('');
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const otpString = otpValue;
      const result = await userService.verifySignupOTP(currentEmail, otpString);
      
      if (result.success) {
        setSuccessMessage(result.message);
        // Small delay to show success message then redirect to login
        setTimeout(() => {
          setActiveTab('login');
          setSuccessMessage('Account created successfully! Please log in.');
        }, 1500);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const otpString = otpValue;
      const result = await userService.verifyLoginOTP(currentEmail, otpString);
      
      if (result.success && result.user && result.token) {
        setSuccessMessage(result.message);
        // Small delay to show success message
        setTimeout(() => {
          login(result.user!, result.token!);
          router.push('/dashboard');
        }, 1500);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Login OTP verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (resendTimer === 0) {
      setIsLoading(true);
      setErrorMessage('');
      
      try {
        const otpType = activeTab === 'otp' ? 'signup' : 'login';
        const result = await userService.resendOTP(currentEmail, otpType);
        
        if (result.success) {
          setSuccessMessage(result.message);
          startResendTimer();
        } else {
          setErrorMessage(result.message);
        }
      } catch (error) {
        setErrorMessage('Failed to resend OTP. Please try again.');
        console.error('Resend OTP error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {isLoading && (
        <div className="loader">
          <div className="spinner"></div>
        </div>
      )}
      
      {/* Enhanced Professional Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Large gradient orbs */}
          <div className="absolute w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-yellow-500/10 to-amber-600/5 blur-3xl -top-60 -left-60 animate-float"></div>
          <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-purple-500/8 to-indigo-600/5 blur-3xl -bottom-60 -right-60 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500/6 to-cyan-600/4 blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float" style={{animationDelay: '4s'}}></div>
          
          {/* Floating particles */}
          <div className="absolute w-2 h-2 rounded-full bg-yellow-400/60 top-32 left-1/4 animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
          <div className="absolute w-3 h-3 rounded-full bg-purple-400/50 top-48 right-1/3 animate-bounce" style={{animationDelay: '2s', animationDuration: '4s'}}></div>
          <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/70 bottom-40 left-1/3 animate-bounce" style={{animationDelay: '3s', animationDuration: '5s'}}></div>
          <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-400/40 top-1/2 right-1/4 animate-bounce" style={{animationDelay: '4s', animationDuration: '6s'}}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <header className="relative z-20 pt-8 pb-12">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/40 to-amber-500/30 rounded-xl blur-lg opacity-75 animate-pulse-glow"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center text-slate-900 font-bold text-xl shadow-2xl">
                    GA
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">Golden Arrow Capital</h1>
                  <p className="text-slate-400 text-sm font-medium">Premium Investment Platform</p>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-slate-300 hover:text-yellow-400 transition-colors duration-300 font-medium">Features</a>
                <a href="#about" className="text-slate-300 hover:text-yellow-400 transition-colors duration-300 font-medium">About</a>
                <a href="#contact" className="text-slate-300 hover:text-yellow-400 transition-colors duration-300 font-medium">Contact</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md mx-auto">
            {/* Auth Form */}
            <div className={`${animateIn ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="relative">
                {/* Form Container */}
                <div className="relative w-full max-w-md mx-auto">
                  {/* Glass morphism container */}
                  <div className="relative overflow-hidden rounded-2xl">
                    {/* Background blur effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20"></div>
                    
                    {/* Animated border */}
                    <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-yellow-400/50 via-amber-500/30 to-yellow-400/50">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/90"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 p-8">
                        {/* Error/Success Messages */}
                        {errorMessage && (
                          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 animate-scale-in">
                            <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
                            <p className="text-red-300 text-sm">{errorMessage}</p>
                          </div>
                        )}
                        
                        {successMessage && (
                                  <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start space-x-3 animate-scale-in">
          <CheckCircle className="text-yellow-400 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-yellow-300 text-sm">{successMessage}</p>
        </div>
                        )}
                        
                        {/* Tab Navigation */}
                        <div className="flex space-x-1 mb-8 bg-slate-800/50 rounded-xl p-1">
                          <button
                            onClick={() => setActiveTab('signup')}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                              activeTab === 'signup'
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                          >
                            Sign Up
                          </button>
                          <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                              activeTab === 'login'
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                          >
                            Sign In
                          </button>
                        </div>
                        
                        {/* Form Content */}
                        <div className="space-y-6">
                          {activeTab === 'signup' && (
                            <form onSubmit={handleSignup} className="space-y-5">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Sponsor (Optional)</label>
                                <input 
                                  type="text" 
                                  value={signupFormData.sponsor}
                                  onChange={(e) => handleSignupInputChange('sponsor', e.target.value)}
                                  onBlur={(e) => handleSignupInputBlur('sponsor', e.target.value)}
                                  className={`form-input ${
                                    sponsorValidation.isValid === false ? 'border-red-500 focus:border-red-500' :
                                    sponsorValidation.isValid === true ? 'border-green-500 focus:border-green-500' : ''
                                  }`}
                                  placeholder="Enter sponsor username" 
                                />
                                {sponsorValidation.isValidating && (
                                  <div className="mt-2 flex items-center text-blue-400 text-sm">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                                    Checking sponsor username...
                                  </div>
                                )}
                                {sponsorValidation.message && !sponsorValidation.isValidating && (
                                  <div className={`mt-2 text-sm ${
                                    sponsorValidation.isValid === true ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {sponsorValidation.message}
                                  </div>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                                  <input 
                                    type="text" 
                                    value={signupFormData.firstName}
                                    onChange={(e) => handleSignupInputChange('firstName', e.target.value)}
                                    className="form-input" 
                                    placeholder="John" 
                                    required 
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                                  <input 
                                    type="text" 
                                    value={signupFormData.lastName}
                                    onChange={(e) => handleSignupInputChange('lastName', e.target.value)}
                                    className="form-input" 
                                    placeholder="Doe" 
                                    required 
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Username *</label>
                                <input 
                                  type="text" 
                                  value={signupFormData.username}
                                  onChange={(e) => handleSignupInputChange('username', e.target.value)}
                                  onBlur={(e) => handleSignupInputBlur('username', e.target.value)}
                                  className={`form-input ${
                                    usernameValidation.isValid === false ? 'border-red-500 focus:border-red-500' :
                                    usernameValidation.isValid === true ? 'border-green-500 focus:border-green-500' : ''
                                  }`}
                                  placeholder="Choose a username" 
                                  required 
                                />
                                {usernameValidation.isValidating && (
                                  <div className="mt-2 flex items-center text-blue-400 text-sm">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                                    Checking username availability...
                                  </div>
                                )}
                                {usernameValidation.message && !usernameValidation.isValidating && (
                                  <div className={`mt-2 text-sm ${
                                    usernameValidation.isValid === true ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {usernameValidation.message}
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                                <input 
                                  type="email" 
                                  value={signupFormData.email}
                                  onChange={(e) => handleSignupInputChange('email', e.target.value)}
                                  className="form-input" 
                                  placeholder="john@example.com" 
                                  required 
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Password *</label>
                                <div className="relative">
                                  <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={signupFormData.password}
                                    onChange={(e) => handleSignupInputChange('password', e.target.value)}
                                    className="form-input pr-12" 
                                    placeholder="Create a strong password" 
                                    required 
                                  />
                                  <button 
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors duration-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                  </button>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password *</label>
                                <div className="relative">
                                  <input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    value={signupFormData.confirmPassword}
                                    onChange={(e) => handleSignupInputChange('confirmPassword', e.target.value)}
                                    className="form-input pr-12" 
                                    placeholder="Confirm your password" 
                                    required 
                                  />
                                  <button 
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors duration-300"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                  </button>
                                </div>
                              </div>
                              
                              <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                <input 
                                  type="checkbox" 
                                  id="terms" 
                                  className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 text-yellow-400 focus:ring-yellow-400 focus:ring-2" 
                                  required 
                                />
                                <label htmlFor="terms" className="text-sm text-slate-300 leading-relaxed">
                                  I agree to the{' '}
                                  <a href="#" className="text-yellow-400 hover:text-yellow-300 underline transition-colors duration-300">Terms of Service</a>
                                  {' '}and{' '}
                                  <a href="#" className="text-yellow-400 hover:text-yellow-300 underline transition-colors duration-300">Privacy Policy</a>
                                </label>
                              </div>
                              
                              <button 
                                type="submit" 
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center"
                              >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                                {!isLoading && <ArrowRight size={20} className="ml-2" />}
                              </button>
                            </form>
                          )}
                          
                          {activeTab === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-5">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Username or Email *</label>
                                <input 
                                  type="text" 
                                  value={loginFormData.usernameOrEmail}
                                  onChange={(e) => handleLoginInputChange('usernameOrEmail', e.target.value)}
                                  className="form-input" 
                                  placeholder="Enter your username or email" 
                                  required 
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Password *</label>
                                <div className="relative">
                                  <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={loginFormData.password}
                                    onChange={(e) => handleLoginInputChange('password', e.target.value)}
                                    className="form-input pr-12" 
                                    placeholder="Enter your password" 
                                    required 
                                  />
                                  <button 
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors duration-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                  </button>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <input 
                                    type="checkbox" 
                                    id="rememberMe" 
                                    checked={loginFormData.rememberMe}
                                    onChange={(e) => handleLoginInputChange('rememberMe', e.target.checked)}
                                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-yellow-400 focus:ring-yellow-400 focus:ring-2" 
                                  />
                                  <label htmlFor="rememberMe" className="text-sm text-slate-300">
                                    Remember me
                                  </label>
                                </div>                      
                              </div>
                              
                              <button 
                                type="submit" 
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center"
                              >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                                {!isLoading && <ArrowRight size={20} className="ml-2" />}
                              </button>
                            </form>
                          )}
                          
                          {activeTab === 'otp' && (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                              <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full flex items-center justify-center">
                                  <Award size={24} className="text-yellow-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Verify Your Email</h2>
                                <p className="text-slate-300">
                                  We've sent a verification code to{' '}
                                  <span className="text-yellow-400 font-medium">{currentEmail}</span>
                                </p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-4 text-center">Enter Verification Code</label>
                                <OTPInput
                                  length={6}
                                  value={otpValue}
                                  onComplete={handleOtpComplete}
                                  disabled={isLoading}
                                  className="justify-center"
                                />
                              </div>
                              
                              <div className="text-center">
                                <button 
                                  type="button" 
                                  className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                                    resendTimer > 0 || isLoading
                                      ? 'bg-white/10 text-slate-500 cursor-not-allowed' 
                                      : 'bg-white/20 text-white hover:bg-yellow-400/20 hover:scale-105'
                                  }`}
                                  disabled={resendTimer > 0 || isLoading}
                                  onClick={handleResendOtp}
                                >
                                  {isLoading ? 'Sending...' : 'Resend Code'}
                                </button>
                                
                                {resendTimer > 0 && (
                                  <p className="mt-2 text-sm text-slate-400">
                                    Resend in: <span className="text-yellow-400 font-medium">{resendTimer}</span>s
                                  </p>
                                )}
                              </div>
                              
                              <button 
                                type="submit" 
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center"
                              >
                                {isLoading ? 'Verifying...' : 'Verify & Continue'}
                                {!isLoading && <ArrowRight size={20} className="ml-2" />}
                              </button>
                              
                              <button 
                                type="button" 
                                className="w-full text-center text-slate-400 hover:text-white transition-colors duration-300 p-2 rounded-lg hover:bg-white/5"
                                onClick={() => setActiveTab('signup')}
                              >
                                ← Back to Sign Up
                              </button>
                            </form>
                          )}

                          {activeTab === 'login-otp' && (
                            <form onSubmit={handleVerifyLoginOtp} className="space-y-6">
                              <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full flex items-center justify-center">
                                  <Shield size={24} className="text-yellow-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Secure Login</h2>
                                <p className="text-slate-300">
                                  For your security, we've sent a code to{' '}
                                  <span className="text-yellow-400 font-medium">{currentEmail}</span>
                                </p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-4 text-center">Enter Security Code</label>
                                <OTPInput
                                  length={6}
                                  value={otpValue}
                                  onComplete={handleOtpComplete}
                                  disabled={isLoading}
                                  className="justify-center"
                                />
                              </div>
                              
                              <div className="text-center">
                                <button 
                                  type="button" 
                                  className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                                    resendTimer > 0 || isLoading
                                      ? 'bg-white/10 text-slate-500 cursor-not-allowed' 
                                      : 'bg-white/20 text-white hover:bg-yellow-400/20 hover:scale-105'
                                  }`}
                                  disabled={resendTimer > 0 || isLoading}
                                  onClick={handleResendOtp}
                                >
                                  {isLoading ? 'Sending...' : 'Resend Code'}
                                </button>
                                
                                {resendTimer > 0 && (
                                  <p className="mt-2 text-sm text-slate-400">
                                    Resend in: <span className="text-yellow-400 font-medium">{resendTimer}</span>s
                                  </p>
                                )}
                              </div>
                              
                              <button 
                                type="submit" 
                                disabled={isLoading}
                                className="btn-primary w-full flex items-center justify-center"
                              >
                                {isLoading ? 'Verifying...' : 'Complete Login'}
                                {!isLoading && <ArrowRight size={20} className="ml-2" />}
                              </button>
                              
                              <button 
                                type="button" 
                                className="w-full text-center text-slate-400 hover:text-white transition-colors duration-300 p-2 rounded-lg hover:bg-white/5"
                                onClick={() => {
                                  setActiveTab('login');
                                  setOtpValue('');
                                }}
                              >
                                ← Back to Sign In
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        
        {/* Footer */}
        <footer className="relative z-20 py-8 border-t border-white/10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center text-slate-900 font-bold text-sm">
                  GA
                </div>
                <span className="text-slate-400 text-sm">© 2024 Golden Arrow Capital. All rights reserved.</span>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors duration-300 text-sm">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors duration-300 text-sm">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-yellow-400 transition-colors duration-300 text-sm">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
