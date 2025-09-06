"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface ImageHistory {
  id: string;
  prompt: string;
  imageUrl: string;
  revisedPrompt?: string;
  timestamp: number;
}

export default function PictureGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string>("");
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
      setError("Please enter a prompt to generate an image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setRevisedPrompt("");

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setGeneratedImage(data.imageUrl);
        setRevisedPrompt(data.revised_prompt || data.prompt);
        
        // Save to history
        const newHistoryItem: ImageHistory = {
          id: Date.now().toString(),
          prompt: prompt.trim(),
          imageUrl: data.imageUrl,
          revisedPrompt: data.revised_prompt,
          timestamp: Date.now()
        };
        
        setImageHistory(prev => [newHistoryItem, ...prev].slice(0, 20)); // Keep only last 20 images
      } else {
        setError(data.error || 'Failed to generate image. Please try again.');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError('An unexpected error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  };

  const createSafeFilename = (text: string) => {
    return text
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .toLowerCase()
      .substring(0, 50) // Limit length
      || 'picture'; // Fallback
  };

  const downloadImage = async (imageUrl: string, promptText: string) => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = createSafeFilename(promptText);
      link.download = `nex-${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
    }
  };

  const clearHistory = () => {
    setImageHistory([]);
    localStorage.removeItem('nex-image-history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back to Chat Link */}
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            
            {/* NeX Logo */}
            <div className="relative w-10 h-10 lg:w-12 lg:h-12">
              <Image 
                src="/Nex_logomark_white.png" 
                alt="NeX Logo" 
                fill
                className="object-contain"
              />
            </div>
            
            {/* Page Title */}
            <h1 className="text-xl lg:text-2xl font-bold text-white">Picture Generator</h1>
          </div>
          
          {/* Bot Avatar */}
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
            <div className="relative w-7 h-7">
              <Image 
                src="/Nex_logomark_white.png" 
                alt="NeX AI" 
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Generator Section */}
          <div className="lg:col-span-2">
            {/* Input Section */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl mb-8">
              <div className="mb-6">
                <label htmlFor="prompt" className="block text-lg font-semibold text-white mb-3">
                  Describe the image you want to generate:
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., A futuristic city skyline at night with neon lights and flying cars"
                  disabled={isLoading}
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 transition-all duration-200"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                  <span>Press Enter to generate or Shift+Enter for new line</span>
                  <span>{prompt.length}/1000</span>
                </div>
              </div>
              
              <button
                onClick={generateImage}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Image...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Generate Image</span>
                  </div>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/50 border border-red-600/50 rounded-xl p-4 mb-6 animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Generated Image Display */}
            {generatedImage && (
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl animate-fadeIn">
                <h2 className="text-xl font-bold text-white mb-4">Generated Image:</h2>
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={generatedImage}
                    alt="Generated artwork"
                    className="w-full h-auto max-h-[600px] object-contain bg-gray-900"
                    onError={(e) => {
                      console.error('Image failed to load:', generatedImage);
                      setError('Failed to load the generated image. Please try again.');
                    }}
                  />
                </div>
                
                {/* Prompt Information */}
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                  <div className="mb-2">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-blue-400">Original Prompt:</span>
                    </p>
                    <p className="text-gray-100 italic">&ldquo;{prompt}&rdquo;</p>
                  </div>
                  {revisedPrompt && revisedPrompt !== prompt && (
                    <div>
                      <p className="text-sm text-gray-300">
                        <span className="font-semibold text-purple-400">AI-Enhanced Prompt:</span>
                      </p>
                      <p className="text-gray-100 italic text-sm">&ldquo;{revisedPrompt}&rdquo;</p>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 flex gap-3 flex-wrap">
                  <button
                    onClick={() => downloadImage(generatedImage, prompt)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setPrompt("");
                      setGeneratedImage(null);
                      setRevisedPrompt("");
                      setError(null);
                    }}
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Generate Another</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="mt-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-600/20">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Tips for Better Results</span>
              </h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Be specific about style, colors, and mood</li>
                <li>• Include details about lighting and composition</li>
                <li>• Mention artistic styles (e.g., &ldquo;digital art&rdquo;, &ldquo;photorealistic&rdquo;, &ldquo;watercolor&rdquo;)</li>
                <li>• Specify the setting or background you want</li>
                <li>• Use descriptive adjectives for better quality</li>
              </ul>
            </div>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Recent Images</span>
                </h3>
                {imageHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-gray-400 hover:text-red-400 text-sm transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {imageHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-8 text-sm">No images generated yet.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {imageHistory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 hover:bg-gray-900/70 group"
                    >
                      <div className="flex space-x-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          <img
                            src={item.imageUrl}
                            alt="Generated thumbnail"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
                            &quot;{item.prompt}&quot;
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-gray-500 text-xs">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </p>
                            <button
                              onClick={() => downloadImage(item.imageUrl, item.prompt)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Download"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}