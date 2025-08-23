'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import FileUploadService from '@/services/fileUploadService';
import { 
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle,
  FileText,
  MessageSquare,
  User,
  Mail,
  Tag,
  AlertTriangle,
  Upload,
  X
} from 'lucide-react';

export default function RaiseTicketPage() {
  const { logout, user } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    description: '',
    attachments: [] as File[]
  });

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const handleToggleSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const handleCloseSidebar = () => {
    setShowMobileSidebar(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const validation = FileUploadService.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setUploadErrors(prev => [...prev, ...errors]);
      setTimeout(() => setUploadErrors([]), 5000); // Clear errors after 5 seconds
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setUploadErrors([]);

    try {
      // Create FormData for file upload
      const submitFormData = new FormData();
      submitFormData.append('subject', formData.subject);
      submitFormData.append('category', formData.category);
      submitFormData.append('description', formData.description);
      submitFormData.append('userId', user?.id || '');
      submitFormData.append('userEmail', user?.email || '');
      submitFormData.append('username', user?.username || '');

      // Add files to FormData
      formData.attachments.forEach(file => {
        submitFormData.append('files', file);
      });

      // Submit ticket to API
      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: submitFormData
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(`Ticket submitted successfully! We will get back to you soon. ${result.attachments > 0 ? `(${result.attachments} file(s) uploaded)` : ''}`);
        setFormData({
          subject: '',
          category: '',
          description: '',
          attachments: []
        });
        setUploadProgress({});
      } else {
        setErrorMessage(result.message || 'Failed to submit ticket. Please try again.');
      }
    } catch (error) {
      console.error('Ticket submission error:', error);
      setErrorMessage('Failed to submit ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={handleCloseSidebar}></div>
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
            <Sidebar onClose={handleCloseSidebar} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar onClose={handleCloseSidebar} onLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <TopBar toggleSidebar={handleToggleSidebar} onLogout={handleLogout} currentPage="support" />

        {/* Page Content */}
        <main className="pt-24 pb-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/dashboard" 
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Dashboard
                  </Link>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="mt-2 text-gray-600">Get help from our support team for any issues or questions you may have.</p>
              </div>
            </div>

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

            {/* Ticket Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <User size={16} className="mr-2" />
                      User Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input 
                          type="text" 
                          value={user?.username || ''} 
                          disabled 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                          type="email" 
                          value={user?.email || ''} 
                          disabled 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center">
                      <FileText size={16} className="mr-2" />
                      Ticket Details
                    </h3>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                      <input 
                        type="text" 
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="technical">Technical Issue</option>
                        <option value="account">Deposit Issue</option>
                        <option value="investment">Investment Related</option>
                        <option value="withdrawal">Withdrawal Issue</option>
                        <option value="refund">Refund Request</option>
                        <option value="general">General Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea 
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                        placeholder="Please provide detailed information about your issue. Include any relevant details, error messages, or steps to reproduce the problem."
                        required
                      />
                    </div>

                    {/* Attachments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                        <input 
                          type="file" 
                          multiple 
                          onChange={handleFileChange}
                          className="hidden" 
                          id="file-upload"
                          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                              <FileText size={24} className="text-purple-600" />
                            </div>
                            <p className="text-sm text-gray-600">
                              <span className="text-purple-600 hover:text-purple-700 font-medium">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, GIF, PDF, DOC up to 10MB each
                            </p>
                          </div>
                        </label>
                      </div>
                      
                                             {/* Upload Errors */}
                       {uploadErrors.length > 0 && (
                         <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                           <div className="flex items-start space-x-2">
                             <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                             <div className="flex-1">
                               <p className="text-sm font-medium text-red-700 mb-1">Upload Errors:</p>
                               <ul className="text-xs text-red-600 space-y-1">
                                 {uploadErrors.map((error, index) => (
                                   <li key={index}>• {error}</li>
                                 ))}
                               </ul>
                             </div>
                           </div>
                         </div>
                       )}

                       {/* File List */}
                       {formData.attachments.length > 0 && (
                         <div className="mt-4 space-y-2">
                           {formData.attachments.map((file, index) => (
                             <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                               <div className="flex items-center space-x-3">
                                 <FileText size={16} className="text-gray-500" />
                                 <div>
                                   <span className="text-sm text-gray-700">{file.name}</span>
                                   <span className="text-xs text-gray-500 ml-2">({FileUploadService.formatFileSize(file.size)})</span>
                                 </div>
                               </div>
                               <button
                                 type="button"
                                 onClick={() => removeFile(index)}
                                 className="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
                               >
                                 <X size={16} />
                               </button>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:ring-4 focus:ring-purple-200 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={18} className="mr-2" />
                          Submit Ticket
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>


          </div>
        </main>
      </div>
    </div>
  );
}
