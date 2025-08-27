'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Shield, Award } from 'lucide-react';
import apiClient from '@/services/apiClient';
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
      const result = await apiClient.auth.signup(signupFormData);
      
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
      const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setErrorMessage(message);
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
      const result = await apiClient.auth.login(loginFormData);
      
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
      const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setErrorMessage(message);
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
      const result = await apiClient.auth.verifySignupOTP(currentEmail, otpString);
      
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
      const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setErrorMessage(message);
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
      const result = await apiClient.auth.verifyLoginOTP(currentEmail, otpString);
      
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
      const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setErrorMessage(message);
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
        const result = await apiClient.auth.resendOTP(currentEmail, otpType);
        
        if (result.success) {
          setSuccessMessage(result.message);
          startResendTimer();
        } else {
          setErrorMessage(result.message);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to resend OTP. Please try again.';
        setErrorMessage(message);
        console.error('Resend OTP error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-center">Loading...</p>
          </div>
        </div>
      )}
      
      <div className="min-h-screen flex flex-col">
        {/* Header Section */}
        <header className="bg-white border-b border-gray-200 py-6">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  GA
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Golden Arrow Capital</h1>
                  <p className="text-gray-600 text-sm">Premium Investment Platform</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="w-full max-w-md mx-auto">
            {/* Auth Form */}
            <div className={`${animateIn ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Form Content */}
                <div className="p-8">
                  {/* Error/Success Messages */}
                  {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                      <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                      <p className="text-red-700 text-sm">{errorMessage}</p>
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                      <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                      <p className="text-green-700 text-sm">{successMessage}</p>
                    </div>
                  )}
                  
                  {/* Tab Navigation */}
                  <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('signup')}
                      className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                        activeTab === 'signup'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => setActiveTab('login')}
                      className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                        activeTab === 'login'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sponsor (Optional)</label>
                          <input 
                            type="text" 
                            value={signupFormData.sponsor}
                            onChange={(e) => handleSignupInputChange('sponsor', e.target.value)}
                            onBlur={(e) => handleSignupInputBlur('sponsor', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                              sponsorValidation.isValid === false ? 'border-red-500' :
                              sponsorValidation.isValid === true ? 'border-green-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter sponsor username" 
                          />
                          {sponsorValidation.isValidating && (
                            <div className="mt-2 flex items-center text-blue-600 text-sm">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              Checking sponsor username...
                            </div>
                          )}
                          {sponsorValidation.message && !sponsorValidation.isValidating && (
                            <div className={`mt-2 text-sm ${
                              sponsorValidation.isValid === true ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {sponsorValidation.message}
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                            <input 
                              type="text" 
                              value={signupFormData.firstName}
                              onChange={(e) => handleSignupInputChange('firstName', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                              placeholder="John" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                            <input 
                              type="text" 
                              value={signupFormData.lastName}
                              onChange={(e) => handleSignupInputChange('lastName', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                              placeholder="Doe" 
                              required 
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                          <input 
                            type="text" 
                            value={signupFormData.username}
                            onChange={(e) => handleSignupInputChange('username', e.target.value)}
                            onBlur={(e) => handleSignupInputBlur('username', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                              usernameValidation.isValid === false ? 'border-red-500' :
                              usernameValidation.isValid === true ? 'border-green-500' : 'border-gray-300'
                            }`}
                            placeholder="Choose a username" 
                            required 
                          />
                          {usernameValidation.isValidating && (
                            <div className="mt-2 flex items-center text-blue-600 text-sm">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              Checking username availability...
                            </div>
                          )}
                          {usernameValidation.message && !usernameValidation.isValidating && (
                            <div className={`mt-2 text-sm ${
                              usernameValidation.isValid === true ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {usernameValidation.message}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                          <input 
                            type="email" 
                            value={signupFormData.email}
                            onChange={(e) => handleSignupInputChange('email', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                            placeholder="john@example.com" 
                            required 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              value={signupFormData.password}
                              onChange={(e) => handleSignupInputChange('password', e.target.value)}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                              placeholder="Create a strong password" 
                              required 
                            />
                            <button 
                              type="button"
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                          <div className="relative">
                            <input 
                              type={showConfirmPassword ? "text" : "password"} 
                              value={signupFormData.confirmPassword}
                              onChange={(e) => handleSignupInputChange('confirmPassword', e.target.value)}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                              placeholder="Confirm your password" 
                              required 
                            />
                            <button 
                              type="button"
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                          <input 
                            type="checkbox" 
                            id="terms" 
                            className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2" 
                            required 
                          />
                          <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                            I agree to the{' '}
                            <a href="#" className="text-purple-600 hover:text-purple-700 underline transition-colors duration-300">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="text-purple-600 hover:text-purple-700 underline transition-colors duration-300">Privacy Policy</a>
                          </label>
                        </div>
                        
                        <button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-200 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Creating Account...' : 'Create Account'}
                          {!isLoading && <ArrowRight size={20} className="ml-2" />}
                        </button>
                      </form>
                    )}
                    
                    {activeTab === 'login' && (
                      <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Username or Email *</label>
                          <input 
                            type="text" 
                            value={loginFormData.usernameOrEmail}
                            onChange={(e) => handleLoginInputChange('usernameOrEmail', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                            placeholder="Enter your username or email" 
                            required 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              value={loginFormData.password}
                              onChange={(e) => handleLoginInputChange('password', e.target.value)}
                              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors" 
                              placeholder="Enter your password" 
                              required 
                            />
                            <button 
                              type="button"
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
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
                              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2" 
                            />
                            <label htmlFor="rememberMe" className="text-sm text-gray-700">
                              Remember me
                            </label>
                          </div>                      
                        </div>
                        
                        <button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-200 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Signing In...' : 'Sign In'}
                          {!isLoading && <ArrowRight size={20} className="ml-2" />}
                        </button>
                      </form>
                    )}
                    
                    {activeTab === 'otp' && (
                      <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award size={24} className="text-purple-600" />
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                          <p className="text-gray-600">
                            We've sent a verification code to{' '}
                            <span className="text-purple-600 font-medium">{currentEmail}</span>
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Enter Verification Code</label>
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
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                            }`}
                            disabled={resendTimer > 0 || isLoading}
                            onClick={handleResendOtp}
                          >
                            {isLoading ? 'Sending...' : 'Resend Code'}
                          </button>
                          
                          {resendTimer > 0 && (
                            <p className="mt-2 text-sm text-gray-500">
                              Resend in: <span className="text-purple-600 font-medium">{resendTimer}</span>s
                            </p>
                          )}
                        </div>
                        
                        <button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-200 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Verifying...' : 'Verify & Continue'}
                          {!isLoading && <ArrowRight size={18} className="ml-2" />}
                        </button>
                        
                        <button 
                          type="button" 
                          className="w-full text-center text-gray-600 hover:text-gray-800 transition-colors duration-300 p-3 rounded-lg hover:bg-gray-50"
                          onClick={() => setActiveTab('signup')}
                        >
                          ← Back to Sign Up
                        </button>
                      </form>
                    )}

                    {activeTab === 'login-otp' && (
                      <form onSubmit={handleVerifyLoginOtp} className="space-y-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield size={24} className="text-purple-600" />
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 mb-2">Secure Login</h2>
                          <p className="text-gray-600">
                            For your security, we've sent a code to{' '}
                            <span className="text-purple-600 font-medium">{currentEmail}</span>
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Enter Security Code</label>
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
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                            }`}
                            disabled={resendTimer > 0 || isLoading}
                            onClick={handleResendOtp}
                          >
                            {isLoading ? 'Sending...' : 'Resend Code'}
                          </button>
                          
                          {resendTimer > 0 && (
                            <p className="mt-2 text-sm text-gray-500">
                              Resend in: <span className="text-purple-600 font-medium">{resendTimer}</span>s
                            </p>
                          )}
                        </div>
                        
                        <button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-200 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Verifying...' : 'Complete Login'}
                          {!isLoading && <ArrowRight size={18} className="ml-2" />}
                        </button>
                        
                        <button 
                          type="button" 
                          className="w-full text-center text-gray-600 hover:text-gray-800 transition-colors duration-300 p-3 rounded-lg hover:bg-gray-50"
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
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 py-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  GA
                </div>
                <span className="text-gray-600 text-sm">© 2024 Golden Arrow Capital. All rights reserved.</span>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-300 text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-300 text-sm">Terms of Service</a>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-300 text-sm">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
