'use client';
import { useState, useEffect } from 'react';
import { X, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageHistory {
  id: string;
  prompt: string;
  imageUrl: string;
  revisedPrompt?: string;
  timestamp: number;
}

interface PictureGeneratorModalProps {
  onClose: () => void;
}

export default function PictureGeneratorModal({ onClose }: PictureGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageHistory, setImageHistory] = useState<ImageHistory[]>([]);

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
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      setRevisedPrompt(data.revisedPrompt || '');

      // Add to history
      const newHistoryItem: ImageHistory = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        imageUrl: data.imageUrl,
        revisedPrompt: data.revisedPrompt,
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Picture Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Input Section */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Describe the image you want to generate
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A futuristic cityscape at sunset with flying cars"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <button
                  onClick={generateImage}
                  disabled={isLoading || !prompt.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-medium transition-all flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-900/50 border border-red-600/50 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {/* Generated Image */}
            {generatedImage && (
              <div className="space-y-4">
                <div className="relative">
                  <Image
                    src={generatedImage}
                    alt="Generated image"
                    width={512}
                    height={512}
                    className="w-full max-w-lg mx-auto rounded-xl border border-gray-700"
                  />
                </div>

                {revisedPrompt && (
                  <div className="p-4 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                    <p className="text-blue-200 text-sm">
                      <strong>Revised prompt:</strong> {revisedPrompt}
                    </p>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={() => downloadImage(generatedImage, `generated-${Date.now()}.png`)}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* History */}
            {imageHistory.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Recent Generations</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageHistory.slice(0, 6).map((item) => (
                    <div key={item.id} className="group relative">
                      <Image
                        src={item.imageUrl}
                        alt={item.prompt}
                        width={200}
                        height={200}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-700"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          onClick={() => downloadImage(item.imageUrl, `history-${item.id}.png`)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="text-gray-400 text-xs truncate">{item.prompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}