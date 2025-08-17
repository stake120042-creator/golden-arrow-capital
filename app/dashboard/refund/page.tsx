'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import { RefundService } from '@/services/refundService';
import { RefundTicket, RefundTransaction } from '@/types/refund';
import { 
  RotateCcw,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  User,
  MessageSquare,
  Plus,
  Search
} from 'lucide-react';

// Utility function for consistent date formatting
const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

// Fallback dummy data (will be replaced by API calls)
const fallbackEligibleTransactions: RefundTransaction[] = [
  {
    id: 'TXN001',
    amount: 500.00,
    date: '2024-01-15',
    type: 'Investment',
    status: 'Completed',
    description: 'Gold Package Investment',
    userId: 'user123',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'TXN002',
    amount: 1000.00,
    date: '2024-01-10',
    type: 'Investment',
    status: 'Completed',
    description: 'Platinum Package Investment',
    userId: 'user123',
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'TXN003',
    amount: 250.00,
    date: '2024-01-05',
    type: 'Investment',
    status: 'Completed',
    description: 'Silver Package Investment',
    userId: 'user123',
    createdAt: new Date('2024-01-05')
  }
];

const fallbackTickets: RefundTicket[] = [
  {
    id: 'REF001',
    transactionId: 'TXN001',
    amount: 500.00,
    status: 'Pending',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-22',
    reason: 'Change in investment strategy',
    adminResponse: 'Your refund request is under review. We will process it within 3-5 business days.',
    userId: 'user123'
  },
  {
    id: 'REF002',
    transactionId: 'TXN002',
    amount: 1000.00,
    status: 'Approved',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-21',
    reason: 'Personal financial emergency',
    adminResponse: 'Refund approved. Amount will be credited to your deposit wallet within 24 hours.',
    userId: 'user123'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'Approved':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'Rejected':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'Completed':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    default:
      return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pending':
      return <Clock size={16} />;
    case 'Approved':
      return <CheckCircle size={16} />;
    case 'Rejected':
      return <XCircle size={16} />;
    case 'Completed':
      return <CheckCircle size={16} />;
    default:
      return <AlertCircle size={16} />;
  }
};

