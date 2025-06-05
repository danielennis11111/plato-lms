import { AIDetectionService, AIDetectionResult } from './aiDetectionService';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

interface GradingCriteria {
  criterion: string;
  weight: number; // percentage of total grade
  description: string;
}

interface GradingResult {
  score: number; // 0-100
  breakdown: {
    criterion: string;
    score: number;
    feedback: string;
  }[];
  overallFeedback: string;
  suggestions: string[];
  passesThreshold: boolean; // true if score >= 70%
  aiDetection?: {
    isLikelyAIGenerated: boolean;
    confidence: number;
    warning: string;
    indicators: string[];
    flaggedReasons: string[];
  };
}

interface Assignment {
  id: number;
  name: string;
  description: string;
  points_possible: number;
  course_id: number;
}

export class AIGradingService {
  private static getGradingCriteria(assignment: Assignment): GradingCriteria[] {
    // Default criteria that can be customized per assignment type
    const defaultCriteria: GradingCriteria[] = [
      {
        criterion: "Content Quality",
        weight: 40,
        description: "Depth of understanding and accuracy of information"
      },
      {
        criterion: "Organization & Structure",
        weight: 25,
        description: "Logical flow and clear organization of ideas"
      },
      {
        criterion: "Writing Quality",
        weight: 20,
        description: "Grammar, clarity, and professional communication"
      },
      {
        criterion: "Requirements Adherence",
        weight: 15,
        description: "Following assignment instructions and meeting requirements"
      }
    ];

    // Customize criteria based on assignment type
    if (assignment.name.toLowerCase().includes('essay') || assignment.name.toLowerCase().includes('analysis')) {
      return [
        {
          criterion: "Thesis & Argument",
          weight: 35,
          description: "Clear thesis statement and well-developed arguments"
        },
        {
          criterion: "Evidence & Support",
          weight: 30,
          description: "Use of relevant examples, quotes, and supporting evidence"
        },
        {
          criterion: "Critical Analysis",
          weight: 20,
          description: "Depth of analysis and original insights"
        },
        {
          criterion: "Writing & Organization",
          weight: 15,
          description: "Clear writing, proper structure, and grammar"
        }
      ];
    }

    if (assignment.name.toLowerCase().includes('project') || assignment.name.toLowerCase().includes('implementation')) {
      return [
        {
          criterion: "Technical Implementation",
          weight: 45,
          description: "Correct implementation and functionality"
        },
        {
          criterion: "Code Quality",
          weight: 25,
          description: "Clean, readable, and well-documented code"
        },
        {
          criterion: "Problem Solving",
          weight: 20,
          description: "Approach to solving the problem and handling edge cases"
        },
        {
          criterion: "Documentation",
          weight: 10,
          description: "Clear explanations and documentation of the solution"
        }
      ];
    }

    if (assignment.name.toLowerCase().includes('discussion') || assignment.name.toLowerCase().includes('reflection')) {
      return [
        {
          criterion: "Engagement with Topic",
          weight: 40,
          description: "Demonstrates understanding and engagement with the topic"
        },
        {
          criterion: "Personal Reflection",
          weight: 30,
          description: "Thoughtful personal insights and connections"
        },
        {
          criterion: "Communication",
          weight: 20,
          description: "Clear and effective communication of ideas"
        },
        {
          criterion: "Length & Completeness",
          weight: 10,
          description: "Meets length requirements and addresses all parts"
        }
      ];
    }

    return defaultCriteria;
  }

  static async gradeSubmission(
    submission: string,
    assignment: Assignment,
    userAPIKey?: string
  ): Promise<GradingResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // First, check for AI-generated content
    const aiDetection = await AIDetectionService.detectAIContent(submission, userAPIKey);
    console.log('AI Detection Results:', aiDetection);
    
    const criteria = this.getGradingCriteria(assignment);
    const submissionLength = submission.length;
    const wordCount = submission.split(/\s+/).filter(word => word.length > 0).length;

