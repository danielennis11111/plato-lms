import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export interface AIDetectionResult {
  isLikelyAIGenerated: boolean;
  confidence: number; // 0-100
  indicators: string[];
  humanLikelihoodScore: number; // 0-100
  detectionMethod: 'heuristic' | 'ai-powered';
  flaggedReasons: string[];
}

export class AIDetectionService {
  // Patterns that commonly indicate AI-generated content
  private static AI_INDICATORS = {
    // Common AI phrases and structures
    phrases: [
      'in conclusion',
      'in summary',
      'furthermore',
      'moreover',
      'additionally',
      'as an ai',
      'i would be happy to',
      'i apologize',
      'i understand',
      'it is important to note',
      'it is worth noting',
      'it should be noted',
      'in this regard',
      'with regard to',
      'in terms of',
      'on the other hand',
      'however',
      'nevertheless',
      'notwithstanding'
    ],
    
    // Overly formal academic language patterns
    formalPatterns: [
      /\bit is imperative that\b/gi,
      /\bone must consider\b/gi,
      /\bit is crucial to understand\b/gi,
      /\bin order to\b/gi,
      /\bdue to the fact that\b/gi,
      /\bin the event that\b/gi,
      /\bby virtue of\b/gi,
      /\bfor the purpose of\b/gi
    ],
    
    // Perfect grammar indicators (too perfect for student writing)
    perfectGrammar: [
      // No contractions (very formal)
      /\b(do not|does not|did not|will not|would not|should not|could not|cannot)\b/g,
      // Perfect semicolon usage
      /;[^;]*;/g,
      // Complex subordinating conjunctions
      /\b(whereas|inasmuch|insofar|notwithstanding|albeit)\b/gi
    ]
  };

  /**
   * Analyze text for AI-generated content using heuristics
   */
  static analyzeWithHeuristics(text: string): AIDetectionResult {
    const indicators: string[] = [];
    const flaggedReasons: string[] = [];
    let suspicionScore = 0;

    // Check for common AI phrases
    const aiPhraseCount = this.AI_INDICATORS.phrases.filter(phrase => 
      text.toLowerCase().includes(phrase.toLowerCase())
    ).length;
    
    if (aiPhraseCount >= 6) {
      suspicionScore += 40;
      indicators.push(`Very high use of AI-common phrases (${aiPhraseCount} found)`);
      flaggedReasons.push('Contains many phrases commonly used by AI models');
    } else if (aiPhraseCount >= 3) {
      suspicionScore += 25;
      indicators.push(`High use of AI-common phrases (${aiPhraseCount} found)`);
      flaggedReasons.push('Contains multiple phrases commonly used by AI models');
    } else if (aiPhraseCount >= 1) {
      suspicionScore += 10;
      indicators.push(`Some AI-common phrases detected (${aiPhraseCount} found)`);
    }

    // Check for overly formal patterns
    const formalPatternCount = this.AI_INDICATORS.formalPatterns.filter(pattern => 
      pattern.test(text)
    ).length;
    
    if (formalPatternCount > 2) {
      suspicionScore += 25;
      indicators.push(`Overly formal academic language (${formalPatternCount} patterns)`);
      flaggedReasons.push('Uses excessively formal language patterns');
    }

    // Check for perfect grammar indicators
    const perfectGrammarCount = this.AI_INDICATORS.perfectGrammar.filter(pattern => 
      pattern.test(text)
    ).length;
    
    if (perfectGrammarCount > 2) {
      suspicionScore += 20;
      indicators.push('Unusually perfect grammar and syntax');
      flaggedReasons.push('Grammar and syntax appear too polished for typical student writing');
    }

    // Check for repetitive structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    
    if (avgSentenceLength > 120) {
      suspicionScore += 15;
      indicators.push('Unusually long average sentence length');
      flaggedReasons.push('Sentences are longer and more complex than typical student writing');
    }

    // Check for overly polished writing (AI characteristic)
    const hasPersonalPronouns = /\b(I|me|my|mine|myself)\b/i.test(text);
    const hasTypos = /\b(teh|recieve|seperate|occured|definately)\b/i.test(text);
    const hasInformalLanguage = /\b(really|pretty|kinda|sorta|like|actually|basically)\b/i.test(text);
    
    // Even with personal pronouns, check for overly polished prose
    if (!hasTypos && text.length > 200) {
      suspicionScore += 15;
      indicators.push('Unusually polished writing without typical errors');
      flaggedReasons.push('Text lacks natural writing imperfections common in student work');
    }
    
    // Additional check for perfect narrative structure (very AI-like)
    const hasNarrativeMarkers = /\b(turning point|that was the moment|over time|gradually|today|one thing is certain)\b/gi.test(text);
    if (hasNarrativeMarkers && text.length > 300) {
      suspicionScore += 20;
      indicators.push('Classic AI narrative structure with dramatic transitions');
      flaggedReasons.push('Contains narrative patterns typical of AI-generated personal essays');
    }

    // Check for consistent high-level vocabulary throughout
    const complexWords = text.match(/\b\w{9,}\b/g)?.length || 0;
    const totalWords = text.split(/\s+/).length;
    const complexWordRatio = complexWords / totalWords;
    
    if (complexWordRatio > 0.15) {
      suspicionScore += 15;
      indicators.push('High ratio of complex vocabulary');
      flaggedReasons.push('Uses consistently advanced vocabulary beyond typical student level');
    }

    const isLikelyAIGenerated = suspicionScore > 50;
    const confidence = Math.min(100, suspicionScore);
    const humanLikelihoodScore = Math.max(0, 100 - suspicionScore);

    return {
      isLikelyAIGenerated,
      confidence,
      indicators,
      humanLikelihoodScore,
      detectionMethod: 'heuristic',
      flaggedReasons
    };
  }

