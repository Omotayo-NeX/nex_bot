'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, Camera, MapPin, Check, AlertCircle, Loader2, DollarSign, FileText, Tag } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface FieldLinkData {
  valid: boolean;
  fieldLink?: {
    workerName: string;
    projectName?: string;
    expiresAt: string;
    remainingUses?: number | null;
  };
  error?: string;
}

const CATEGORIES = [
  { value: 'Transport', label: '🚗 Transport', icon: '🚗' },
  { value: 'Food', label: '🍽️ Food & Meals', icon: '🍽️' },
  { value: 'Lodging', label: '🏨 Lodging', icon: '🏨' },
  { value: 'Equipment', label: '🔧 Equipment', icon: '🔧' },
  { value: 'Software', label: '💻 Software', icon: '💻' },
  { value: 'Office', label: '📎 Office Supplies', icon: '📎' },
  { value: 'Marketing', label: '📢 Marketing', icon: '📢' },
  { value: 'Travel', label: '✈️ Travel', icon: '✈️' },
  { value: 'Other', label: '📋 Other', icon: '📋' }
];

export default function FieldExpenseSubmitPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [linkData, setLinkData] = useState<FieldLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  // Validate field link on mount
  useEffect(() => {
    if (token) {
      validateFieldLink();
    }
  }, [token]);

  const validateFieldLink = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/expensa/submit?token=${token}`);
      const data = await response.json();
      setLinkData(data);

      if (!data.valid) {
        toast.error(data.error || 'Invalid or expired link');
      }
    } catch (error) {
      console.error('Failed to validate link:', error);
      toast.error('Failed to validate link');
      setLinkData({ valid: false, error: 'Connection error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        toast.success('Location captured');
        setGettingLocation(false);
      },
      (error) => {
        // Handle geolocation errors gracefully without console.error
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. You can still submit without location.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        toast.info(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const uploadReceipt = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch('/api/expensa/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload receipt');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiptFile) {
      toast.error('Please upload a receipt photo');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    setSubmitting(true);

    try {
      // Upload receipt first
      const receiptUrl = await uploadReceipt(receiptFile);

      // Submit expense
      const response = await fetch('/api/expensa/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          amount: parseFloat(amount),
          description,
          category,
          receiptUrl,
          location
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit expense');
      }

      toast.success(data.message);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-nex-yellow animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Validating link...</p>
        </motion.div>
      </div>
    );
  }

  if (!linkData?.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
            <p className="text-gray-300 mb-6">{linkData?.error || 'This link is not valid or has expired.'}</p>
            <p className="text-sm text-gray-400">Please contact your administrator for a new link.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-3">Success!</h2>
            <p className="text-gray-300 mb-2">Your expense has been submitted successfully.</p>
            <p className="text-gray-400 text-sm mb-6">
              Your submission will be reviewed by the admin shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setAmount('');
                setDescription('');
                setCategory('');
                setReceiptFile(null);
                setReceiptPreview(null);
                setLocation('');
              }}
              className="w-full px-6 py-3 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors"
            >
              Submit Another Expense
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            💰 Submit Expense
          </h1>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <p className="text-gray-300 mb-1">
              Welcome, <span className="font-semibold text-nex-yellow">{linkData.fieldLink?.workerName}</span>
            </p>
            {linkData.fieldLink?.projectName && (
              <p className="text-sm text-gray-400">
                Project: {linkData.fieldLink.projectName}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Link expires: {new Date(linkData.fieldLink!.expiresAt).toLocaleDateString()}
            </p>
            {linkData.fieldLink?.remainingUses !== null && (
              <p className="text-xs text-gray-500">
                Remaining uses: {linkData.fieldLink?.remainingUses}
              </p>
            )}
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 md:p-8 space-y-6"
        >
          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Receipt Photo *
            </label>
            <div className="relative">
              {receiptPreview ? (
                <div className="relative">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptFile(null);
                      setReceiptPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-600 hover:border-nex-yellow rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-300 font-medium mb-1">Click to upload receipt</p>
                  <p className="text-sm text-gray-500">or drag and drop</p>
                  <p className="text-xs text-gray-600 mt-2">PNG, JPG up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    capture="environment"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (₦) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-nex-yellow"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    category === cat.value
                      ? 'bg-nex-yellow text-nex-navy border-nex-yellow font-semibold'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="text-xl mb-1 block">{cat.icon}</span>
                  <span className="text-xs">{cat.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-nex-yellow resize-none"
                placeholder="Brief description of the expense..."
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location (Optional)
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-nex-yellow"
                  placeholder="Enter location or use GPS"
                />
              </div>
              <button
                type="button"
                onClick={getLocation}
                disabled={gettingLocation}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                {gettingLocation ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !receiptFile || !amount || !category}
            className="w-full px-6 py-4 bg-nex-yellow hover:bg-nex-yellow-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-nex-navy font-bold rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Submit Expense</span>
              </>
            )}
          </button>
        </motion.form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Powered by <span className="text-nex-yellow font-semibold">NeX Expensa</span>
        </p>
      </div>
    </div>
  );
}
