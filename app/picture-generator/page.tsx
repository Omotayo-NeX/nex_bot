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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'upload'>('generate');

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

    const filename = createSafeFilename(promptText);
    console.log('🔄 Starting download for:', filename);

    try {
      // Use server-side download API for better CORS handling
      console.log('📤 Calling download API...');
      const response = await fetch('/api/download-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          filename: `nex-${filename}.png`
        })
      });

      const data = await response.json();
      console.log('📥 API Response:', { success: data.success, hasDataUrl: !!data.dataUrl, filename: data.filename });

      if (response.ok && data.success && data.dataUrl) {
        try {
          // Convert data URL to Blob for better browser compatibility
          const [header, base64Data] = data.dataUrl.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
          
          // Convert base64 to bytes
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          
          // Create blob and object URL
          const blob = new Blob([byteArray], { type: mimeType });
          const objectUrl = URL.createObjectURL(blob);
          
          // Create download link
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = data.filename || `nex-${filename}.png`;
          link.style.display = 'none';
          
          // Add to DOM, click, then cleanup
          document.body.appendChild(link);
          link.offsetHeight; // Force reflow
          link.click();
          
          // Cleanup after download
          setTimeout(() => {
            if (link.parentNode) {
              document.body.removeChild(link);
            }
            URL.revokeObjectURL(objectUrl);
          }, 100);
          
          console.log('✅ Image downloaded successfully via Blob:', data.filename);
          return;
        } catch (blobError) {
          console.error('❌ Blob download failed, trying data URL fallback:', blobError);
          
          // Fallback to data URL method
          const link = document.createElement('a');
          link.href = data.dataUrl;
          link.download = data.filename || `nex-${filename}.png`;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.offsetHeight;
          link.click();
          
          setTimeout(() => {
            if (link.parentNode) {
              document.body.removeChild(link);
            }
          }, 100);
          
          console.log('✅ Image downloaded via data URL fallback:', data.filename);
          return;
        }
      } else {
        throw new Error(data.error || 'API returned no data URL');
      }
    } catch (error) {
      console.error('❌ Download API failed:', error);
      
      // Fallback: try direct download for data URLs
      if (imageUrl.startsWith('data:')) {
        console.log('🔄 Trying direct data URL download...');
        try {
          const link = document.createElement('a');
          link.href = imageUrl;
          link.download = `nex-${filename}.png`;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.offsetHeight; // Force reflow
          link.click();
          
          setTimeout(() => {
            if (link.parentNode) {
              document.body.removeChild(link);
            }
          }, 100);
          
          console.log('✅ Direct download successful');
          return;
        } catch (directError) {
          console.error('❌ Direct download also failed:', directError);
        }
      }
      
      // Final fallback: open in new window
      console.log('🔄 Trying fallback: open in new window...');
      try {
        const newWindow = window.open(imageUrl, '_blank');
        if (!newWindow) {
          setError('Failed to download image. Please allow popups or right-click the image to save it manually.');
        } else {
          console.log('✅ Opened in new window - user can save manually');
        }
      } catch (fallbackError) {
        console.error('❌ All download methods failed:', fallbackError);
        setError('Failed to download image. Please right-click the image and select "Save Image As..." to download manually.');
      }
    }
  };

  const clearHistory = () => {
    setImageHistory([]);
    localStorage.removeItem('nex-image-history');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, GIF, etc.)');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please upload an image smaller than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setError(null);
      
      // Add to history
      const newHistoryItem: ImageHistory = {
        id: Date.now().toString(),
        prompt: `Uploaded: ${file.name}`,
        imageUrl: result,
        timestamp: Date.now()
      };
      
      setImageHistory(prev => [newHistoryItem, ...prev].slice(0, 20));
    };
    reader.onerror = () => {
      setError('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
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
            {/* Tab Navigation */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl mb-8">
              <div className="flex border-b border-gray-700/50">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`flex-1 px-6 py-4 font-medium transition-all duration-200 ${
                    activeTab === 'generate'
                      ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <span>Generate Image</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 px-6 py-4 font-medium transition-all duration-200 ${
                    activeTab === 'upload'
                      ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Upload Image</span>
                  </div>
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'generate' ? (
                  /* Generate Tab Content */
                  <div>
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
                ) : (
                  /* Upload Tab Content */
                  <div>
                    <div className="mb-6">
                      <label htmlFor="imageUpload" className="block text-lg font-semibold text-white mb-3">
                        Upload an image to view and download:
                      </label>
                      <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-gray-500 transition-colors">
                        <input
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label htmlFor="imageUpload" className="cursor-pointer">
                          <div className="flex flex-col items-center space-y-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                              <p className="text-lg text-white font-medium">Click to upload image</p>
                              <p className="text-gray-400 text-sm mt-1">Supports PNG, JPG, JPEG, GIF (max 10MB)</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

            {/* Uploaded Image Display */}
            {uploadedImage && activeTab === 'upload' && (
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl animate-fadeIn mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Uploaded Image:</h2>
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={uploadedImage}
                    alt="Uploaded image"
                    className="w-full h-auto max-h-[600px] object-contain bg-gray-900"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 flex gap-3 flex-wrap">
                  <button
                    onClick={() => downloadImage(uploadedImage!, 'uploaded-image')}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setError(null);
                    }}
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Remove Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* Generated Image Display */}
            {generatedImage && activeTab === 'generate' && (
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