'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Pause, Play, Square, AlertCircle } from 'lucide-react';

interface DictationInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export function DictationInput({ 
  onTranscript, 
  placeholder = "Click the microphone to start dictating...", 
  className = "",
  continuous = true,
  interimResults = true 
}: DictationInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [restartCount, setRestartCount] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const isManualStopRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listeningStartTimeRef = useRef<number>(0);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
    } else {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        isManualStopRef.current = true;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const createRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = interimResults;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listeningStartTimeRef.current = Date.now();
      setIsListening(true);
      setIsPaused(false);
      setError(null);
      console.log(`🎤 Speech recognition started (restart #${restartCount})`);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        finalTranscriptRef.current += final;
        setTranscript(finalTranscriptRef.current);
        onTranscript(finalTranscriptRef.current);
      }

      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      const listeningTime = Date.now() - listeningStartTimeRef.current;
      console.log(`Speech recognition error: ${event.error} after ${listeningTime}ms`);
      
      // Don't treat timeouts/pauses as real errors
      if (event.error === 'no-speech' || event.error === 'aborted' || event.error === 'network') {
        console.log(`Ignoring ${event.error} - normal pause behavior`);
        return;
      }
      
      // Only show errors for real problems
      switch (event.error) {
        case 'audio-capture':
          setError('Microphone not found. Please check your audio settings.');
          setIsListening(false);
          break;
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone permissions.');
          setIsListening(false);
          break;
        default:
          console.log(`Handling error: ${event.error}`);
          // For other errors, try to restart if we're still supposed to be listening
          if (!isManualStopRef.current) {
            scheduleRestart();
          }
      }
    };

    recognition.onend = () => {
      const listeningTime = Date.now() - listeningStartTimeRef.current;
      console.log(`🎤 Speech recognition ended after ${listeningTime}ms`);
      
      // Auto-restart immediately if user didn't manually stop
      if (!isManualStopRef.current && !isPaused) {
        scheduleRestart();
      } else {
        setIsListening(false);
        setIsPaused(false);
      }
    };

    return recognition;
  };

  const scheduleRestart = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    console.log('🔄 Scheduling restart...');
    restartTimeoutRef.current = setTimeout(() => {
      if (!isManualStopRef.current && recognitionRef.current) {
        try {
          // Create a fresh recognition instance to avoid state issues
          recognitionRef.current.stop();
          recognitionRef.current = createRecognition();
          recognitionRef.current.start();
          setRestartCount(prev => prev + 1);
          console.log('✅ Successfully restarted recognition');
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          // Try again in a moment
          setTimeout(() => {
            if (!isManualStopRef.current) {
              scheduleRestart();
            }
          }, 500);
        }
      }
    }, 50); // Very quick restart
  };

  const startListening = async () => {
    if (!isSupported) return;

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      finalTranscriptRef.current = transcript;
      setError(null);
      isManualStopRef.current = false;
      setRestartCount(0);
      
      recognitionRef.current = createRecognition();
      recognitionRef.current.start();
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permissions and try again.');
    }
  };

  const stopListening = () => {
    isManualStopRef.current = true;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsListening(false);
    setIsPaused(false);
  };

  const pauseListening = () => {
    if (recognitionRef.current && isListening) {
      isManualStopRef.current = true;
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      recognitionRef.current.stop();
      setIsPaused(true);
      setIsListening(false);
    }
  };

  const resumeListening = () => {
    if (isPaused) {
      setIsPaused(false);
      isManualStopRef.current = false;
      startListening();
    }
  };

  const keepListening = () => {
    // Manual restart button for when user wants to ensure it's still listening
    if (!isListening && !isPaused) {
      isManualStopRef.current = false;
      startListening();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    onTranscript('');
  };

  const getWordCount = () => {
    const words = transcript.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  };

  if (!isSupported) {
    return (
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${className}`}>
        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">
          Speech recognition is not supported in this browser.
          <br />
          Please use Chrome, Edge, or Safari for dictation features.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Control Panel */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-3">
          {!isListening && !isPaused && (
            <button
              onClick={startListening}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Mic className="w-4 h-4" />
              <span>Start Dictation</span>
            </button>
          )}
          
          {isListening && (
            <div className="flex items-center space-x-2">
              <button
                onClick={pauseListening}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              
              <button
                onClick={stopListening}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </button>
              
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  Listening... {restartCount > 0 && `(auto-restarted ${restartCount}x)`}
                </span>
              </div>
            </div>
          )}
          
          {isPaused && (
            <button
              onClick={resumeListening}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Resume</span>
            </button>
          )}
          
          {!isListening && !isPaused && transcript && (
            <button
              onClick={keepListening}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <Mic className="w-4 h-4" />
              <span>Keep Listening</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Words: <span className="font-medium">{getWordCount()}</span>
          </div>
          
          {transcript && (
            <button
              onClick={clearTranscript}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Transcript Display */}
      <div className="border rounded-lg min-h-[200px] p-4 bg-white">
        {!transcript && !interimTranscript && (
          <p className="text-gray-500 italic">{placeholder}</p>
        )}
        
        {(transcript || interimTranscript) && (
          <div className="whitespace-pre-wrap text-gray-900">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-500 italic">{interimTranscript}</span>
            )}
            {isListening && <span className="animate-pulse">|</span>}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>🧠 <strong>Brain Dump Mode:</strong> Talk freely - the system aggressively restarts to keep listening!</p>
        <p>🔄 <strong>Aggressive Restart:</strong> Auto-restarts every few seconds to handle browser timeouts</p>
        <p>🎯 <strong>Voice Commands:</strong> Say "period", "comma", "new paragraph" for basic formatting</p>
        <p>▶️ <strong>Keep Listening:</strong> Click the green button if it stops to manually restart</p>
        <p>📊 <strong>Restart Counter:</strong> Shows how many times it auto-restarted for you</p>
      </div>
    </div>
  );
} 