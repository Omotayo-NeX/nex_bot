'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Link2,
  Copy,
  QrCode,
  Mail,
  MessageSquare,
  RefreshCw,
  Ban,
  Trash2,
  Eye,
  Calendar,
  User,
  Folder,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Share2,
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface FieldLink {
  id: string;
  workerName: string;
  workerEmail?: string;
  workerPhone?: string;
  projectName?: string;
  inviteToken: string;
  expiresAt: string;
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
  createdAt: string;
  _count?: {
    expenses: number;
  };
}

export default function FieldLinksPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [fieldLinks, setFieldLinks] = useState<FieldLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<FieldLink | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user && session && !hasFetchedRef.current) {
      fetchFieldLinks();
      hasFetchedRef.current = true;
    }
  }, [user, session, loading, router]);

  const fetchFieldLinks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/expensa/field-links', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch field links');

      const data = await response.json();
      setFieldLinks(data.fieldLinks || []);
    } catch (error: any) {
      console.error('Failed to fetch field links:', error);
      toast.error('Failed to load field links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLink = async (formData: any) => {
    try {
      const response = await fetch('/api/expensa/field-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create field link');
      }

      const data = await response.json();
      toast.success('Field link created successfully!');
      setFieldLinks(prev => [data.fieldLink, ...prev]);
      setShowCreateModal(false);
      setSelectedLink(data.fieldLink);
      setShowShareModal(true);
    } catch (error: any) {
      console.error('Failed to create field link:', error);
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (linkId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/expensa/field-links/${linkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to update field link');

      toast.success(currentStatus ? 'Link deactivated' : 'Link activated');
      fetchFieldLinks();
    } catch (error: any) {
      console.error('Failed to toggle link:', error);
      toast.error('Failed to update link');
    }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this field link?')) return;

    try {
      const response = await fetch(`/api/expensa/field-links/${linkId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete field link');

      toast.success('Field link deleted');
      fetchFieldLinks();
    } catch (error: any) {
      console.error('Failed to delete field link:', error);
      toast.error('Failed to delete link');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const generateLinkUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/expensa/submit/${token}`;
  };

  const shareViaWhatsApp = (link: FieldLink) => {
    const url = generateLinkUrl(link.inviteToken);
    const message = `Hi ${link.workerName},\n\nPlease use this link to submit your expenses${link.projectName ? ` for ${link.projectName}` : ''}:\n\n${url}\n\nThis link expires on ${new Date(link.expiresAt).toLocaleDateString()}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();
  const isMaxedOut = (link: FieldLink) => link.maxUses ? link.currentUses >= link.maxUses : false;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nex-yellow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <button
              onClick={() => router.push('/expensa')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">🔗 Field Links</h1>
              <p className="text-gray-400">Manage secure links for field workers</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Field Link</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Links</p>
              <Link2 className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{fieldLinks.length}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Active</p>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {fieldLinks.filter(l => l.isActive && !isExpired(l.expiresAt)).length}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Expired</p>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {fieldLinks.filter(l => isExpired(l.expiresAt)).length}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Submissions</p>
              <Send className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {fieldLinks.reduce((sum, l) => sum + (l._count?.expenses || 0), 0)}
            </p>
          </div>
        </div>

        {/* Field Links Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
          {fieldLinks.length === 0 ? (
            <div className="p-12 text-center">
              <Link2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Field Links Yet</h3>
              <p className="text-gray-400 mb-6">Create your first field link to start collecting expenses from field workers.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors"
              >
                Create Field Link
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Worker</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Submissions</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {fieldLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedLink(link);
                            setShowReviewModal(true);
                          }}
                          className="flex items-center space-x-3 text-left w-full hover:opacity-80 transition-opacity"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{link.workerName}</p>
                            {link.workerEmail && (
                              <p className="text-gray-400 text-sm">{link.workerEmail}</p>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {link.projectName ? (
                          <div className="flex items-center space-x-2">
                            <Folder className="w-4 h-4 text-yellow-400" />
                            <span className="text-white">{link.projectName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">No project</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {link.isActive && !isExpired(link.expiresAt) && !isMaxedOut(link) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/50">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : isExpired(link.expiresAt) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                            <Clock className="w-3 h-3 mr-1" />
                            Expired
                          </span>
                        ) : isMaxedOut(link) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/50">
                            <Ban className="w-3 h-3 mr-1" />
                            Max Uses
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/50">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">
                          <span className="font-semibold">{link.currentUses}</span>
                          {link.maxUses && <span className="text-gray-400"> / {link.maxUses}</span>}
                        </div>
                        <p className="text-gray-400 text-xs">{link._count?.expenses || 0} expenses</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white text-sm">
                          {new Date(link.expiresAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(link.expiresAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedLink(link);
                              setShowShareModal(true);
                            }}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-blue-400 hover:text-blue-300"
                            title="Share link"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(generateLinkUrl(link.inviteToken), 'Link')}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                            title="Copy link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(link.id, link.isActive)}
                            className={`p-2 hover:bg-gray-700 rounded-lg transition-colors ${link.isActive ? 'text-yellow-400' : 'text-green-400'}`}
                            title={link.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-400 hover:text-red-300"
                            title="Delete link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateFieldLinkModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateLink}
          />
        )}

        {/* Share Modal */}
        {showShareModal && selectedLink && (
          <ShareLinkModal
            link={selectedLink}
            linkUrl={generateLinkUrl(selectedLink.inviteToken)}
            onClose={() => {
              setShowShareModal(false);
              setSelectedLink(null);
            }}
            onCopy={copyToClipboard}
            onWhatsApp={shareViaWhatsApp}
          />
        )}

        {/* Review Worker Expenses Modal */}
        {showReviewModal && selectedLink && (
          <WorkerExpenseReviewModal
            link={selectedLink}
            session={session}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedLink(null);
            }}
            onExpenseUpdated={fetchFieldLinks}
          />
        )}
      </div>
    </div>
  );
}

// Create Field Link Modal Component
function CreateFieldLinkModal({
  onClose,
  onCreate
}: {
  onClose: () => void;
  onCreate: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    workerName: '',
    workerEmail: '',
    workerPhone: '',
    projectName: '',
    expiryDays: '30',
    maxUses: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      expiryDays: parseInt(formData.expiryDays),
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Create Field Link</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Worker Name *
            </label>
            <input
              type="text"
              value={formData.workerName}
              onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-nex-yellow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Worker Email (Optional)
            </label>
            <input
              type="email"
              value={formData.workerEmail}
              onChange={(e) => setFormData({ ...formData, workerEmail: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-nex-yellow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Worker Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.workerPhone}
              onChange={(e) => setFormData({ ...formData, workerPhone: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-nex-yellow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name (Optional)
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-nex-yellow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiry (Days) *
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.expiryDays}
              onChange={(e) => setFormData({ ...formData, expiryDays: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-nex-yellow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Uses (Optional)
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-nex-yellow"
              placeholder="Unlimited"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors"
            >
              Create Link
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Share Link Modal Component
function ShareLinkModal({
  link,
  linkUrl,
  onClose,
  onCopy,
  onWhatsApp
}: {
  link: FieldLink;
  linkUrl: string;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
  onWhatsApp: (link: FieldLink) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-lg w-full"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Share Field Link</h2>

        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <p className="text-gray-400 text-sm mb-2">Link for {link.workerName}</p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={linkUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white text-sm"
            />
            <button
              onClick={() => onCopy(linkUrl, 'Link')}
              className="px-4 py-2 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => onWhatsApp(link)}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-5 h-5" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => onCopy(linkUrl, 'Link')}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Link2 className="w-5 h-5" />
            <span>Copy Link</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}

// Worker Expense Review Modal Component
function WorkerExpenseReviewModal({
  link,
  session,
  onClose,
  onExpenseUpdated
}: {
  link: FieldLink;
  session: any;
  onClose: () => void;
  onExpenseUpdated: () => void;
}) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const fetchExpenses = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/expensa/field-links/${link.id}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch expenses');

      const data = await response.json();
      setExpenses(data.fieldLink.expenses || []);
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  }, [link.id, session?.access_token]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleAIScan = async (expense: any) => {
    if (!expense.receiptUrl) {
      toast.error('No receipt available to scan');
      return;
    }

    setIsScanning(true);
    setSelectedExpense(expense);

    try {
      const response = await fetch('/api/expensa/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          expenseId: expense.id,
          receiptUrl: expense.receiptUrl
        })
      });

      if (!response.ok) throw new Error('AI scan failed');

      const data = await response.json();
      toast.success('AI scan completed!');
      fetchExpenses(); // Refresh to show updated data
    } catch (error: any) {
      console.error('AI scan error:', error);
      toast.error('Failed to scan receipt');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApprove = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expensa/${expenseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) throw new Error('Failed to approve');

      toast.success('Expense approved!');
      fetchExpenses();
      onExpenseUpdated();
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error('Failed to approve expense');
    }
  };

  const handleReject = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expensa/${expenseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (!response.ok) throw new Error('Failed to reject');

      toast.success('Expense rejected');
      fetchExpenses();
      onExpenseUpdated();
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error('Failed to reject expense');
    }
  };

  const viewReceipt = (receiptUrl: string) => {
    if (receiptUrl.startsWith('data:')) {
      // Create image element for base64 data
      const w = window.open('');
      if (w) {
        w.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${receiptUrl}" alt="Receipt" />
            </body>
          </html>
        `);
        w.document.close();
      } else {
        toast.error('Please allow popups to view receipt');
      }
    } else {
      window.open(receiptUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{link.workerName}'s Submissions</h2>
            <p className="text-gray-400 text-sm mt-1">
              {link.projectName && `Project: ${link.projectName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nex-yellow"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No expenses submitted yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        ₦{parseFloat(expense.amount).toLocaleString()}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        expense.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                          : expense.status === 'approved'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-red-500/20 text-red-400 border border-red-500/50'
                      }`}>
                        {expense.status}
                      </span>
                      {expense.aiScanned && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/50">
                          AI Scanned {expense.aiConfidence && `${expense.aiConfidence}%`}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{expense.category}</p>
                    {expense.description && (
                      <p className="text-gray-300 text-sm mt-1">{expense.description}</p>
                    )}
                    {expense.location && (
                      <p className="text-gray-500 text-xs mt-1">📍 {expense.location}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(expense.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {expense.receiptUrl && (
                    <>
                      <button
                        onClick={() => viewReceipt(expense.receiptUrl)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Receipt</span>
                      </button>
                      {!expense.aiScanned && (
                        <button
                          onClick={() => handleAIScan(expense)}
                          disabled={isScanning}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{isScanning && selectedExpense?.id === expense.id ? 'Scanning...' : 'AI Scan'}</span>
                        </button>
                      )}
                    </>
                  )}
                  {expense.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(expense.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(expense.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