    // Simple heuristic-based grading (in production, would use actual AI)
    const gradingResults = criteria.map(criterion => {
      let score = 0;
      let feedback = '';

      switch (criterion.criterion) {
        case "Content Quality":
        case "Engagement with Topic":
        case "Technical Implementation":
          // Grade based on length and keyword presence
          if (wordCount < 50) {
            score = 60;
            feedback = "Response is too brief. Consider expanding with more details and examples.";
          } else if (wordCount < 150) {
            score = 75;
            feedback = "Good start, but could benefit from more depth and specific examples.";
          } else if (wordCount < 300) {
            score = 85;
            feedback = "Well-developed response with good detail and understanding.";
          } else {
            score = 90;
            feedback = "Comprehensive and thorough response demonstrating strong understanding.";
          }
          break;

        case "Organization & Structure":
        case "Writing & Organization":
          // Check for paragraphs and structure
          const paragraphs = submission.split('\n\n').filter(p => p.trim().length > 0);
          if (paragraphs.length < 2) {
            score = 70;
            feedback = "Consider organizing your response into clear paragraphs for better readability.";
          } else if (paragraphs.length < 4) {
            score = 80;
            feedback = "Good organization. Consider adding more structure with clear topic sentences.";
          } else {
            score = 90;
            feedback = "Excellent organization with clear paragraph structure.";
          }
          break;

        case "Writing Quality":
        case "Communication":
          // Basic grammar and writing quality check
          const hasProperCapitalization = /[A-Z]/.test(submission);
          const hasPunctuation = /[.!?]/.test(submission);
          const hasVariedSentences = submission.split(/[.!?]/).length > 3;
          
          if (!hasProperCapitalization || !hasPunctuation) {
            score = 65;
            feedback = "Pay attention to basic writing mechanics like capitalization and punctuation.";
          } else if (!hasVariedSentences) {
            score = 75;
            feedback = "Good writing mechanics. Try varying your sentence structure for better flow.";
          } else {
            score = 85;
            feedback = "Clear and well-written response with good mechanics.";
          }
          break;

        case "Requirements Adherence":
        case "Length & Completeness":
          // Check if meets basic requirements
          const expectedMinWords = 100; // Can be customized per assignment
          if (wordCount < expectedMinWords * 0.5) {
            score = 50;
            feedback = "Response does not meet minimum length requirements.";
          } else if (wordCount < expectedMinWords * 0.8) {
            score = 70;
            feedback = "Response is somewhat short. Consider expanding to fully address the prompt.";
          } else {
            score = 85;
            feedback = "Meets length requirements and addresses the assignment prompt.";
          }
          break;

        case "Thesis & Argument":
          // Look for thesis-like statements
          const hasThesis = /\b(argue|believe|claim|thesis|position|maintain)\b/i.test(submission);
          if (hasThesis) {
            score = 85;
            feedback = "Clear argument or position presented.";
          } else {
            score = 70;
            feedback = "Consider stating your main argument or thesis more clearly.";
          }
          break;

        case "Evidence & Support":
          // Look for supporting evidence
          const hasEvidence = /\b(example|evidence|according to|research|study|shows)\b/i.test(submission);
          const hasQuotes = /"[^"]*"/.test(submission);
          if (hasQuotes || hasEvidence) {
            score = 85;
            feedback = "Good use of evidence and examples to support points.";
          } else {
            score = 70;
            feedback = "Consider adding specific examples or evidence to support your arguments.";
          }
          break;

        case "Critical Analysis":
        case "Problem Solving":
          // Look for analytical thinking
          const hasAnalysis = /\b(analyze|because|therefore|however|furthermore|moreover|consequently)\b/i.test(submission);
          if (hasAnalysis) {
            score = 80;
            feedback = "Shows analytical thinking and reasoning.";
          } else {
            score = 70;
            feedback = "Consider adding more analysis of why and how, not just what.";
          }
          break;

        case "Personal Reflection":
          // Look for personal insights
          const hasPersonal = /\b(I think|I believe|In my experience|personally|my view)\b/i.test(submission);
          if (hasPersonal) {
            score = 85;
            feedback = "Good personal reflection and insights.";
          } else {
            score = 70;
            feedback = "Consider adding more personal reflection and insights.";
          }
          break;

        default:
          score = 80;
          feedback = "Meets expectations for this criterion.";
      }

      // Add some randomness to make it feel more realistic (±5 points)
      score += (Math.random() - 0.5) * 10;
      score = Math.max(50, Math.min(100, Math.round(score)));

      return {
        criterion: criterion.criterion,
        score,
        feedback
      };
    });

    // Calculate weighted average
    let totalScore = gradingResults.reduce((sum, result, index) => {
      return sum + (result.score * criteria[index].weight / 100);
    }, 0);

    // Apply AI detection penalties
    let finalScore = Math.round(totalScore);
    if (aiDetection.isLikelyAIGenerated && aiDetection.confidence > 60) {
      // Significant penalty for likely AI content
      const penalty = Math.round(aiDetection.confidence * 0.5); // Up to 50% penalty
      finalScore = Math.max(0, finalScore - penalty);
    }

    const passesThreshold = finalScore >= 70;

    // Generate overall feedback
    let overallFeedback = '';
    if (aiDetection.isLikelyAIGenerated) {
      overallFeedback = `⚠️ ACADEMIC INTEGRITY CONCERN: ${AIDetectionService.generateIntegrityWarning(aiDetection)} `;
    }
    
    if (finalScore >= 90) {
      overallFeedback += "Excellent work! Your submission demonstrates strong understanding and meets all criteria at a high level.";
    } else if (finalScore >= 80) {
      overallFeedback += "Good work! Your submission shows solid understanding with room for minor improvements.";
    } else if (finalScore >= 70) {
      overallFeedback += "Satisfactory work. Your submission meets basic requirements but could be strengthened in several areas.";
    } else {
      overallFeedback += "Your submission needs significant improvement before final submission. Please review the feedback and revise.";
    }

    // Generate suggestions
    const suggestions: string[] = [];
    const lowScoringCriteria = gradingResults.filter(r => r.score < 75);
    
    if (lowScoringCriteria.length > 0) {
      suggestions.push(`Focus on improving: ${lowScoringCriteria.map(r => r.criterion).join(', ')}`);
    }
    
    if (wordCount < 150) {
      suggestions.push("Consider expanding your response with more details and examples");
    }
    
    if (!passesThreshold) {
      suggestions.push("Review the assignment requirements and ensure you're fully addressing the prompt");
      suggestions.push("Consider seeking help from your instructor or classmates");
    }

    const result = {
      score: finalScore,
      breakdown: gradingResults,
      overallFeedback,
      suggestions,
      passesThreshold,
      aiDetection: {
        isLikelyAIGenerated: aiDetection.isLikelyAIGenerated,
        confidence: aiDetection.confidence,
        warning: AIDetectionService.generateIntegrityWarning(aiDetection),
        indicators: aiDetection.indicators,
        flaggedReasons: aiDetection.flaggedReasons
      }
    };
    
    console.log('Final Grading Result with AI Detection:', result);
    return result;
  }

  // Enhanced grading with actual AI (when API key is available)
  static async gradeWithAI(
    submission: string,
    assignment: Assignment,
    apiKey: string
  ): Promise<GradingResult> {
    console.log('Using AI-powered grading with API key for enhanced analysis');
    
    // First run AI detection
    const aiDetection = await AIDetectionService.detectAIContent(submission, apiKey);
    console.log('AI Detection Results:', aiDetection);
    
    // Then perform sophisticated AI-powered grading
    try {
      const google = createGoogleGenerativeAI({ apiKey });
      const model = google('gemini-1.5-flash');
      
      const criteria = this.getGradingCriteria(assignment);
      const wordCount = submission.split(/\s+/).filter(word => word.length > 0).length;
      
      const gradingPrompt = `You are an expert educator grading student work. Provide detailed, constructive assessment that helps students improve while maintaining academic rigor.

## ASSIGNMENT CONTEXT:
- **Assignment**: ${assignment.name}
- **Description**: ${assignment.description}
- **Points Possible**: ${assignment.points_possible}
- **Word Count**: ${wordCount} words

## GRADING CRITERIA:
${criteria.map(c => `- **${c.criterion}** (${c.weight}%): ${c.description}`).join('\n')}

## ASSESSMENT GUIDELINES:

### 1. AUTHENTIC ENGAGEMENT ANALYSIS
- Does the student show genuine understanding or surface-level response?
- Are examples/experiences specific enough to be authentic?
- Does the writing reflect personal struggle, growth, or genuine insight?
- Look for signs of real learning vs. regurgitated information

### 2. CRITICAL THINKING EVALUATION
- Does the student synthesize information or just summarize?
- Are arguments well-developed with personal reasoning?
- Does the student show ability to connect concepts?
- Is there evidence of original thought and analysis?

### 3. ACADEMIC APPROPRIATENESS
- Is the response appropriate for the student's expected academic level?
- Does the sophistication match typical undergraduate work?
- Are there natural imperfections that indicate authentic student effort?

### 4. ASSIGNMENT-SPECIFIC ASSESSMENT
- How well does the submission address the specific prompt?
- Does it meet the learning objectives implied by the assignment?
- Is the response substantive enough for the points allocated?

## SUBMISSION TO GRADE:
"${submission}"

## AI DETECTION CONTEXT:
${aiDetection.isLikelyAIGenerated 
  ? `⚠️ AI CONTENT DETECTED (${aiDetection.confidence}% confidence). Consider this in your assessment. Likely AI indicators: ${aiDetection.indicators.join(', ')}`
  : `✅ Content appears human-generated (${100 - aiDetection.confidence}% confidence). Human indicators: ${aiDetection.indicators.join(', ')}`
}

Respond with ONLY a JSON object in this exact format:
{
  "criteriaScores": [
    {
      "criterion": "exact criterion name",
      "score": number from 0-100,
      "feedback": "specific, constructive feedback",
      "strengths": ["what the student did well"],
      "improvements": ["specific areas to improve"]
    }
  ],
  "overallScore": number from 0-100,
  "overallFeedback": "comprehensive assessment with encouragement and guidance",
  "suggestions": ["specific, actionable suggestions for improvement"],
  "academicIntegrityNotes": "any concerns about authenticity or AI use"
}`;

      const gradingResult = await generateText({
        model,
        prompt: gradingPrompt,
        maxTokens: 2000,
        temperature: 0.2,
      });

      try {
        // Clean response
        let cleanedText = gradingResult.text.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const aiGrading = JSON.parse(cleanedText);
        
        // Apply AI detection penalties
        let finalScore = aiGrading.overallScore;
        if (aiDetection.isLikelyAIGenerated && aiDetection.confidence > 60) {
          const penalty = Math.round(aiDetection.confidence * 0.6); // Up to 60% penalty
          finalScore = Math.max(0, finalScore - penalty);
        }

        // Format the response
        const breakdown = aiGrading.criteriaScores.map((criterion: any) => ({
          criterion: criterion.criterion,
          score: criterion.score,
          feedback: `${criterion.feedback} Strengths: ${criterion.strengths.join(', ')}. Areas for improvement: ${criterion.improvements.join(', ')}.`
        }));

        let overallFeedback = '';
        if (aiDetection.isLikelyAIGenerated) {
          overallFeedback = `⚠️ ACADEMIC INTEGRITY CONCERN: ${AIDetectionService.generateIntegrityWarning(aiDetection)} `;
        }
        overallFeedback += aiGrading.overallFeedback;
        
        if (aiGrading.academicIntegrityNotes) {
          overallFeedback += ` Academic Integrity Notes: ${aiGrading.academicIntegrityNotes}`;
        }

        return {
          score: finalScore,
          breakdown,
          overallFeedback,
          suggestions: aiGrading.suggestions || [],
          passesThreshold: finalScore >= 70,
          aiDetection: {
            isLikelyAIGenerated: aiDetection.isLikelyAIGenerated,
            confidence: aiDetection.confidence,
            warning: AIDetectionService.generateIntegrityWarning(aiDetection),
            indicators: aiDetection.indicators,
            flaggedReasons: aiDetection.flaggedReasons
          }
        };

      } catch (parseError) {
        console.error('Failed to parse AI grading response:', parseError);
        console.error('Raw grading response:', gradingResult.text);
        
        // Fall back to heuristic grading with AI detection
        const fallbackResult = await this.gradeSubmission(submission, assignment, apiKey);
        return {
          ...fallbackResult,
          overallFeedback: `AI grading failed, using fallback analysis. ${fallbackResult.overallFeedback}`
        };
      }

    } catch (error) {
      console.error('AI grading failed:', error);
      return this.gradeSubmission(submission, assignment, apiKey);
    }
  }
} 