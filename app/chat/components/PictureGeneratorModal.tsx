'use client';
import { useState, useEffect } from 'react';
import { X, Download, Image as ImageIcon, Loader2, RefreshCw, Copy, ChevronLeft, ChevronRight, Mail, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ImageHistory {
  id: string;
  prompt: string;
  imageUrl: string;
  revisedPrompt?: string;
  timestamp: number;
}

interface GeneratedImage {
  url?: string;
  b64_json?: string;
  imageUrl?: string;
}

interface PictureGeneratorModalProps {
  onClose: () => void;
}

export default function PictureGeneratorModal({ onClose }: PictureGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('dall-e-3');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageHistory, setImageHistory] = useState<ImageHistory[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const models = [
    { id: 'dall-e-3', name: 'DALL·E 3', description: 'Most advanced OpenAI model' },
    { id: 'dall-e-2', name: 'DALL·E 2', description: 'Fast and reliable' },
    { id: 'stability-ai', name: 'Stability.ai', description: 'Open-source alternative' },
  ];

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('nex-image-history');
    if (savedHistory) {
      try {
        setImageHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load image history:', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nex-image-history', JSON.stringify(imageHistory));
  }, [imageHistory]);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setRevisedPrompt('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if it's an email verification error
        if (errorData.requiresVerification || response.status === 403) {
          setEmailVerificationRequired(true);
          setError(null); // Clear generic error since we'll show verification UI
          return;
        }
        
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      console.log('Image generation response:', data);
      
      // Handle different response formats from different providers
      const imageData: GeneratedImage = {
        imageUrl: data.imageUrl,
        url: data.url,
        b64_json: data.b64_json
      };
      
      setGeneratedImage(imageData);
      setRevisedPrompt(data.revised_prompt || data.revisedPrompt || '');
      setEmailVerificationRequired(false); // Clear verification requirement on success

      // Add to history (use the primary image URL)
      const imageUrl = data.imageUrl || data.url || `data:image/png;base64,${data.b64_json}`;
      const newHistoryItem: ImageHistory = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        imageUrl: imageUrl,
        revisedPrompt: data.revised_prompt || data.revisedPrompt,
        timestamp: Date.now(),
      };

      setImageHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep only last 10
    } catch (error) {
      console.error('Error generating image:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async (imageUrl: string, filename?: string) => {
    try {
      const response = await fetch('/api/download-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `nex-generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image');
    }
  };

  const copyImageLink = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const viewImage = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const regenerateImage = () => {
    if (prompt) {
      generateImage();
    }
  };

  const handleSendVerification = async () => {
    setSendingVerification(true);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST'
      });
      
      const data = await response.json();
      if (response.ok) {
        setError('Verification email sent! Please check your inbox and verify your email, then try again.');
        setEmailVerificationRequired(false);
      } else {
        setError(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      setError('Failed to send verification email');
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-4 md:inset-8 lg:inset-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl z-50 flex flex-col border border-gray-700/50"
      >
        {/* Enhanced Header */}
        <div className="flex justify-between items-center p-6 lg:p-8 border-b border-gray-700/50 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI Picture Generator
              </h2>
              <p className="text-gray-400 text-sm">Create stunning images with artificial intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-700/50 rounded-xl transition-colors group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
          {/* Model Selection & Input Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Model Selection */}
            <div className="space-y-4">
              <label className="block text-white font-semibold text-lg">
                AI Model
              </label>
              <div className="space-y-3">
                {models.map((model) => (
                  <motion.button
                    key={model.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedModel(model.id)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedModel === model.id
                        ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-white">{model.name}</div>
                    <div className="text-sm text-gray-400">{model.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-4">
              <label className="block text-white font-semibold text-lg">
                Describe Your Image
              </label>
              <div className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A majestic dragon soaring above snow-capped mountains at golden hour, digital art style..."
                  className="w-full h-32 px-6 py-4 bg-gray-800/50 border-2 border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all resize-none shadow-inner"
                  disabled={isLoading}
                />
                <div className="text-gray-400 text-sm">
                  {prompt.length}/500 characters • Be specific for better results
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateImage}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-2xl font-semibold transition-all flex items-center justify-center space-x-3 shadow-lg disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Magic...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      <span>Generate Image</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Email Verification Required */}
          {emailVerificationRequired && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-yellow-900/20 border-2 border-yellow-600/30 rounded-2xl shadow-lg"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-100 mb-2">Email Verification Required</h3>
                  <p className="text-yellow-200 mb-4 text-sm leading-relaxed">
                    To use the AI Picture Generator, you need to verify your email address. This helps us prevent abuse and ensures you receive important updates about your generated images.
                  </p>
                  <div className="flex items-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendVerification}
                      disabled={sendingVerification}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      {sendingVerification ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      <span>{sendingVerification ? 'Sending...' : 'Send Verification Email'}</span>
                    </motion.button>
                    <button
                      onClick={() => setEmailVerificationRequired(false)}
                      className="text-yellow-300 hover:text-yellow-200 text-sm underline transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-900/30 border-2 border-red-600/50 rounded-2xl text-red-200 shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {/* Generated Image Display */}
          {generatedImage && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/30 rounded-3xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Generated Image</h3>
                  <div className="text-sm text-gray-400">Model: {models.find(m => m.id === selectedModel)?.name}</div>
                </div>
                
                <div className="relative group">
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={generatedImage.imageUrl || generatedImage.url || `data:image/png;base64,${generatedImage.b64_json}`}
                    alt="Generated image"
                    className="w-full h-auto rounded-2xl shadow-2xl cursor-pointer hover:shadow-3xl transition-all"
                    onClick={() => viewImage(generatedImage.imageUrl || generatedImage.url || `data:image/png;base64,${generatedImage.b64_json}`)}
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      setError('Failed to load generated image. Please try again.');
                    }}
                  />
                  
                  {/* Image Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => downloadImage(generatedImage.imageUrl || generatedImage.url || `data:image/png;base64,${generatedImage.b64_json}`, `nex-generated-${Date.now()}.png`)}
                      className="p-3 bg-green-600 hover:bg-green-700 rounded-xl text-white shadow-lg"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={regenerateImage}
                      className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white shadow-lg"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyImageLink(generatedImage.imageUrl || generatedImage.url || `data:image/png;base64,${generatedImage.b64_json}`)}
                      className="p-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white shadow-lg"
                      title="Copy Link"
                    >
                      <Copy className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {revisedPrompt && (
                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-2xl">
                    <p className="text-blue-200 text-sm">
                      <strong>AI Enhanced Prompt:</strong> {revisedPrompt}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl border-2 border-dashed border-purple-500/30 flex items-center justify-center mb-6">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Creating Your Masterpiece</h3>
                <p className="text-gray-400">This may take a few moments...</p>
              </div>
            </motion.div>
          )}

          {/* Recent Generations Carousel */}
          {imageHistory.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Recent Generations</h3>
                <div className="text-sm text-gray-400">{imageHistory.length} images</div>
              </div>
              
              <div className="relative">
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                  {imageHistory.slice(0, 10).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-shrink-0 w-32 group cursor-pointer"
                      onClick={() => {
                        setPrompt(item.prompt);
                        setGeneratedImage({ imageUrl: item.imageUrl });
                      }}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-700 group-hover:border-purple-500 transition-colors">
                        <img
                          src={item.imageUrl}
                          alt={item.prompt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            console.error('History image failed to load:', item.imageUrl);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(item.imageUrl, `history-${item.id}.png`);
                            }}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                          >
                            <Download className="w-4 h-4 text-white" />
                          </motion.button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-400 truncate">{item.prompt}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Image Modal for Full View */}
      <AnimatePresence>
        {showImageModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60"
              onClick={() => setShowImageModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-8 z-60 flex items-center justify-center"
            >
              <div className="relative max-w-4xl max-h-full">
                <img
                  src={currentImageUrl}
                  alt="Full size image"
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                />
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-xl text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}