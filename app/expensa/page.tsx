'use client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Filter, TrendingUp, ArrowLeft, UserCircle, Link2, DollarSign, CreditCard } from 'lucide-react';
import SummaryCards from './components/SummaryCards';
import ExpenseTable from './components/ExpenseTable';
import AddExpenseModal, { ExpenseFormData } from './components/AddExpenseModal';
import UploadReceiptModal from './components/UploadReceiptModal';
import OnboardingModal from './components/OnboardingModal';
import ProfilePage from './components/ProfilePage';
import PendingExpensesModal from './analytics/components/PendingExpensesModal';
import AddIncomeModal from './components/AddIncomeModal';
import IncomeList from './components/IncomeList';
import { toast } from 'sonner';

interface Expense {
  id: string;
  merchantName: string | null;
  category: string;
  amount: number;
  currency: string;
  description: string | null;
  expenseDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receiptUrl: string | null;
  projectName: string | null;
}

export default function ExpensaPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [extractedData, setExtractedData] = useState<ExpenseFormData | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(100000);
  const [currency, setCurrency] = useState<string>('NGN');
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [incomeRefreshTrigger, setIncomeRefreshTrigger] = useState(0);

  const hasFetchedRef = useRef(false);

  // Redirect if not authenticated (but don't redirect on every render)
  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting...');
      router.push('/');
    }
  }, [user, loading, router]);

  // Check for onboarding and fetch expenses - only once on mount
  useEffect(() => {
    if (user && session && !hasFetchedRef.current) {
      checkOnboarding();
      fetchExpenses();
      hasFetchedRef.current = true;
    }
  }, [user, session]);

  const checkOnboarding = async () => {
    try {
      const response = await fetch('/api/expensa/profile', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Onboarding check result:', data);

        if (data.needsOnboarding) {
          // Only show onboarding if not already shown/completed in this session
          const onboardingCompleted = localStorage.getItem('expensa_onboarding_completed');
          if (!onboardingCompleted) {
            setNeedsOnboarding(true);
            setShowOnboarding(true);
          }
        } else if (data.profile) {
          // Profile exists, don't show onboarding
          setNeedsOnboarding(false);
          setShowOnboarding(false);
          // Mark as completed in localStorage
          localStorage.setItem('expensa_onboarding_completed', 'true');
          // Set budget and currency from profile
          setMonthlyBudget(parseFloat(data.profile.monthlyBudget) || 100000);
          setCurrency(data.profile.currency || 'NGN');
          console.log('Budget loaded:', data.profile.monthlyBudget, data.profile.currency);
        }
      }
    } catch (error: any) {
      console.error('Failed to check onboarding:', error);
    }
  };

  const fetchExpenses = async () => {
    if (!session) {
      console.log('No session available, skipping expense fetch');
      setIsLoadingExpenses(false);
      return;
    }

    setIsLoadingExpenses(true);
    try {
      const response = await fetch('/api/expensa', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Fetch expenses failed:', errorData);
        throw new Error(errorData.error || 'Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error.message);
      // Only show error toast if user is authenticated
      if (session) {
        toast.error('Failed to load expenses');
      }
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const handleAddExpense = async (formData: ExpenseFormData) => {
    try {
      const response = await fetch('/api/expensa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add expense');
      }

      const newExpense = await response.json();
      setExpenses(prev => [newExpense, ...prev]);
      toast.success('Expense added successfully!');
      setExtractedData(null);
    } catch (error: any) {
      console.error('Failed to add expense:', error);
      toast.error(error.message);
      throw error;
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`/api/expensa/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete expense');

      setExpenses(prev => prev.filter(exp => exp.id !== id));
      toast.success('Expense deleted');
    } catch (error: any) {
      console.error('Failed to delete expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const handleViewReceipt = (receiptUrl: string | null) => {
    if (!receiptUrl) {
      toast.error('No receipt available for this expense');
      return;
    }

    // Handle base64 data URIs (fallback when storage fails)
    if (receiptUrl.startsWith('data:')) {
      // Open base64 image in new tab
      const image = new Image();
      image.src = receiptUrl;
      const w = window.open('');
      if (w) {
        w.document.write(image.outerHTML);
        w.document.close();
      } else {
        toast.error('Please allow popups to view receipt');
      }
      return;
    }

    // Check if it's a valid URL
    try {
      const url = new URL(receiptUrl);
      window.open(receiptUrl, '_blank');
    } catch (error) {
      toast.error('Invalid receipt URL');
      console.error('Invalid receipt URL:', receiptUrl);
    }
  };

  const handleExtractedData = (data: ExpenseFormData) => {
    console.log('📥 Received extracted data in parent:', data);
    setExtractedData(data);
    console.log('🔄 Opening Add Expense modal with extracted data');
    setShowUploadModal(false);
    setShowAddModal(true);
  };

  const handleOnboardingComplete = () => {
    console.log('Onboarding completed, hiding modal');
    setShowOnboarding(false);
    setNeedsOnboarding(false);
    // Mark as completed in localStorage
    localStorage.setItem('expensa_onboarding_completed', 'true');
    // Refresh the page to load the expense data properly
    window.location.reload();
  };

  const handleApprove = async (id: string) => {
    // Refresh expenses after approval
    await fetchExpenses();
  };

  const handleReject = async (id: string) => {
    // Refresh expenses after rejection
    await fetchExpenses();
  };

  // Calculate summary stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.expenseDate);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  const totalExpenses = monthlyExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount.toString()),
    0
  );

  const pendingApproval = expenses.filter(exp => exp.status === 'pending').length;

  const approvedThisMonth = monthlyExpenses
    .filter(exp => exp.status === 'approved' || exp.status === 'reimbursed')
    .reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);

  const budgetRemaining = monthlyBudget - totalExpenses;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-nex-yellow border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading Expensa...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26]">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        {/* Header with Back Button */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              onClick={() => router.push('/chat')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white flex-shrink-0"
              title="Back to Chat"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">💰 Expensa</h1>
              <p className="text-sm md:text-base text-gray-400 hidden sm:block">Smart expense tracking for your business</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`px-3 py-2 md:px-4 md:py-2 ${showProfile ? 'bg-nex-yellow text-nex-navy' : 'bg-gray-800 hover:bg-gray-700 text-white'} rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap text-sm md:text-base flex-shrink-0`}
            >
              <UserCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              onClick={() => router.push('/expensa/field-links')}
              className="px-3 py-2 md:px-4 md:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap text-sm md:text-base flex-shrink-0"
            >
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Field Links</span>
              <span className="sm:hidden">Links</span>
            </button>
            <button
              onClick={() => router.push('/expensa/analytics')}
              className="px-3 py-2 md:px-4 md:py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap text-sm md:text-base flex-shrink-0"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Analytics</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3 py-2 md:px-4 md:py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap text-sm md:text-base flex-shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Receipt</span>
              <span className="sm:hidden">Upload</span>
            </button>
            <button
              onClick={() => {
                setEditingExpense(null);
                setExtractedData(null);
                setShowAddModal(true);
              }}
              className="px-3 py-2 md:px-4 md:py-2 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap text-sm md:text-base flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Profile Section */}
        {showProfile ? (
          <ProfilePage
            onRequestOnboarding={() => {
              setShowOnboarding(true);
              setShowProfile(false); // Optionally close profile view when opening onboarding
            }}
          />
        ) : (
          <>
            {/* Tabs - Expenses vs Income */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 bg-gray-800/30 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                    activeTab === 'expenses'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="font-medium">Expenses</span>
                </button>
                <button
                  onClick={() => setActiveTab('income')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                    activeTab === 'income'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">Income</span>
                </button>
              </div>
            </div>

            {activeTab === 'expenses' ? (
              <>
                {/* Summary Cards */}
                <SummaryCards
                  totalExpenses={totalExpenses}
                  pendingApproval={pendingApproval}
                  approvedThisMonth={approvedThisMonth}
                  budgetRemaining={budgetRemaining}
                  currency={currency}
                  onPendingClick={() => setShowPendingModal(true)}
                />

                {/* Expense Table */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-white">All Expenses</h2>
                    <div className="flex items-center space-x-1 md:space-x-2 text-gray-400">
                      <Filter className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm">{expenses.length} total</span>
                    </div>
                  </div>

                  {isLoadingExpenses ? (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nex-yellow mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading expenses...</p>
                    </div>
                  ) : (
                    <ExpenseTable
                      expenses={expenses}
                      onEdit={handleEditExpense}
                      onDelete={handleDeleteExpense}
                      onViewReceipt={handleViewReceipt}
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Income Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Income Records</h2>
                    <button
                      onClick={() => setShowAddIncomeModal(true)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Income</span>
                    </button>
                  </div>
                  <IncomeList session={session} refreshTrigger={incomeRefreshTrigger} />
                </div>
              </>
            )}
          </>
        )}

        {/* Onboarding Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
        />

        {/* Pending Expenses Modal */}
        <PendingExpensesModal
          isOpen={showPendingModal}
          onClose={() => setShowPendingModal(false)}
          expenses={expenses}
          onApprove={handleApprove}
          onReject={handleReject}
          session={session}
        />

        {/* Modals */}
        <AddExpenseModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingExpense(null);
            setExtractedData(null);
          }}
          onSubmit={handleAddExpense}
          initialData={extractedData || (editingExpense ? {
            merchantName: editingExpense.merchantName || '',
            category: editingExpense.category,
            amount: editingExpense.amount.toString(),
            currency: editingExpense.currency,
            description: editingExpense.description || '',
            expenseDate: editingExpense.expenseDate.split('T')[0],
            projectName: editingExpense.projectName || ''
          } : null)}
        />

        <UploadReceiptModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onExtracted={handleExtractedData}
        />

        <AddIncomeModal
          isOpen={showAddIncomeModal}
          onClose={() => setShowAddIncomeModal(false)}
          onSuccess={() => {
            setIncomeRefreshTrigger(prev => prev + 1);
            toast.success('Income added successfully!');
          }}
          session={session}
        />
      </div>
    </div>
  );
}
