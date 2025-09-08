'use client';
import { useState, useRef, useEffect } from 'react';
import { X, Download, Mic, MicOff, Play, Pause, Volume2, Loader2 } from 'lucide-react';

interface VoiceoverGeneratorModalProps {
  onClose: () => void;
}

export default function VoiceoverGeneratorModal({ onClose }: VoiceoverGeneratorModalProps) {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Rachel');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Available ElevenLabs voices
  const voices = [
    { id: 'Rachel', name: 'Rachel', description: 'Calm, Professional' },
    { id: 'Drew', name: 'Drew', description: 'Well-rounded, Middle-aged' },
    { id: 'Clyde', name: 'Clyde', description: 'War veteran, Middle-aged' },
    { id: 'Paul', name: 'Paul', description: 'Authoritative, Middle-aged' },
    { id: 'Domi', name: 'Domi', description: 'Strong, Confident' },
    { id: 'Dave', name: 'Dave', description: 'Conversational, Everyday' },
  ];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setText(prev => prev + ' ' + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognition);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const generateVoice = async () => {
    if (!text.trim()) {
      alert('Please enter some text to convert to speech.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `HTTP ${response.status}: Failed to generate voice`;
        alert(errorMessage);
        return;
      }

      const blob = await response.blob();
      console.log('Audio blob size:', blob.size, 'type:', blob.type);
      
      // Clean up previous audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      const newAudioUrl = URL.createObjectURL(blob);
      setAudioUrl(newAudioUrl);

      // Force audio element to load new source and play
      if (audioRef.current) {
        audioRef.current.src = newAudioUrl;
        audioRef.current.load(); // Force reload of the audio element
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (playError) {
          console.error('Auto-play failed:', playError);
          // Auto-play might be blocked, but audio is ready for manual play
        }
      }
    } catch (error) {
      console.error('Error generating voiceover:', error);
      alert('Failed to generate voiceover. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `nex-voiceover-${selectedVoice}-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const exampleTexts = [
    "Welcome to NeX AI, your digital marketing assistant that transforms your business strategy with intelligent automation.",
    "Discover the power of artificial intelligence in digital marketing and take your business to new heights.",
    "Thank you for choosing NeX Consulting Limited for your AI automation and digital marketing needs."
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Voiceover Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Select Voice
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {voices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`p-3 rounded-xl border transition-all text-left ${
                    selectedVoice === voice.id
                      ? 'border-cyan-500 bg-cyan-500/10 text-white'
                      : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-xs text-gray-400">{voice.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-300 text-sm font-medium">
                Text to Convert
              </label>
              <button
                onClick={toggleRecording}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-all ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecording ? 'Stop' : 'Record'}</span>
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              disabled={isGenerating}
            />
            <div className="text-gray-400 text-xs mt-1">
              {text.length}/1000 characters
            </div>
          </div>

          {/* Example Texts */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Quick Examples
            </label>
            <div className="space-y-2">
              {exampleTexts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setText(example)}
                  className="w-full p-3 text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors text-gray-300 text-sm"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateVoice}
            disabled={isGenerating || !text.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-3"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Voiceover...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                <span>Generate Voiceover</span>
              </>
            )}
          </button>

          {/* Audio Player */}
          {audioUrl && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Generated Voiceover</h3>
                  <div className="text-gray-400 text-sm">
                    Voice: {voices.find(v => v.id === selectedVoice)?.name}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlayPause}
                    className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={handleAudioEnd}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onLoadedData={() => console.log('Audio loaded successfully')}
                      onError={(e) => console.error('Audio error:', e)}
                      className="w-full"
                      controls
                      preload="auto"
                    />
                  </div>
                  
                  <button
                    onClick={downloadAudio}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download MP3</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}