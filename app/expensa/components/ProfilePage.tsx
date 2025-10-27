'use client';
import { motion } from 'framer-motion';
import { Building2, Globe, Phone, MapPin, User, Mail, DollarSign, Edit, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/contexts/AuthContext';

interface OrganizationProfile {
  id: string;
  organizationName: string;
  website: string | null;
  phoneNumber: string;
  address: string;
  representativeName: string;
  businessEmail: string;
  monthlyBudget: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfilePageProps {
  onRequestOnboarding?: () => void;
}

export default function ProfilePage({ onRequestOnboarding }: ProfilePageProps) {
  const { session } = useAuth();
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    website: '',
    phoneNumber: '',
    address: '',
    representativeName: '',
    businessEmail: '',
    monthlyBudget: '',
    currency: 'NGN'
  });

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/expensa/profile', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      // Handle successful response with profile
      if (response.ok && data.profile) {
        setProfile(data.profile);
        setFormData({
          organizationName: data.profile.organizationName,
          website: data.profile.website || '',
          phoneNumber: data.profile.phoneNumber,
          address: data.profile.address,
          representativeName: data.profile.representativeName,
          businessEmail: data.profile.businessEmail,
          monthlyBudget: data.profile.monthlyBudget.toString(),
          currency: data.profile.currency
        });
      } else if (response.ok && data.needsOnboarding) {
        // Profile doesn't exist yet - this is normal for new users
        console.log('No profile yet - user needs onboarding');
      } else {
        // Only show error for actual failures
        console.warn('Profile fetch issue:', data.error);
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      // Don't show toast error if table doesn't exist - it's expected during setup
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!session) return;

    setIsSaving(true);
    try {
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
        throw new Error(error.error || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        organizationName: profile.organizationName,
        website: profile.website || '',
        phoneNumber: profile.phoneNumber,
        address: profile.address,
        representativeName: profile.representativeName,
        businessEmail: profile.businessEmail,
        monthlyBudget: profile.monthlyBudget.toString(),
        currency: profile.currency
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nex-yellow"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-12 text-center">
        <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Organization Profile</h3>
        <p className="text-gray-500 mb-6">You haven't set up your organization profile yet</p>
        {onRequestOnboarding && (
          <button
            onClick={onRequestOnboarding}
            className="px-6 py-3 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Building2 className="w-5 h-5" />
            <span>Set Up Organization Profile</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Organization Profile</h2>
          <p className="text-gray-400 text-sm">Manage your organization details and budget settings</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Organization Name</span>
              </div>
            </label>
            {isEditing ? (
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
              />
            ) : (
              <p className="text-white text-lg">{profile.organizationName}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Website</span>
              </div>
            </label>
            {isEditing ? (
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                placeholder="https://example.com"
              />
            ) : (
              <p className="text-white text-lg">{profile.website || 'Not provided'}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone Number</span>
              </div>
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
              />
            ) : (
              <p className="text-white text-lg">{profile.phoneNumber}</p>
            )}
          </div>

          {/* Business Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Business Email</span>
              </div>
            </label>
            {isEditing ? (
              <input
                type="email"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
              />
            ) : (
              <p className="text-white text-lg">{profile.businessEmail}</p>
            )}
          </div>

          {/* Representative Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Representative Name</span>
              </div>
            </label>
            {isEditing ? (
              <input
                type="text"
                name="representativeName"
                value={formData.representativeName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
              />
            ) : (
              <p className="text-white text-lg">{profile.representativeName}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Business Address</span>
              </div>
            </label>
            {isEditing ? (
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent resize-none"
              />
            ) : (
              <p className="text-white text-lg">{profile.address}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Budget Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-nex-yellow" />
          <span>Budget Settings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Monthly Budget
            </label>
            {isEditing ? (
              <input
                type="number"
                name="monthlyBudget"
                value={formData.monthlyBudget}
                onChange={handleChange}
                min="0"
                step="1000"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
              />
            ) : (
              <p className="text-white text-2xl font-bold">
                {new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: profile.currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(profile.monthlyBudget)}
              </p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Currency
            </label>
            {isEditing ? (
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
              >
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            ) : (
              <p className="text-white text-2xl font-bold">{profile.currency}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