export default function RefundPage() {
  const { logout, user } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [eligibleTransactions, setEligibleTransactions] = useState<RefundTransaction[]>(fallbackEligibleTransactions);
  const [existingTickets, setExistingTickets] = useState<RefundTicket[]>(fallbackTickets);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const handleToggleSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const handleCloseSidebar = () => {
    setShowMobileSidebar(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction || !refundReason.trim()) {
      alert('Please select a transaction and provide a reason for refund.');
      return;
    }
    
    setLoading(true);
    try {
      const newTicket = await RefundService.createRefundTicket({
        transactionId: selectedTransaction,
        reason: refundReason,
        userId: user?.id || 'user123'
      });
      
      if (newTicket) {
        setExistingTickets(prev => [newTicket, ...prev]);
        setSelectedTransaction('');
        setRefundReason('');
        setShowNewTicketForm(false);
        alert('Refund request submitted successfully! You will receive updates via email.');
      } else {
        alert('Failed to submit refund request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting refund request:', error);
      alert('Failed to submit refund request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount (only on client side)
  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window !== 'undefined') {
      const loadData = async () => {
        try {
          const [transactions, tickets] = await Promise.all([
            RefundService.getEligibleTransactions(),
            RefundService.getUserRefundTickets()
          ]);
          
          if (transactions.length > 0) {
            setEligibleTransactions(transactions);
          }
          
          if (tickets.length > 0) {
            setExistingTickets(tickets);
          }
        } catch (error) {
          console.error('Error loading refund data:', error);
          // Keep using fallback data if API fails
        } finally {
          setInitialLoading(false);
        }
      };

      loadData();
    } else {
      setInitialLoading(false);
    }
  }, []);

  const filteredTickets = existingTickets.filter(ticket =>
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-br from-orange-500/5 to-red-600/3 blur-3xl -top-40 -left-40 animate-float"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-red-500/4 to-pink-600/2 blur-3xl -bottom-40 -right-40 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
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
        />
        
        {/* Page Content */}
        <div className="pt-24 px-4 md:px-6 pb-12 space-y-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <Link 
                href="/dashboard"
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-300" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gradient">Refund Management</h1>
                <p className="text-slate-400 mt-1">Request refunds for eligible investments within 7 days</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowNewTicketForm(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:from-orange-400 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={18} className="mr-2" />
              New Refund Request
            </button>
          </div>

          {/* Refund Policy Info */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-600/5 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400/30 to-red-500/20 border border-orange-400/30">
                <AlertCircle size={24} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-semibold mb-2">Refund Policy</h3>
                <div className="text-slate-300 space-y-2 text-sm">
                  <p>• Refunds are available for investments made within the last 7 days</p>
                  <p>• Admin approval is required for all refund requests</p>
                  <p>• Processing time: 3-5 business days after approval</p>
                  <p>• Refunded amounts will be credited to your deposit wallet</p>
                </div>
              </div>
            </div>
          </div>

          {/* New Refund Request Form */}
          {showNewTicketForm && (
            <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">New Refund Request</h2>
                  <button
                    onClick={() => setShowNewTicketForm(false)}
                    className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                  >
                    <XCircle size={20} className="text-slate-300" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitRefund} className="space-y-6">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Select Transaction
                    </label>
                    <select
                      value={selectedTransaction}
                      onChange={(e) => setSelectedTransaction(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                      required
                    >
                      <option value="">Choose an eligible transaction</option>
                      {eligibleTransactions.map((txn) => (
                        <option key={txn.id} value={txn.id}>
                          {txn.id} - ${txn.amount.toFixed(2)} - {txn.description} ({formatDate(txn.createdAt)})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Reason for Refund
                    </label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-colors resize-none"
                      placeholder="Please provide a detailed reason for your refund request..."
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                                         <button
                       type="submit"
                       disabled={loading || eligibleTransactions.length === 0}
                       className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-400 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {loading ? 'Submitting...' : 'Submit Request'}
                     </button>
                    <button
                      type="button"
                      onClick={() => setShowNewTicketForm(false)}
                      className="flex-1 bg-slate-700/50 text-slate-300 font-semibold py-3 px-6 rounded-lg hover:bg-slate-600/50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Existing Refund Tickets */}
          <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white mb-4 md:mb-0">Your Refund Requests</h2>
                <div className="relative w-full md:w-64">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                  />
                </div>
              </div>
              
                             {initialLoading ? (
                 <div className="text-center py-12">
                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mb-4"></div>
                   <p className="text-slate-400">Loading refund tickets...</p>
                 </div>
               ) : filteredTickets.length === 0 ? (
                 <div className="text-center py-12">
                   <div className="p-4 rounded-full bg-slate-800/50 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                     <FileText size={24} className="text-slate-400" />
                   </div>
                   <h3 className="text-slate-300 text-lg font-medium mb-2">No refund requests found</h3>
                   <p className="text-slate-400">Create your first refund request to get started</p>
                 </div>
               ) : (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-6 hover:border-slate-600/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-400/30 to-red-500/20 border border-orange-400/30">
                            <RotateCcw size={20} className="text-orange-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">Ticket #{ticket.id}</h3>
                            <p className="text-slate-400 text-sm">Transaction: {ticket.transactionId}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-white font-semibold">${ticket.amount.toFixed(2)}</p>
                            <p className="text-slate-400 text-sm">Refund Amount</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-1 ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            <span>{ticket.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Reason</p>
                          <p className="text-white">{ticket.reason}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Created</p>
                          <p className="text-white">{ticket.createdAt}</p>
                        </div>
                      </div>
                      
                      {ticket.adminResponse && (
                        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="p-1.5 rounded-full bg-blue-400/20">
                              <User size={14} className="text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-blue-400 text-sm font-medium mb-1">Admin Response</p>
                              <p className="text-slate-300 text-sm">{ticket.adminResponse}</p>
                              <p className="text-slate-400 text-xs mt-2">Updated: {ticket.updatedAt}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Eligible Transactions Info */}
          <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg shadow-slate-900/20 overflow-hidden">
            <div className="p-6">
                             <h2 className="text-xl font-bold text-white mb-6">Eligible Transactions for Refund</h2>
               
               {initialLoading ? (
                 <div className="text-center py-8">
                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                   <p className="text-slate-400 mt-2">Loading eligible transactions...</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Transaction ID</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Description</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {eligibleTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-white font-mono">{txn.id}</td>
                        <td className="py-3 px-4 text-white">${txn.amount.toFixed(2)}</td>
                                                 <td className="py-3 px-4 text-slate-300">{formatDate(txn.createdAt)}</td>
                        <td className="py-3 px-4 text-slate-300">{txn.description}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400 border border-green-400/20">
                            <CheckCircle size={12} className="mr-1" />
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                                     </tbody>
                 </table>
               </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