  /**
   * Enhanced AI detection using actual AI analysis
   */
  static async analyzeWithAI(text: string, apiKey: string): Promise<AIDetectionResult> {
    if (!apiKey || !text.trim()) {
      return this.analyzeWithHeuristics(text);
    }

    try {
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
      });

      const model = google('gemini-1.5-flash');

      const prompt = `You are an expert forensic linguist specializing in AI-generated text detection. Your goal is to identify subtle patterns that distinguish AI writing from authentic student work. Modern AI can mimic personal stories and emotions, so focus on deeper linguistic forensics.

## CRITICAL AI DETECTION CRITERIA:

### 1. STATISTICAL LANGUAGE PATTERNS
- **Lexical diversity**: AI often has unnaturally consistent vocabulary sophistication
- **Sentence rhythm**: AI tends toward predictable sentence length patterns
- **Transitional uniformity**: Overuse of connective phrases ("Furthermore," "Moreover," "Additionally")
- **Emotional escalation**: AI builds emotional intensity in predictable arcs

### 2. STRUCTURAL RED FLAGS
- **Perfect narrative progression**: Beginning struggle → middle realization → end transformation
- **Balanced paragraph lengths**: AI rarely varies paragraph structure naturally
- **Generic specific details**: Details that sound specific but could apply to anyone
- **Absence of tangents**: Real students often go off-topic or include irrelevant details

### 3. COGNITIVE AUTHENTICITY MARKERS
- **Genuine uncertainty**: Real students show doubt, confusion, or conflicting thoughts
- **Inconsistent quality**: Human writing has uneven moments of brilliance and weakness
- **Personal contradictions**: Real people contradict themselves or change views mid-text
- **Authentic mistakes**: Not just typos, but flawed logic or incomplete thoughts

### 4. ASSIGNMENT-SPECIFIC INDICATORS
- **Surface-level engagement**: AI often provides textbook responses without deep personal connection
- **Template responses**: Following common essay structures too precisely
- **Manufactured authenticity**: Stories that hit all the "right" emotional beats
- **Absence of academic struggle**: Real students show uncertainty about concepts

### 5. MODERN AI SOPHISTICATION AWARENESS
- **Don't be fooled by**: Personal pronouns, emotional language, specific details, narrative structure
- **Focus on**: Linguistic consistency, cognitive authenticity, natural imperfections
- **Remember**: ChatGPT/Claude can easily generate convincing personal narratives

## ANALYSIS INSTRUCTIONS:
1. **Linguistic Forensics**: Analyze sentence patterns, word choice consistency, transitional phrase usage
2. **Cognitive Authenticity**: Look for genuine uncertainty, contradictions, incomplete thoughts
3. **Assignment Engagement**: Assess depth of personal connection vs. surface-level response
4. **Statistical Analysis**: Evaluate vocabulary consistency and structural patterns

Text to analyze:
"${text}"

Provide a forensic analysis focused on linguistic patterns rather than content believability. Modern AI can fake personal stories—focus on how the text was constructed, not what it says.

Respond with ONLY a JSON object in this exact format:
{
  "isLikelyAIGenerated": true or false,
  "confidence": number from 0-100,
  "humanLikelihoodScore": number from 0-100,
  "indicators": ["specific linguistic patterns detected"],
  "flaggedReasons": ["forensic linguistic reasoning for determination"]
}`;

      const result = await generateText({
        model,
        prompt,
        maxTokens: 1000,
        temperature: 0.1,
      });

      try {
        // Clean the response text to handle markdown code blocks
        let cleanedText = result.text.trim();
        
        // Remove markdown code blocks if present
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        console.log('Cleaned AI response:', cleanedText);
        const analysis = JSON.parse(cleanedText);
        
        return {
          isLikelyAIGenerated: analysis.isLikelyAIGenerated,
          confidence: Math.max(0, Math.min(100, analysis.confidence)),
          indicators: Array.isArray(analysis.indicators) ? analysis.indicators : [],
          humanLikelihoodScore: Math.max(0, Math.min(100, analysis.humanLikelihoodScore)),
          detectionMethod: 'ai-powered',
          flaggedReasons: Array.isArray(analysis.flaggedReasons) ? analysis.flaggedReasons : []
        };
      } catch (parseError) {
        console.error('Failed to parse AI detection response:', parseError);
        console.error('Raw response text:', result.text);
        return this.analyzeWithHeuristics(text);
      }
    } catch (error) {
      console.error('AI detection failed, falling back to heuristics:', error);
      return this.analyzeWithHeuristics(text);
    }
  }

  /**
   * Main detection method that chooses between heuristic and AI analysis
   */
  static async detectAIContent(text: string, apiKey?: string): Promise<AIDetectionResult> {
    if (apiKey) {
      return this.analyzeWithAI(text, apiKey);
    } else {
      return this.analyzeWithHeuristics(text);
    }
  }

  /**
   * Generate academic integrity warning message
   */
  static generateIntegrityWarning(detection: AIDetectionResult): string {
    if (!detection.isLikelyAIGenerated) {
      return '';
    }

    const severityLevel = detection.confidence > 80 ? 'high' : detection.confidence > 60 ? 'medium' : 'low';
    
    const warnings = {
      high: "⚠️ HIGH CONFIDENCE: This submission shows strong indicators of AI-generated content. Please review your institution's academic integrity policy regarding AI assistance.",
      medium: "⚠️ MEDIUM CONFIDENCE: This submission contains several patterns commonly found in AI-generated text. Consider reviewing for originality.",
      low: "⚠️ LOW CONFIDENCE: Some elements suggest possible AI assistance. Ensure your work represents your own understanding and effort."
    };

    return warnings[severityLevel as keyof typeof warnings];
  }
} 