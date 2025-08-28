'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronDown, 
  User, 
  Mail, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Circle,
  Star,
  Crown,
  Award,
  Activity,
  ArrowLeft
} from 'lucide-react';

interface TeamMember {
  id: string;
  username: string;
  email: string;
  level: number;
  join_date: string;
  sponsor: string;
  total_investment: number;
  direct_members: number;
  total_team_members: number;
  status: 'active' | 'inactive';
}

const MyTeamPage: React.FC = () => {
  const { logout, user } = useAuth();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'business' | 'members'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const authToken = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null), []);

  useEffect(() => {
    if (authToken) {
      fetchTeamMembers();
    }
  }, [authToken, selectedLevel]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/my-team?level=${selectedLevel}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.data || []);
      } else {
        console.error('Failed to fetch team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedMembers = teamMembers
    .filter(member => 
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.username.toLowerCase();
          bValue = b.username.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.join_date);
          bValue = new Date(b.join_date);
          break;
        case 'business':
          aValue = a.total_investment;
          bValue = b.total_investment;
          break;
        case 'members':
          aValue = a.total_team_members;
          bValue = b.total_team_members;
          break;
        default:
          aValue = a.username.toLowerCase();
          bValue = b.username.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Circle size={12} className="text-green-500 fill-current" />;
      case 'inactive':
        return <Circle size={12} className="text-red-500 fill-current" />;
      default:
        return <Circle size={12} className="text-gray-400 fill-current" />;
    }
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Star size={16} className="text-yellow-500" />;
      case 2:
        return <Award size={16} className="text-purple-500" />;
      case 3:
        return <Crown size={16} className="text-orange-500" />;
      default:
        return <Activity size={16} className="text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleToggleSidebar = () => setShowMobileSidebar((s) => !s);
  const handleCloseSidebar = () => setShowMobileSidebar(false);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Sidebar onLogout={logout} isOpen={showMobileSidebar} onClose={handleCloseSidebar} />
      <div className="ml-0 lg:ml-64 min-h-screen relative z-10">
        <TopBar onLogout={logout} toggleSidebar={handleToggleSidebar} currentPage="my-team" />
        
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

                {/* Content */}
        <div className="relative z-10 pt-24 px-4 md:px-6 pb-12 space-y-8 max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-6 md:mb-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors mb-4 md:mb-6 text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 mr-4">
                  <Users size={20} className="text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 mr-4">
                  <TrendingUp size={20} className="text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamMembers.filter(m => m.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100 mr-4">
                  <TrendingDown size={20} className="text-red-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamMembers.filter(m => m.status === 'inactive').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 mr-4">
                  <Award size={20} className="text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Business</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(teamMembers.reduce((sum, m) => sum + m.total_investment, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Level Selector */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(Number(e.target.value))}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  >
                    <option value={1}>Level 1 (Direct)</option>
                    <option value={2}>Level 2</option>
                    <option value={3}>Level 3</option>
                    <option value={4}>Level 4</option>
                    <option value={5}>Level 5</option>
                  </select>
                </div>

                {/* Search */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Members</label>
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by username or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
              <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                >
                  <option value="name">Sort by Name</option>
                  <option value="date">Sort by Date</option>
                  <option value="business">Sort by Business</option>
                  <option value="members">Sort by Members</option>
              </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Team Members Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading team members...</p>
              </div>
            ) : filteredAndSortedMembers.length === 0 ? (
              <div className="p-8 text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
                <p className="text-gray-600">No members found at level {selectedLevel} with the current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sponser
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Direct Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Join Date
                      </th>
                  </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                <User size={20} className="text-purple-700" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.username}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail size={14} className="mr-1" />
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getLevelIcon(member.level)}
                            <span className="ml-2 text-sm text-gray-900">Level {member.level}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="ml-2 text-sm font-medium">
                              {member.sponsor.charAt(0).toUpperCase() + member.sponsor.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(member.total_investment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.direct_members}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.total_team_members}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(member.join_date)}
                          </div>
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
  );
};

export default MyTeamPage;





