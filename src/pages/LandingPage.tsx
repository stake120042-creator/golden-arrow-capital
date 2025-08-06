import React, { useState, useEffect } from 'react';
import logoImage from '../assets/logo.svg';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import userService from '../services/userService';
import { SignupData, LoginData } from '../types/user';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'signup' | 'login' | 'otp' | 'login-otp'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
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
  
  const [loginFormData, setLoginFormData] = useState<LoginData>({
    usernameOrEmail: '',
    password: '',
    rememberMe: false
  });
  
  useEffect(() => {
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

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      
      // Auto-focus next input
      if (value !== '' && index < otpValues.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && otpValues[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };
  
  const handleSignupInputChange = (field: keyof SignupData, value: string) => {
    setSignupFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    
    try {
      const result = await userService.initiateSignup(signupFormData);
      
      if (result.success) {
        setCurrentEmail(signupFormData.email);
        setActiveTab('otp');
        setSuccessMessage(result.message);
        startResendTimer();
        // Reset OTP values
        setOtpValues(['', '', '', '', '', '']);
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
        setOtpValues(['', '', '', '', '', '']);
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
      const otpString = otpValues.join('');
      const result = await userService.verifySignupOTP(currentEmail, otpString);
      
      if (result.success) {
        setSuccessMessage(result.message);
        // Small delay to show success message
        setTimeout(() => {
          onLogin();
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
      const otpString = otpValues.join('');
      const result = await userService.verifyLoginOTP(currentEmail, otpString);
      
      if (result.success) {
        setSuccessMessage(result.message);
        // Small delay to show success message
        setTimeout(() => {
          onLogin();
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
      
      {/* Enhanced animated background elements with golden theme */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/10 blur-3xl -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tl from-yellow-400/15 to-amber-500/8 blur-3xl bottom-20 right-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-amber-400/12 to-yellow-500/6 blur-3xl top-1/2 left-1/3 animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="container mx-auto px-6 py-20 relative z-1">
        <div className="max-w-md mx-auto">
          {/* Logo and Brand */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-amber-500/20 rounded-full blur-xl opacity-75"></div>
                <img 
                  src={logoImage} 
                  alt="Golden Arrow Capital Logo" 
                  className="w-16 h-16 relative z-10 filter brightness-110 contrast-110" 
                  style={{
                    filter: 'brightness(1.2) contrast(1.1) saturate(1.3)'
                  }}
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent mb-2">
              Golden Arrow Capital
            </h1>
            <p className="text-amber-200/80 text-sm font-medium">Premium Wealth Management</p>
          </div>
          
          {/* Error/Success Messages */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
              <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start space-x-3">
              <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-green-300 text-sm">{successMessage}</p>
            </div>
          )}
          
          {/* Auth Form */}
          <div className="auth-container shadow-2xl border border-yellow-400/20 backdrop-blur-xl bg-white/5 hover:bg-white/8 transition-all duration-300 rounded-2xl p-8">
            {activeTab === 'signup' && (
              <>
                <h1 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Open Your FREE Account</h1>
                <form className="space-y-6" onSubmit={handleSignup}>
                  <div className="form-group">
                    <label htmlFor="sponsor" className="text-sm font-medium mb-2 block text-slate-300">Sponsor</label>
                    <input 
                      type="text" 
                      id="sponsor" 
                      value={signupFormData.sponsor}
                      onChange={(e) => handleSignupInputChange('sponsor', e.target.value)}
                      className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300" 
                      placeholder="Enter sponsor username (optional)" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label htmlFor="firstName" className="text-sm font-medium mb-2 block text-slate-300">First Name *</label>
                      <input 
                        type="text" 
                        id="firstName" 
                        value={signupFormData.firstName}
                        onChange={(e) => handleSignupInputChange('firstName', e.target.value)}
                        className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300" 
                        placeholder="Enter your first name" 
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="lastName" className="text-sm font-medium mb-2 block text-slate-300">Last Name *</label>
                      <input 
                        type="text" 
                        id="lastName" 
                        value={signupFormData.lastName}
                        onChange={(e) => handleSignupInputChange('lastName', e.target.value)}
                        className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300" 
                        placeholder="Enter your last name" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="username" className="text-sm font-medium mb-2 block text-slate-300">Username *</label>
                    <input 
                      type="text" 
                      id="username" 
                      value={signupFormData.username}
                      onChange={(e) => handleSignupInputChange('username', e.target.value)}
                      className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300" 
                      placeholder="Choose a username" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="text-sm font-medium mb-2 block text-slate-300">Your Email *</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={signupFormData.email}
                      onChange={(e) => handleSignupInputChange('email', e.target.value)}
                      className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300" 
                      placeholder="Enter your email" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password" className="text-sm font-medium mb-2 block text-slate-300">Password *</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        id="password" 
                        value={signupFormData.password}
                        onChange={(e) => handleSignupInputChange('password', e.target.value)}
                        className="w-full p-4 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300" 
                        placeholder="Create a password" 
                        required 
                      />
                      <button 
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors duration-300 p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="text-sm font-medium mb-2 block text-slate-300">Confirm password *</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        id="confirmPassword" 
                        value={signupFormData.confirmPassword}
                        onChange={(e) => handleSignupInputChange('confirmPassword', e.target.value)}
                        className="w-full p-4 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300" 
                        placeholder="Confirm your password" 
                        required 
                      />
                      <button 
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors duration-300 p-1"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="checkbox-container flex items-start space-x-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 text-yellow-400 focus:ring-yellow-400 focus:ring-2" 
                      required 
                    />
                    <label htmlFor="terms" className="text-sm text-slate-300 leading-relaxed">
                      I have read and accept the
                      <a href="#" className="mx-1 text-yellow-400 hover:text-yellow-300 underline transition-colors duration-300">Terms of Use</a>
                      and
                      <a href="#" className="mx-1 text-yellow-400 hover:text-yellow-300 underline transition-colors duration-300">Privacy Notice</a>
                      and the Risk Disclosure
                    </label>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full p-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-semibold flex items-center justify-center hover:from-yellow-300 hover:to-amber-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? 'Creating Account...' : 'Sign up'}
                    {!isLoading && <ArrowRight size={20} className="ml-2" />}
                  </button>
                  
                  <div className="text-center text-slate-400">
                    Already registered? 
                    <button 
                      type="button"
                      className="ml-1 text-yellow-400 hover:text-yellow-300 underline transition-colors duration-300"
                      onClick={() => setActiveTab('login')}
                    >
                      Click here to login.
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {activeTab === 'login' && (
              <>
                <h1 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Login to Your Account</h1>
                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="form-group">
                    <label htmlFor="loginUsername" className="text-sm font-medium mb-2 block text-slate-300">Username or Email *</label>
                    <input 
                      type="text" 
                      id="loginUsername" 
                      value={loginFormData.usernameOrEmail}
                      onChange={(e) => handleLoginInputChange('usernameOrEmail', e.target.value)}
                      className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300" 
                      placeholder="Enter your username or email" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="loginPassword" className="text-sm font-medium mb-2 block text-slate-300">Password *</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        id="loginPassword" 
                        value={loginFormData.password}
                        onChange={(e) => handleLoginInputChange('password', e.target.value)}
                        className="w-full p-4 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300" 
                        placeholder="Enter your password" 
                        required 
                      />
                      <button 
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors duration-300 p-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="checkbox-container flex items-center space-x-2">
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
                    
                    <a href="#" className="text-yellow-400 hover:text-yellow-300 text-sm underline transition-colors duration-300">
                      Forgot password?
                    </a>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full p-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-semibold flex items-center justify-center hover:from-yellow-300 hover:to-amber-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? 'Verifying...' : 'Login'}
                    {!isLoading && <ArrowRight size={20} className="ml-2" />}
                  </button>
                  
                  <div className="text-center text-slate-400">
                    Don't have an account? 
                    <button 
                      type="button"
                      className="ml-1 text-yellow-400 hover:text-yellow-300 underline transition-colors duration-300"
                      onClick={() => setActiveTab('signup')}
                    >
                      Sign up now
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {activeTab === 'otp' && (
              <>
                <h1 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Verify Your Email</h1>
                <form className="space-y-6" onSubmit={handleVerifyOtp}>
                  <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-slate-300 leading-relaxed">
                      We've sent a verification code to <span className="text-yellow-400 font-medium">{currentEmail}</span>.<br />
                      Please enter it below to complete your registration.
                    </p>
                  </div>
                  
                  <div className="form-group">
                    <label className="text-sm font-medium mb-4 block text-slate-300">Enter OTP *</label>
                    <div className="flex justify-center space-x-3">
                      {otpValues.map((value, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={value}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-14 h-14 text-center text-xl font-bold rounded-xl bg-white/10 border border-white/20 text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
                          required
                        />
                      ))}
                    </div>
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
                      {isLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                    
                    {resendTimer > 0 && (
                      <p className="mt-2 text-sm text-slate-400">
                        Resend OTP in: <span className="text-yellow-400 font-medium">{resendTimer}</span> secs
                      </p>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full p-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-semibold flex items-center justify-center hover:from-yellow-300 hover:to-amber-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                    {!isLoading && <ArrowRight size={20} className="ml-2" />}
                  </button>
                  
                  <button 
                    type="button" 
                    className="mt-4 text-center w-full text-slate-400 hover:text-white transition-colors duration-300 p-2 rounded-lg hover:bg-white/5"
                    onClick={() => setActiveTab('signup')}
                  >
                    Back
                  </button>
                </form>
              </>
            )}

            {activeTab === 'login-otp' && (
              <>
                <h1 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Verify Login</h1>
                <form className="space-y-6" onSubmit={handleVerifyLoginOtp}>
                  <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-slate-300 leading-relaxed">
                      For your security, we've sent a verification code to <span className="text-yellow-400 font-medium">{currentEmail}</span>.<br />
                      Please enter it below to complete your login.
                    </p>
                  </div>
                  
                  <div className="form-group">
                    <label className="text-sm font-medium mb-4 block text-slate-300">Enter OTP *</label>
                    <div className="flex justify-center space-x-3">
                      {otpValues.map((value, index) => (
                        <input
                          key={index}
                          id={`login-otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={value}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-14 h-14 text-center text-xl font-bold rounded-xl bg-white/10 border border-white/20 text-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
                          required
                        />
                      ))}
                    </div>
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
                      {isLoading ? 'Sending...' : 'Resend OTP'}
                    </button>
                    
                    {resendTimer > 0 && (
                      <p className="mt-2 text-sm text-slate-400">
                        Resend OTP in: <span className="text-yellow-400 font-medium">{resendTimer}</span> secs
                      </p>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full p-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-semibold flex items-center justify-center hover:from-yellow-300 hover:to-amber-400 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                    {!isLoading && <ArrowRight size={20} className="ml-2" />}
                  </button>
                  
                  <button 
                    type="button" 
                    className="mt-4 text-center w-full text-slate-400 hover:text-white transition-colors duration-300 p-2 rounded-lg hover:bg-white/5"
                    onClick={() => {
                      setActiveTab('login');
                      setOtpValues(['', '', '', '', '', '']); // Reset OTP values
                    }}
                  >
                    ← Back to Login
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;