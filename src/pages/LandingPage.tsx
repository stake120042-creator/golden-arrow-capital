import React, { useState, useEffect } from 'react';
import logoImage from '../assets/logo.svg';
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'signup' | 'login' | 'otp'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mount
    setTimeout(() => {
      setAnimateIn(true);
    }, 100);
  }, []);
  
  useEffect(() => {
    // Reset animation when tab changes
    setAnimateIn(false);
    setTimeout(() => {
      setAnimateIn(true);
    }, 50);
  }, [activeTab]);
  
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
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setActiveTab('otp');
      
      // Start timer for OTP resend
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1500);
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };
  
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };
  
  const handleResendOtp = () => {
    if (resendTimer === 0) {
      setResendTimer(60);
      
      // Start timer again
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Features list for the landing page
  const features = [
    "Earn up to 15% monthly returns",
    "Secure blockchain technology",
    "Instant withdrawals",
    "24/7 customer support",
    "Multi-level referral program",
    "No hidden fees"
  ];

  return (
    <div className="min-h-screen bg-primary-color relative overflow-hidden">
      {isLoading && (
        <div className="loader">
          <div className="spinner"></div>
        </div>
      )}
      
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-96 h-96 rounded-full bg-accent-color/10 blur-3xl -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 rounded-full bg-accent-color/5 blur-3xl bottom-20 right-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute w-64 h-64 rounded-full bg-accent-color/5 blur-3xl top-1/2 left-1/3 animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>
      

      
      <div className="container mx-auto px-4 py-16 relative z-1">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left side - Content */}
          <div className="w-full lg:w-1/2 text-white space-y-8 transition-all duration-700 transform" 
               style={{
                 opacity: animateIn ? 1 : 0,
                 transform: animateIn ? 'translateY(0)' : 'translateY(20px)'
               }}>
            <div className="flex items-center mb-8">
              <img src={logoImage} alt="Logo" className="w-12 h-12 mr-4" />
              <h1 className="text-3xl font-bold">Make Me Millionaire</h1>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              The <span className="text-accent-color">Smartest Way</span> to Grow Your Wealth
            </h2>
            
            <p className="text-lg text-white/80 leading-relaxed">
              Join thousands of investors already building their financial future with our revolutionary platform. 
              Start earning passive income today with our high-yield investment opportunities.
            </p>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="text-accent-color mr-3 flex-shrink-0" size={20} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-accent-color/20 border-2 border-accent-color flex items-center justify-center text-sm font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold">Join 15,000+ investors</p>
                  <p className="text-sm text-white/60">Trusted by users worldwide</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Auth Form */}
          <div className="w-full lg:w-1/2 max-w-md mx-auto transition-all duration-700 transform" 
               style={{
                 opacity: animateIn ? 1 : 0,
                 transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
                 transitionDelay: '200ms'
               }}>
            <div className="auth-container shadow-2xl border border-white/10">
              {activeTab === 'signup' && (
                <>
                  <h1 className="auth-title">Open Your FREE Account</h1>
                  <form className="auth-form" onSubmit={handleSignup}>
                    <div className="form-group">
                      <label htmlFor="sponsor" className="form-label">Sponsor *</label>
                      <input 
                        type="text" 
                        id="sponsor" 
                        className="form-input" 
                        placeholder="Enter sponsor username" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="firstName" className="form-label">First Name *</label>
                        <input 
                          type="text" 
                          id="firstName" 
                          className="form-input" 
                          placeholder="Enter your first name" 
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="lastName" className="form-label">Last Name *</label>
                        <input 
                          type="text" 
                          id="lastName" 
                          className="form-input" 
                          placeholder="Enter your last name" 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="username" className="form-label">Username *</label>
                      <input 
                        type="text" 
                        id="username" 
                        className="form-input" 
                        placeholder="Choose a username" 
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Your Email *</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="form-input" 
                        placeholder="Enter your email" 
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="password" className="form-label">Password *</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          id="password" 
                          className="form-input pr-10" 
                          placeholder="Create a password" 
                          required 
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">Confirm password *</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          id="confirmPassword" 
                          className="form-input pr-10" 
                          placeholder="Confirm your password" 
                          required 
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="checkbox-container">
                      <input 
                        type="checkbox" 
                        id="terms" 
                        className="checkbox-input" 
                        required 
                      />
                      <label htmlFor="terms" className="checkbox-label">
                        I have read and accept the
                        <a href="#" className="auth-link mx-1">Terms of Use</a>
                        and
                        <a href="#" className="auth-link mx-1">Privacy Notice</a>
                        and the Risk Disclosure
                      </label>
                    </div>
                    
                    <button type="submit" className="auth-button flex items-center justify-center">
                      Sign up
                      <ArrowRight size={18} className="ml-2" />
                    </button>
                    
                    <div className="auth-footer">
                      Already registered? 
                      <button 
                        type="button"
                        className="auth-link ml-1"
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
                  <h1 className="auth-title">Login to Your Account</h1>
                  <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                      <label htmlFor="loginUsername" className="form-label">Username or Email *</label>
                      <input 
                        type="text" 
                        id="loginUsername" 
                        className="form-input" 
                        placeholder="Enter your username or email" 
                        required 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="loginPassword" className="form-label">Password *</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          id="loginPassword" 
                          className="form-input pr-10" 
                          placeholder="Enter your password" 
                          required 
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="checkbox-container">
                        <input 
                          type="checkbox" 
                          id="rememberMe" 
                          className="checkbox-input" 
                        />
                        <label htmlFor="rememberMe" className="checkbox-label">
                          Remember me
                        </label>
                      </div>
                      
                      <a href="#" className="auth-link">
                        Forgot password?
                      </a>
                    </div>
                    
                    <button type="submit" className="auth-button flex items-center justify-center">
                      Login
                      <ArrowRight size={18} className="ml-2" />
                    </button>
                    
                    <div className="auth-footer">
                      Don't have an account? 
                      <button 
                        type="button"
                        className="auth-link ml-1"
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
                  <h1 className="auth-title">Verify Your Email</h1>
                  <form className="auth-form" onSubmit={handleVerifyOtp}>
                    <p className="text-center text-white/70 mb-4">
                      We've sent a verification code to your email.
                      Please enter it below to complete your registration.
                    </p>
                    
                    <div className="form-group">
                      <label className="form-label">Enter OTP *</label>
                      <div className="otp-input">
                        {otpValues.map((value, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={value}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            required
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="resend-container">
                      <button 
                        type="button" 
                        className="resend-button"
                        disabled={resendTimer > 0}
                        onClick={handleResendOtp}
                      >
                        Resend OTP
                      </button>
                      
                      {resendTimer > 0 && (
                        <span className="resend-timer">
                          Resend OTP in: {resendTimer} secs
                        </span>
                      )}
                    </div>
                    
                    <button type="submit" className="auth-button flex items-center justify-center">
                      Verify OTP
                      <ArrowRight size={18} className="ml-2" />
                    </button>
                    
                    <button 
                      type="button" 
                      className="mt-4 text-center w-full text-white/70 hover:text-white transition-colors"
                      onClick={() => setActiveTab('signup')}
                    >
                      Back
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 border-t border-white/10 mt-12 relative z-1">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-white/60 text-sm">
                © 2024 Make Me Millionaire. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;