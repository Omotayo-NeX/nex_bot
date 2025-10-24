'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileImage, Loader, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import { ExpenseFormData } from './AddExpenseModal';
import { useAuth } from '@/lib/contexts/AuthContext';

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtracted: (data: ExpenseFormData) => void;
}

export default function UploadReceiptModal({
  isOpen,
  onClose,
  onExtracted
}: UploadReceiptModalProps) {
  const { session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelection(droppedFile);
    }
  }, []);

  const handleFileSelection = (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 8MB to match server limit)
    const maxSizeMB = 8;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      setError(`File size (${fileSizeMB}MB) exceeds the maximum allowed size of ${maxSizeMB}MB. Please compress your image or use a smaller file.`);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  };

  const handleExtract = async () => {
    if (!file || !session) return;

    setIsExtracting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch('/api/expensa/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Failed to extract receipt data';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON (e.g., 413 from server), use status text
          if (response.status === 413) {
            errorMessage = 'Image file is too large. Please use a smaller image (max 8MB) or compress it.';
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Receipt extraction successful:', data);

      // Pass extracted data to parent
      const extractedFormData = {
        merchantName: data.merchantName || '',
        category: data.category || 'Other',
        amount: data.amount?.toString() || '',
        currency: data.currency || 'NGN',
        description: data.description || '',
        expenseDate: data.expenseDate || new Date().toISOString().split('T')[0],
        projectName: ''
      };

      console.log('📤 Passing extracted data to parent:', extractedFormData);
      onExtracted(extractedFormData);

      // Reset and close
      setFile(null);
      setPreview(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to extract receipt data');
    } finally {
      setIsExtracting(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      setShowCamera(true);

      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Explicitly play the video
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please allow camera permissions or upload a file instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
          handleFileSelection(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const handleClose = () => {
    stopCamera();
    setFile(null);
    setPreview(null);
    setError(null);
    setIsExtracting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <h2 className="text-2xl font-bold text-white">Upload Receipt</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center space-x-2 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!preview && !showCamera ? (
                <div>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                      isDragging
                        ? 'border-nex-yellow bg-nex-yellow/5'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <FileImage className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      Drop your receipt here
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      or use one of the options below
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                        <span className="px-6 py-3 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg cursor-pointer inline-flex items-center space-x-2 transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>Browse Files</span>
                        </span>
                      </label>
                      <button
                        onClick={startCamera}
                        className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg inline-flex items-center space-x-2 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : showCamera ? (
                <div>
                  <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-h-96 object-contain"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="flex items-center justify-center space-x-3 mt-4">
                    <button
                      onClick={stopCamera}
                      className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="px-8 py-3 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Capture Photo</span>
                    </button>
                  </div>

                  <p className="text-center text-gray-500 text-sm mt-3">
                    Position your receipt in the frame and click capture
                  </p>
                </div>
              ) : preview ? (
                <div>
                  <div className="mb-4 rounded-xl overflow-hidden border border-gray-700">
                    <img
                      src={preview}
                      alt="Receipt preview"
                      className="w-full max-h-96 object-contain bg-gray-800"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg mb-4">
                    <div className="flex items-center space-x-3">
                      <FileImage className="w-5 h-5 text-nex-yellow" />
                      <div>
                        <p className="text-sm font-medium text-gray-300">{file?.name}</p>
                        <p className="text-xs text-gray-500">
                          {file && (file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    {!isExtracting && (
                      <button
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
                        className="text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {isExtracting && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg flex items-center space-x-3 mb-4">
                      <Loader className="w-5 h-5 text-blue-400 animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-blue-400">Extracting data...</p>
                        <p className="text-xs text-blue-300/70">
                          AI is analyzing your receipt
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={handleClose}
                      disabled={isExtracting}
                      className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExtract}
                      disabled={isExtracting}
                      className="px-6 py-2.5 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isExtracting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Extracting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Extract Data</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
