'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Globe, Phone, MapPin, User, Mail, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/contexts/AuthContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export interface OrganizationFormData {
  organizationName: string;
  website: string;
  phoneNumber: string;
  address: string;
  representativeName: string;
  businessEmail: string;
  monthlyBudget: string;
  currency: string;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { session } = useAuth();
  const [formData, setFormData] = useState<OrganizationFormData>({
    organizationName: '',
    website: '',
    phoneNumber: '',
    address: '',
    representativeName: '',
    businessEmail: '',
    monthlyBudget: '100000',
    currency: 'NGN'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.organizationName.trim()) {
        throw new Error('Organization name is required');
      }
      if (!formData.phoneNumber.trim()) {
        throw new Error('Phone number is required');
      }
      if (!formData.address.trim()) {
        throw new Error('Address is required');
      }
      if (!formData.representativeName.trim()) {
        throw new Error('Representative name is required');
      }
      if (!formData.businessEmail.trim()) {
        throw new Error('Business email is required');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.businessEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Website validation (optional, but if provided should be valid)
      if (formData.website && formData.website.trim()) {
        const website = formData.website.trim();
        // Add https:// if no protocol is provided
        if (!website.startsWith('http://') && !website.startsWith('https://')) {
          formData.website = 'https://' + website;
        }

        // Basic URL validation
        try {
          new URL(formData.website);
        } catch {
          throw new Error('Please enter a valid website URL');
        }
      }

      // Budget validation
      if (!formData.monthlyBudget || parseFloat(formData.monthlyBudget) <= 0) {
        throw new Error('Please enter a valid budget amount');
      }

      // Check if we have a session
      if (!session?.access_token) {
        throw new Error('Please log in to complete onboarding');
      }

      console.log('Submitting profile with session token');

      const response = await fetch('/api/expensa/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          monthlyBudget: parseFloat(formData.monthlyBudget)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save organization profile');
      }

      const result = await response.json();
      console.log('Profile created successfully:', result);

      toast.success('Welcome to Expensa! Your profile has been set up.');
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
          {/* Modal - Cannot be closed without completing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-700 shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-nex-yellow/10 to-transparent">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-nex-yellow rounded-lg">
                  <Building2 className="w-6 h-6 text-nex-navy" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Welcome to Expensa!</h2>
                  <p className="text-sm text-gray-400">Let's set up your organization profile</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-160px)] sm:max-h-[calc(90vh-180px)]">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Organization Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>Organization Name *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                    placeholder="e.g., NeX Consulting Ltd"
                  />
                </div>

                {/* Website and Phone Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>Website (Optional)</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      autoComplete="url"
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                      placeholder="example.com or https://example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">We'll add https:// if needed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Phone Number *</span>
                      </div>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Business Address *</span>
                    </div>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent resize-none"
                    placeholder="Full business address"
                  />
                </div>

                {/* Representative and Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Representative Name *</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      name="representativeName"
                      value={formData.representativeName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Business Email *</span>
                      </div>
                    </label>
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>

                {/* Budget Settings */}
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-nex-yellow" />
                    <span>Budget Settings</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Monthly Budget *
                      </label>
                      <input
                        type="number"
                        name="monthlyBudget"
                        value={formData.monthlyBudget}
                        onChange={handleChange}
                        required
                        min="0"
                        step="1000"
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                        placeholder="100000"
                      />
                      <p className="text-xs text-gray-500 mt-1">You can change this anytime</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                      >
                        <option value="NGN">NGN (₦)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end mt-6 pt-6 border-t border-gray-700/50">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
