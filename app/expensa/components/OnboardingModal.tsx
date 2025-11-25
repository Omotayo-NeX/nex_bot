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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-nex-navy/95 via-nex-navy/90 to-nex-purple/80 backdrop-blur-md">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-nex-purple/30 via-nex-purple/10 to-transparent blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-nex-gradient-start/30 via-nex-gradient-end/10 to-transparent blur-3xl"
            />
          </div>

          {/* Modal - Cannot be closed without completing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gradient-to-br from-white via-white to-gray-50 rounded-xl sm:rounded-2xl border border-nex-purple/20 shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
          >
            {/* Decorative Top Border Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-nex-gradient-start via-nex-purple to-nex-gradient-end"></div>

            {/* Header */}
            <div className="relative p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-br from-nex-navy/5 via-nex-purple/5 to-transparent">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-nex-purple to-nex-gradient-end rounded-full blur-3xl"></div>
              </div>

              <div className="relative flex items-center space-x-3 mb-2">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="p-3 bg-gradient-to-br from-nex-purple to-nex-gradient-end rounded-xl shadow-lg"
                >
                  <Building2 className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-nex-navy via-nex-purple to-nex-gradient-end bg-clip-text text-transparent"
                  >
                    Welcome to Expensa!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-sm text-gray-600"
                  >
                    Let's set up your organization profile
                  </motion.p>
                </div>
              </div>

              {/* Progress Indicator */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden origin-left"
              >
                <div className="h-full w-1/3 bg-gradient-to-r from-nex-purple to-nex-gradient-end rounded-full"></div>
              </motion.div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-160px)] sm:max-h-[calc(90vh-180px)]">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-5">
                {/* Organization Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-nex-purple" />
                      <span>Organization Name *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nex-purple/50 focus:border-nex-purple transition-all"
                    placeholder="e.g., NeX Consulting Ltd"
                  />
                </motion.div>

                {/* Website and Phone Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-nex-purple" />
                        <span>Website (Optional)</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      autoComplete="url"
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nex-purple/50 focus:border-nex-purple transition-all"
                      placeholder="example.com or https://example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">We'll add https:// if needed</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-nex-purple" />
                        <span>Phone Number *</span>
                      </div>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nex-purple/50 focus:border-nex-purple transition-all"
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </motion.div>
                </div>

                {/* Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-nex-purple" />
                      <span>Business Address *</span>
                    </div>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nex-purple/50 focus:border-nex-purple transition-all resize-none"
                    placeholder="Full business address"
                  />
                </motion.div>

                {/* Representative and Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-nex-purple" />
                        <span>Representative Name *</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      name="representativeName"
                      value={formData.representativeName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nex-purple/50 focus:border-nex-purple transition-all"
                      placeholder="Your full name"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-nex-purple" />
                        <span>Business Email *</span>
                      </div>
                    </label>
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nex-purple/50 focus:border-nex-purple transition-all"
                      placeholder="contact@example.com"
                    />
                  </motion.div>
                </div>

                {/* Budget Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="p-5 bg-gradient-to-br from-nex-purple/10 via-nex-gradient-start/5 to-nex-gradient-end/10 rounded-xl border-2 border-nex-purple/20"
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <div className="p-1.5 bg-gradient-to-br from-nex-purple to-nex-gradient-end rounded-lg">
                      <DollarSign className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span>Budget Settings</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nex-purple/50 focus:border-nex-purple transition-all"
                        placeholder="100000"
                      />
                      <p className="text-xs text-gray-500 mt-1">You can change this anytime</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-nex-purple/50 focus:border-nex-purple transition-all"
                      >
                        <option value="NGN">NGN (₦)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200"
              >
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('expensa_onboarding_completed', 'true');
                    onComplete();
                  }}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm sm:text-base transition-colors font-medium"
                >
                  Skip for Now
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="relative px-6 py-3 bg-gradient-to-r from-nex-purple via-nex-gradient-start to-nex-gradient-end text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg hover:shadow-nex-purple/50 overflow-hidden group"
                >
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <span className="relative z-10 flex items-center space-x-2">
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Setting up...</span>
                      </>
                    ) : (
                      <span>Complete Setup</span>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
