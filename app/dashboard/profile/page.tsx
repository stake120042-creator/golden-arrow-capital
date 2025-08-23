'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import OTPInput from '@/components/OTPInput';
import { apiClient } from '@/services/apiClient';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  Clock,
  Star,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';

export default function ProfilePage() {
  const { logout, user, updateUser } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [editedUser, setEditedUser] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || ''
  });

  // Username validation state
  const [usernameValidation, setUsernameValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    message: string;
  }>({ isValidating: false, isValid: null, message: '' });

  const handleSave = async () => {
    setIsLoading(true);
    setOtpError('');
    setOtpMessage('');
    
    // Check if username has changed and validate it
    if (editedUser.username !== user?.username) {
      if (usernameValidation.isValid !== true) {
        setOtpError('Please fix username validation errors before saving');
        setIsLoading(false);
        return;
      }
    }
    
    // Only include fields that have changed
    const changedFields: any = {};
    if (editedUser.firstName !== user?.firstName) changedFields.firstName = editedUser.firstName;
    if (editedUser.lastName !== user?.lastName) changedFields.lastName = editedUser.lastName;
    if (editedUser.email !== user?.email) changedFields.email = editedUser.email;
    if (editedUser.username !== user?.username) changedFields.username = editedUser.username;
    
    // Check if any fields have changed
    if (Object.keys(changedFields).length === 0) {
      setOtpError('No changes detected. Please make changes before saving.');
      setIsLoading(false);
      return;
    }
    
    try {
      // Request OTP for profile update with only changed fields
      const response = await apiClient.user.requestProfileUpdateOTP(changedFields);
      
      if (response.success) {
        setOtpMessage('OTP sent to your email. Please check your inbox.');
        setShowOTPModal(true);
      } else {
        setOtpError(response.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    // Populate form with current user data
    setEditedUser({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      username: user?.username || ''
    });
    setIsEditing(true);
    setOtpError('');
    setOtpMessage('');
    setUsernameValidation({ isValidating: false, isValid: null, message: '' });
  };

  const handleCancel = () => {
    setEditedUser({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      username: user?.username || ''
    });
    setIsEditing(false);
    setOtpError('');
    setOtpMessage('');
    setUsernameValidation({ isValidating: false, isValid: null, message: '' });
  };

  // Validate username availability
  const validateUsername = useCallback(async (username: string) => {
    if (!username.trim()) {
      setUsernameValidation({ isValidating: false, isValid: null, message: '' });
      return;
    }

    // Don't validate if username hasn't changed
    if (username === user?.username) {
      setUsernameValidation({ isValidating: false, isValid: true, message: 'Current username' });
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
  }, [user?.username]);

  // Update editedUser when user data changes
  useEffect(() => {
    if (user) {
      setEditedUser({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || ''
      });
    }
  }, [user]);

  // Debounced username validation
  useEffect(() => {
    if (isEditing && editedUser.username !== user?.username) {
      const timeoutId = setTimeout(() => {
        validateUsername(editedUser.username);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [editedUser.username, isEditing, user?.username, validateUsername]);

  const handleOTPComplete = async (otp: string) => {
    setIsLoading(true);
    setOtpError('');
    
    // Only include fields that have changed
    const changedFields: any = {};
    if (editedUser.firstName !== user?.firstName) changedFields.firstName = editedUser.firstName;
    if (editedUser.lastName !== user?.lastName) changedFields.lastName = editedUser.lastName;
    if (editedUser.email !== user?.email) changedFields.email = editedUser.email;
    if (editedUser.username !== user?.username) changedFields.username = editedUser.username;
    
    try {
      // Update profile with OTP verification
      const response = await apiClient.user.updateProfile({
        ...changedFields,
        otp
      });
      
      if (response.success) {
        // Update local user data with only changed fields
        const updatedUser = {
          ...user,
          ...changedFields
        };
        updateUser(updatedUser);
        
        setShowOTPModal(false);
        setIsEditing(false);
        setOtpMessage('Profile updated successfully!');
        setTimeout(() => setOtpMessage(''), 3000);
      } else {
        setOtpError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setOtpError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setOtpError('');
    
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          email: user?.email,
          type: 'profile_update',
          firstName: user?.firstName
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOtpMessage('OTP resent successfully. Please check your email.');
        setTimeout(() => setOtpMessage(''), 3000);
      } else {
        setOtpError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setOtpError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const handleCloseSidebar = () => {
    setShowMobileSidebar(false);
  };

  const handleLogout = () => {
    logout();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Subtle gradient orbs */}
          <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-500/5 to-indigo-600/3 blur-3xl -top-40 -left-40 animate-float"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-indigo-500/4 to-purple-600/2 blur-3xl -bottom-40 -right-40 animate-float" style={{animationDelay: '2s'}}></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        onLogout={handleLogout} 
        isOpen={showMobileSidebar}
        onClose={handleCloseSidebar}
      />
      
      {/* Main Content */}
      <div className="ml-0 lg:ml-64 min-h-screen relative z-10">
        {/* Header */}
        <TopBar 
          onLogout={handleLogout} 
          toggleSidebar={handleToggleSidebar}
          currentPage="profile"
        />
        
        {/* Profile Content */}
        <div className="pt-32 px-4 md:px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button and Actions */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <Link 
                    href="/dashboard"
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors mb-4 md:mb-6 text-sm md:text-base"
                  >
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Back to Dashboard
                  </Link>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  {!isEditing ? (
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center justify-center px-4 py-3 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm text-sm sm:text-base font-medium"
                    >
                      <Edit3 size={16} className="mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center justify-center px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                      >
                        {isLoading ? (
                          <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                          <Save size={16} className="mr-2" />
                        )}
                        {isLoading ? 'Sending OTP...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex items-center justify-center px-4 py-3 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                      >
                        <X size={16} className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3">@{user?.username}</p>
                    
                                    <div className="flex items-center justify-center space-x-2 mb-4">
                  {user?.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} className="mr-1" />
                      Verified
                    </span>
                  )}
                </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-center text-sm text-gray-600 mb-2">
                        <Clock size={14} className="mr-2" />
                        Member since {formatDate(user?.createdAt || new Date())}
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Star size={14} className="mr-2" />
                        Active investor
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                  
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                        <User size={16} className="mr-2" />
                        Personal Information
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedUser.firstName}
                              onChange={(e) => setEditedUser({...editedUser, firstName: e.target.value})}
                              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                            />
                          ) : (
                            <div className="px-3 py-3 sm:py-2 bg-gray-50 rounded-lg text-gray-900 text-base">
                              {user?.firstName}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedUser.lastName}
                              onChange={(e) => setEditedUser({...editedUser, lastName: e.target.value})}
                              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                            />
                          ) : (
                            <div className="px-3 py-3 sm:py-2 bg-gray-50 rounded-lg text-gray-900 text-base">
                              {user?.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                        <Mail size={16} className="mr-2" />
                        Contact Information
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editedUser.email}
                              onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                            />
                          ) : (
                            <div className="px-3 py-3 sm:py-2 bg-gray-50 rounded-lg text-gray-900 text-base">
                              {user?.email}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          {isEditing ? (
                            <div>
                              <input
                                type="text"
                                value={editedUser.username}
                                onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                                onBlur={() => validateUsername(editedUser.username)}
                                className={`w-full px-3 py-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base ${
                                  usernameValidation.isValid === false 
                                    ? 'border-red-300 focus:ring-red-500' 
                                    : usernameValidation.isValid === true 
                                    ? 'border-green-300 focus:ring-green-500' 
                                    : 'border-gray-300'
                                }`}
                              />
                              {usernameValidation.isValidating && (
                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                  <Loader2 size={14} className="mr-1 animate-spin" />
                                  Checking username availability...
                                </div>
                              )}
                              {usernameValidation.message && !usernameValidation.isValidating && (
                                <div className={`flex items-center mt-1 text-sm ${
                                  usernameValidation.isValid ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {usernameValidation.isValid ? (
                                    <CheckCircle size={14} className="mr-1" />
                                  ) : (
                                    <AlertCircle size={14} className="mr-1" />
                                  )}
                                  {usernameValidation.message}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="px-3 py-3 sm:py-2 bg-gray-50 rounded-lg text-gray-900 text-base">
                              @{user?.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                        <Shield size={16} className="mr-2" />
                        Account Information
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Status
                          </label>
                          <div className="px-3 py-3 sm:py-2 bg-green-50 rounded-lg">
                            <span className="inline-flex items-center text-sm text-green-700">
                              <CheckCircle size={14} className="mr-2" />
                              Active
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Member Since
                          </label>
                          <div className="px-3 py-3 sm:py-2 bg-gray-50 rounded-lg text-gray-900 text-base">
                            {formatDate(user?.createdAt || new Date())}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Referral Information */}
                    {user?.sponsor && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                          <User size={16} className="mr-2" />
                          Referral Information
                        </h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Referred By
                          </label>
                          <div className="px-3 py-3 sm:py-2 bg-gray-50 rounded-lg text-gray-900 text-base">
                            @{user.sponsor}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {(otpError || otpMessage) && (
          <div className="fixed top-24 right-4 z-50 max-w-sm">
            {otpError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2 shadow-lg">
                <div className="flex items-center">
                  <AlertCircle size={16} className="text-red-600 mr-2" />
                  <p className="text-red-800 text-sm">{otpError}</p>
                </div>
              </div>
            )}
            {otpMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-2 shadow-lg">
                <div className="flex items-center">
                  <CheckCircle size={16} className="text-green-600 mr-2" />
                  <p className="text-green-800 text-sm">{otpMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OTP Verification Modal */}
        {showOTPModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Identity</h3>
                <p className="text-gray-600 text-sm">
                  We've sent a verification code to your email address. Please enter it below to save your profile changes.
                </p>
              </div>

              <div className="mb-6">
                <OTPInput
                  onComplete={handleOTPComplete}
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Resend OTP'}
                </button>
                
                <button
                  onClick={() => {
                    setShowOTPModal(false);
                    setOtpError('');
                    setOtpMessage('');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
