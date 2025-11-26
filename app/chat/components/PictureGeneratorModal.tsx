'use client';
import { useState, useEffect } from 'react';
import { X, Download, Image as ImageIcon, Loader2, RefreshCw, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/AuthContext';

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
  const { session } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageHistory, setImageHistory] = useState<ImageHistory[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState(false);

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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
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

  const downloadImage = async (imageUrl: string, customPrompt?: string) => {
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

      // Generate descriptive filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const cleanPrompt = (customPrompt || prompt)
        .substring(0, 30)
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
      link.download = `ai-picture-generator-${cleanPrompt}-${timestamp}.png`;

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
        className="fixed inset-0 sm:inset-4 md:inset-8 lg:inset-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-none sm:rounded-3xl shadow-2xl z-50 flex flex-col border-0 sm:border border-gray-700/50"
      >
        {/* Enhanced Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 lg:p-8 border-b border-gray-700/50 bg-gradient-to-r from-purple-600/10 to-blue-600/10 sticky top-0 z-10">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent truncate">
                AI Picture Generator
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">Create stunning images with artificial intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-700/50 rounded-xl transition-colors group flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
          {/* Prompt Input Section */}
          <div className="max-w-2xl mx-auto space-y-6">
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
                  maxLength={500}
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
              <div className="max-w-sm mx-auto bg-gray-800/30 rounded-3xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Generated Image</h3>
                  <div className="text-sm text-gray-400">DALL·E 3</div>
                </div>

                {/* Medium-sized image preview */}
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <Image
                      src={generatedImage.imageUrl || generatedImage.url || `data:image/png;base64,${generatedImage.b64_json}`}
                      alt="Generated AI image"
                      width={400}
                      height={400}
                      className="w-full max-w-[400px] mx-auto h-auto rounded-2xl shadow-2xl cursor-pointer hover:shadow-3xl transition-all"
                      onClick={() => viewImage(generatedImage.imageUrl || generatedImage.url || `data:image/png;base64,${generatedImage.b64_json}`)}
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        setError('Failed to load generated image. Please try again.');
                      }}
                    />
                  </motion.div>
                </div>

                {/* Download Button */}
                <div className="mt-6 space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => downloadImage(generatedImage.imageUrl || generatedImage.url || `data:image/png;base64,${generatedImage.b64_json}`)}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Image</span>
                  </motion.button>

                  {/* Secondary actions */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={regenerateImage}
                      className="flex-1 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 text-blue-300 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Regenerate</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => copyImageLink(generatedImage.imageUrl || generatedImage.url || `data:image/png;base64,${generatedImage.b64_json}`)}
                      className="flex-1 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/50 text-purple-300 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </motion.button>
                  </div>
                </div>

                {/* Enhanced prompt display */}
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
              className="max-w-md mx-auto flex flex-col items-center justify-center py-12"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl border-2 border-dashed border-purple-500/30 flex items-center justify-center mb-6">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Creating Your Masterpiece</h3>
                <p className="text-gray-400 text-sm">This may take a few moments...</p>
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