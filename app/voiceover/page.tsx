'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Volume2, Download, Play, Pause, Mic, MicOff } from 'lucide-react';

export default function VoiceOverPage() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Rachel');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Available ElevenLabs voices
  const voices = [
    { id: 'Rachel', name: 'Rachel', description: 'Calm, Professional' },
    { id: 'Drew', name: 'Drew', description: 'Well-rounded, Middle-aged' },
    { id: 'Clyde', name: 'Clyde', description: 'War veteran, Middle-aged' },
    { id: 'Paul', name: 'Paul', description: 'Authoritative, Middle-aged' },
    { id: 'Domi', name: 'Domi', description: 'Strong, Confident' },
    { id: 'Dave', name: 'Dave', description: 'Conversational, Everyday' },
  ];

  const generateVoice = async () => {
    if (!text.trim()) {
      alert('Please enter some text to convert to speech.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/voiceover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      // Convert response to blob
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Create and play audio element
      const audio = new Audio(url);
      setAudioElement(audio);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      // Auto-play the generated audio
      audio.play();
      setIsPlaying(true);

    } catch (error) {
      console.error('Error generating voice:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate voice. Please try again.';
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `nex-voiceover-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const startRecording = () => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const newRecognition = new SpeechRecognition();
    newRecognition.lang = 'en-US';
    newRecognition.continuous = false;
    newRecognition.interimResults = false;

    newRecognition.onstart = () => {
      setIsRecording(true);
    };

    newRecognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      setIsRecording(false);
    };

    newRecognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      alert('Speech recognition error: ' + event.error);
    };

    newRecognition.onend = () => {
      setIsRecording(false);
    };

    setRecognition(newRecognition);
    newRecognition.start();
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI VoiceOver</h1>
                <p className="text-white/80 text-sm">Convert your text into natural speech</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <Image 
                src="/Nex_logomark_white.png" 
                alt="NeX Logo" 
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-8 shadow-2xl">
          {/* Voice Selection */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">Choose Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} - {voice.description}
                </option>
              ))}
            </select>
          </div>

          {/* Text Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-white font-semibold">Enter Text</label>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isGenerating}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                } text-white`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    🎙️ Speak
                  </>
                )}
              </button>
            </div>
            
            {isRecording && (
              <div className="mb-3 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-300 text-sm font-medium">Listening... Speak now!</span>
                </div>
              </div>
            )}
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              rows={8}
              className="w-full bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400 text-sm">{text.length} characters</span>
              <span className="text-gray-400 text-xs">Maximum recommended: 2500 characters</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Generate Button */}
            <button
              onClick={generateVoice}
              disabled={isGenerating || !text.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating Voice...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>Generate Voice</span>
                </>
              )}
            </button>

            {/* Audio Controls */}
            {audioUrl && (
              <div className="flex gap-3">
                <button
                  onClick={togglePlayback}
                  className="bg-gray-800/80 hover:bg-gray-700/80 text-white p-4 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={downloadAudio}
                  className="bg-gray-800/80 hover:bg-gray-700/80 text-white p-4 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center"
                  title="Download MP3"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Sample Texts */}
          <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/30">
            <h3 className="text-white font-semibold mb-4">Sample Texts</h3>
            <p className="text-gray-400 text-sm mb-4">💡 Pro tip: Use the microphone button above to speak your text instead of typing!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setText("Welcome to NeX AI, your intelligent assistant powered by advanced artificial intelligence. We're here to help you with digital marketing, automation, and creative solutions.")}
                className="text-left p-3 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg transition-colors text-gray-300 hover:text-white text-sm"
              >
                Welcome Message
              </button>
              <button
                onClick={() => setText("Transform your business with cutting-edge AI solutions. From automated workflows to intelligent analytics, NeX Consulting Limited provides the tools you need to succeed in today's digital landscape.")}
                className="text-left p-3 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg transition-colors text-gray-300 hover:text-white text-sm"
              >
                Business Pitch
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Powered by ElevenLabs AI Voice Technology & NeX Consulting Limited</p>
        </div>
      </div>
    </div>
  );
}