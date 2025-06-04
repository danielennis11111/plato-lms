'use client';

import { useState, useEffect } from 'react';
import { DictationInput } from './DictationInput';
import { TextCleanupService } from '@/lib/textCleanupService';
import { useAuth } from '@/contexts/AuthContext';
import { Mic, Edit3, Sparkles, Copy, Download, FileText, Lightbulb } from 'lucide-react';

interface AssignmentSubmissionFormProps {
  initialValue?: string;
  onSubmissionChange: (submission: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  placeholder?: string;
}

export function AssignmentSubmissionForm({
  initialValue = '',
  onSubmissionChange,
  onSubmit,
  isSubmitting = false,
  placeholder = "Enter your submission here..."
}: AssignmentSubmissionFormProps) {
  const { getUserData } = useAuth();
  const [submission, setSubmission] = useState(initialValue);
  const [mode, setMode] = useState<'typing' | 'dictation'>('typing');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    onSubmissionChange(submission);
  }, [submission, onSubmissionChange]);

  const getApiKey = () => {
    const userData = getUserData();
    return userData?.apiKeys?.find(key => key.provider === 'gemini' && key.isActive)?.keyHash;
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSubmission(e.target.value);
  };

  const handleDictationTranscript = (transcript: string) => {
    setSubmission(transcript);
  };

  const handleAppendDictation = (transcript: string) => {
    if (transcript.trim()) {
      const currentText = submission;
      const separator = currentText && !currentText.endsWith(' ') && !currentText.endsWith('\n') ? ' ' : '';
      setSubmission(currentText + separator + transcript.trim());
    }
  };

  const cleanUpText = async () => {
    if (!submission.trim()) return;
    
    setIsProcessing(true);
    try {
      // Basic cleanup only - remove extra whitespace and fix obvious issues
      const cleanedText = TextCleanupService.basicCleanup(submission);
      setSubmission(cleanedText);
    } catch (error) {
      console.error('Error cleaning up text:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSuggestions = async () => {
    if (!submission.trim()) return;
    
    setIsProcessing(true);
    try {
      const apiKey = getApiKey();
      const newSuggestions = await TextCleanupService.suggestImprovements(submission, apiKey);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(submission);
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const downloadAsText = () => {
    const blob = new Blob([submission], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assignment-submission.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getWordCount = () => {
    return submission.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = () => {
    return submission.length;
  };

  const isDictated = TextCleanupService.isDictatedText(submission);
  const textStats = TextCleanupService.getTextStats(submission);

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode('typing')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'typing'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Type</span>
            </button>
            <button
              onClick={() => setMode('dictation')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'dictation'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Dictate</span>
            </button>
          </div>
          
          {isDictated && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              <Mic className="w-3 h-3" />
              <span>Dictated content detected</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {submission && (
            <>
              
              
              
              
              
            </>
          )}
        </div>
      </div>

      {/* Input Mode */}
      {mode === 'typing' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="submission" className="block text-sm font-medium text-gray-700 mb-2">
              Your Submission
            </label>
            <textarea
              id="submission"
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              value={submission}
              onChange={handleTextareaChange}
              placeholder={placeholder}
            />
          </div>
        </div>
      )}

      {mode === 'dictation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Dictate Your Submission
            </label>
            
          </div>
          
          <DictationInput
            onTranscript={handleDictationTranscript}
            placeholder="Click 'Start Dictation' and brain dump all your thoughts about this assignment. Take your time - pause to think, then keep talking. Don't worry about organization yet!"
            className="w-full"
          />
          
          {submission && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Submission (You can edit this directly)
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                value={submission}
                onChange={handleTextareaChange}
                placeholder="Your dictated text will appear here..."
              />
            </div>
          )}
        </div>
      )}

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{textStats.words}</div>
          <div className="text-sm text-gray-600">Words</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{textStats.sentences}</div>
          <div className="text-sm text-gray-600">Sentences</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{textStats.averageWordsPerSentence}</div>
          <div className="text-sm text-gray-600">Avg Words/Sentence</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{textStats.readingTime}</div>
          <div className="text-sm text-gray-600">Reading Time (min)</div>
        </div>
      </div>

      {/* Submit Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <button
          type="submit"
          disabled={isSubmitting || !submission.trim()}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? 'Submitting...' : 'Submit for AI Pre-Grading'}
        </button>
      </form>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🧠 Brain Dump → ✏️ Manual Edit Workflow:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Step 1 - Brain Dump:</strong> Use dictation to get ALL your thoughts out quickly</li>
          <li>• <strong>Step 2 - Take Time:</strong> Dictation waits for you - pause to think through ideas</li>
          <li>• <strong>Step 3 - Manual Edit:</strong> Switch to typing to organize and structure your thoughts</li>
          <li>• <strong>Step 4 - Craft Essay:</strong> Turn your brain dump into a proper assignment format</li>
          <li>• <strong>Voice Commands:</strong> Say "period", "comma", "new paragraph" while dictating</li>
          <li>• <strong>Basic Format:</strong> Use only for fixing punctuation and spacing - YOU do the real editing!</li>
        </ul>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">Writing Suggestions</h4>
            </div>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-yellow-600 hover:text-yellow-800 text-sm"
            >
              Dismiss
            </button>
          </div>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span className="text-yellow-800 text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 