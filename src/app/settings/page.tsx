'use client';

import { useState, useEffect } from 'react';
import { Save, ExternalLink } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [savedKey, setSavedKey] = useState('');

  // Load existing API key from localStorage on mount
  useEffect(() => {
    const existingKey = localStorage.getItem('geminiApiKey');
    if (existingKey) {
      setSavedKey(existingKey);
      // Don't set the input field for security reasons
    }
  }, []);

  const validateApiKey = async (key: string): Promise<boolean> => {
    if (!key.trim()) {
      setMessage('Please enter an API key.');
      return false;
    }

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash"
      });
      
      // Try to generate content with a simple prompt to validate the key
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: "Hello, can you verify this API key is working?" }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
          }
        ]
      });
      
      const response = result.response;
      const text = response.text();
      
      if (!text) {
        setMessage('Received empty response from API. Please try again.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('API key validation error:', error);
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          setMessage('Invalid API key format. Please check your key and try again.');
        } else if (error.message.includes('quota')) {
          setMessage('API quota exceeded. Please try again later or upgrade your plan.');
        } else if (error.message.includes('permission')) {
          setMessage('Permission denied. Please check if your API key has the correct permissions.');
        } else if (error.message.includes('network')) {
          setMessage('Network error. Please check your internet connection and try again.');
        } else if (error.message.includes('model')) {
          setMessage('Model not available. Please check if your API key has access to the Gemini models.');
        } else {
          setMessage(`Validation error: ${error.message}`);
        }
      } else {
        setMessage('An unexpected error occurred during validation.');
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      // If there's already a saved key and the input is empty, don't try to validate
      if (savedKey && !apiKey.trim()) {
        setMessage('API key is already saved. Enter a new key only if you want to change it.');
        setIsSaving(false);
        return;
      }

      // If the input matches the saved key, don't try to validate again
      if (savedKey === apiKey) {
        setMessage('This is the same API key that is already saved.');
        setIsSaving(false);
        return;
      }

      // Validate the API key before saving
      const isValid = await validateApiKey(apiKey);
      
      if (!isValid) {
        setIsSaving(false);
        return; // Message is already set in validateApiKey
      }

      // Store the API key in localStorage
      localStorage.setItem('geminiApiKey', apiKey);
      setSavedKey(apiKey);
      setMessage('API key saved successfully!');
      
      // Clear the input field for security
      setTimeout(() => {
        setApiKey('');
      }, 1500);
    } catch (error) {
      console.error('Error saving API key:', error);
      setMessage('Failed to save API key. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const verifyStoredKey = async () => {
    setIsVerifying(true);
    setMessage('');
    
    const storedKey = localStorage.getItem('geminiApiKey');
    
    if (!storedKey) {
      setMessage('No API key is currently stored. Please enter and save a key.');
      setIsVerifying(false);
      return;
    }
    
    try {
      const isValid = await validateApiKey(storedKey);
      if (isValid) {
        setMessage('The stored API key is valid and working correctly!');
      }
    } catch (error) {
      console.error('Error verifying stored key:', error);
      setMessage('Error verifying the stored API key. Please try saving a new key.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">AI Assistant Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              Gemini API Key {savedKey && <span className="text-green-600 ml-2">(Saved)</span>}
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <button
                type="submit"
                disabled={isSaving || !apiKey.trim()}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
            {message && (
              <p className={`mt-2 text-sm ${message.includes('success') || message.includes('valid') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
            {savedKey && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={verifyStoredKey}
                  disabled={isVerifying}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {isVerifying ? 'Verifying...' : 'Verify stored API key'}
                </button>
              </div>
            )}
            <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">How to get your API key:</h3>
              <ol className="text-sm text-blue-700 space-y-2 ml-4 list-decimal">
                <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 inline-flex items-center">Google AI Studio <ExternalLink className="w-3 h-3 ml-1" /></a></li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API key" button</li>
                <li>Copy the generated API key</li>
                <li>Paste it here and click Save</li>
              </ol>
              <p className="mt-2 text-xs text-blue-600">Note: Make sure you're using a valid Gemini API key. If you've just created your key, it may take a few moments to activate.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 