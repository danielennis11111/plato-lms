import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export class TextCleanupService {
  /**
   * Basic text cleanup without AI
   */
  static basicCleanup(text: string): string {
    if (!text.trim()) return text;

    return text
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      
      // Fix spacing after punctuation
      .replace(/([.!?])\s*([a-z])/gi, '$1 $2')
      
      // Handle dictated punctuation
      .replace(/\b(period|full stop)\b/gi, '.')
      .replace(/\bcomma\b/gi, ',')
      .replace(/\bquestion mark\b/gi, '?')
      .replace(/\bexclamation point\b/gi, '!')
      .replace(/\bsemicolon\b/gi, ';')
      .replace(/\bcolon\b/gi, ':')
      
      // Handle paragraph breaks
      .replace(/\b(new paragraph|new line)\b/gi, '\n\n')
      
      // Fix common speech-to-text errors
      .replace(/\bthier\b/gi, 'their')
      .replace(/\bthere\b(?=\s+going)/gi, "they're")
      .replace(/\byour\b(?=\s+going)/gi, "you're")
      .replace(/\bits\b(?=\s+going)/gi, "it's")
      
      // Capitalize first letter of sentences
      .replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
      
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Enhanced AI-powered text cleanup
   */
  static async enhancedCleanup(text: string, apiKey?: string): Promise<string> {
    if (!apiKey || !text.trim()) {
      return this.basicCleanup(text);
    }

    try {
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
      });

      const model = google('gemini-1.5-flash');

      const prompt = `You are a professional editor helping students improve their writing. Please clean up and improve the following text that was created through dictation. 

Instructions:
- Fix grammar, punctuation, and spelling errors
- Improve sentence structure and flow while preserving the original meaning
- Ensure proper capitalization and formatting
- Remove filler words (um, uh, like, you know) if present
- Keep the same tone and voice as the original
- Make it sound natural and well-written
- Don't change the core meaning or main ideas
- If it's academic writing, maintain appropriate formality

Original text:
"${text}"

Please return only the cleaned up text without any explanations or comments:`;

      const result = await generateText({
        model,
        prompt,
        maxTokens: 2000,
        temperature: 0.3,
      });

      return result.text.trim();
    } catch (error) {
      console.error('AI cleanup failed, falling back to basic cleanup:', error);
      return this.basicCleanup(text);
    }
  }

  /**
   * Smart cleanup that chooses the best method based on available resources
   */
  static async smartCleanup(text: string, apiKey?: string): Promise<string> {
    // If text is short or no API key, use basic cleanup
    if (!apiKey || text.length < 100) {
      return this.basicCleanup(text);
    }

    // For longer text with API key, use enhanced cleanup
    return this.enhancedCleanup(text, apiKey);
  }

  /**
   * Extract and suggest improvements for dictated text
   */
  static async suggestImprovements(text: string, apiKey?: string): Promise<string[]> {
    if (!apiKey || !text.trim()) {
      return this.getBasicSuggestions(text);
    }

    try {
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
      });

      const model = google('gemini-1.5-flash');

      const prompt = `Analyze the following text and provide 3-5 specific suggestions for improvement. Focus on:
- Grammar and punctuation issues
- Clarity and readability
- Academic writing best practices
- Structural improvements

Text to analyze:
"${text}"

Please provide only a JSON array of suggestion strings, like this:
["suggestion 1", "suggestion 2", "suggestion 3"]`;

      const result = await generateText({
        model,
        prompt,
        maxTokens: 500,
        temperature: 0.3,
      });

      try {
        const suggestions = JSON.parse(result.text.trim());
        return Array.isArray(suggestions) ? suggestions : this.getBasicSuggestions(text);
      } catch {
        return this.getBasicSuggestions(text);
      }
    } catch (error) {
      console.error('AI suggestions failed, using basic suggestions:', error);
      return this.getBasicSuggestions(text);
    }
  }

  /**
   * Basic suggestions without AI
   */
  private static getBasicSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    
    if (text.length < 50) {
      suggestions.push("Consider expanding your response with more details and examples");
    }
    
    if (!/[.!?]/.test(text)) {
      suggestions.push("Add proper punctuation to end your sentences");
    }
    
    if (text.toLowerCase() === text) {
      suggestions.push("Check capitalization - sentences should start with capital letters");
    }
    
    if (text.split(/\s+/).length < 10) {
      suggestions.push("Try to elaborate more on your main points");
    }
    
    const commonWords = ['the', 'and', 'or', 'but', 'so'];
    const wordCount = text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
    
    if (wordCount > 0 && uniqueWords / wordCount < 0.7) {
      suggestions.push("Try using more varied vocabulary to make your writing more engaging");
    }

    return suggestions.length > 0 ? suggestions : ["Your text looks good! Consider reviewing for any final improvements."];
  }

  /**
   * Check if text appears to be dictated (contains common speech patterns)
   */
  static isDictatedText(text: string): boolean {
    const dictationIndicators = [
      /\b(period|comma|question mark|exclamation point)\b/i,
      /\b(new paragraph|new line)\b/i,
      /\b(um|uh|like|you know)\b/i,
      /\b(slash|backslash|hyphen|dash)\b/i,
    ];

    return dictationIndicators.some(pattern => pattern.test(text));
  }

  /**
   * Get word count and other statistics
   */
  static getTextStats(text: string) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    return {
      words: words.length,
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      averageWordsPerSentence: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
      readingTime: Math.ceil(words.length / 200), // Assuming 200 words per minute
    };
  }
} 