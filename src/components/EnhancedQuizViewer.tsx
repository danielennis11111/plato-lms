'use client';
import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Award } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: number | string;
  explanation: string;
  points: number;
}

interface QuizDetails {
  time_limit: number;
  allowed_attempts: number;
  questions: QuizQuestion[];
  instructions?: string;
  passing_score?: number;
}

interface EnhancedQuizViewerProps {
  title: string;
  quiz_details?: QuizDetails;
  onSubmit?: (answers: Record<number, any>, score: number) => void;
}

export default function EnhancedQuizViewer({ title, quiz_details, onSubmit }: EnhancedQuizViewerProps) {
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  if (!quiz_details) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">Quiz content is not available at this time.</p>
      </div>
    );
  }

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz_details.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        if (userAnswer === question.correct_answer) {
          earnedPoints += question.points;
        }
      } else if (question.type === 'short_answer') {
        // For short answer, we'll do a simple case-insensitive match
        const correctAnswer = String(question.correct_answer).toLowerCase().trim();
        const userAnswerStr = String(userAnswer || '').toLowerCase().trim();
        if (userAnswerStr === correctAnswer) {
          earnedPoints += question.points;
        }
      }
    });

    return {
      earned: earnedPoints,
      total: totalPoints,
      percentage: Math.round((earnedPoints / totalPoints) * 100)
    };
  };

  const handleSubmit = () => {
    const score = calculateScore();
    setSubmitted(true);
    setShowExplanations(true);
    if (onSubmit) {
      onSubmit(answers, score.percentage);
    }
  };

  const isAnswerCorrect = (question: QuizQuestion) => {
    const userAnswer = answers[question.id];
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      return userAnswer === question.correct_answer;
    } else if (question.type === 'short_answer') {
      const correctAnswer = String(question.correct_answer).toLowerCase().trim();
      const userAnswerStr = String(userAnswer || '').toLowerCase().trim();
      return userAnswerStr === correctAnswer;
    }
    return false;
  };

  const score = submitted ? calculateScore() : null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Time Limit: {quiz_details.time_limit} minutes</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>Attempts: {quiz_details.allowed_attempts}</span>
          </div>
          {quiz_details.passing_score && (
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>Passing Score: {quiz_details.passing_score}%</span>
            </div>
          )}
        </div>

        {quiz_details.instructions && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <p className="text-blue-800">{quiz_details.instructions}</p>
          </div>
        )}
      </div>

      {/* Score Display */}
      {submitted && score && (
        <div className={`p-4 rounded-lg mb-6 ${
          score.percentage >= (quiz_details.passing_score || 70) 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {score.percentage >= (quiz_details.passing_score || 70) ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <h3 className="text-lg font-semibold">
              {score.percentage >= (quiz_details.passing_score || 70) ? 'Passed!' : 'Did not pass'}
            </h3>
          </div>
          <p className="text-lg">
            Score: {score.earned}/{score.total} points ({score.percentage}%)
          </p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {quiz_details.questions.map((question, index) => (
          <div key={question.id} className={`p-6 border rounded-lg ${
            submitted ? (isAnswerCorrect(question) ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') : 'border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Question {index + 1}
              </h3>
              <span className="text-sm text-gray-600 font-medium">
                {question.points} {question.points === 1 ? 'point' : 'points'}
              </span>
            </div>
            
            <p className="text-gray-800 mb-4">{question.question}</p>

            {/* Answer Options */}
            {question.type === 'multiple_choice' && question.options && (
              <div className="space-y-2 mb-4">
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    submitted 
                      ? (optionIndex === question.correct_answer 
                          ? 'bg-green-100 border-green-300' 
                          : (answers[question.id] === optionIndex && optionIndex !== question.correct_answer 
                              ? 'bg-red-100 border-red-300' 
                              : 'bg-gray-50 border-gray-200'))
                      : (answers[question.id] === optionIndex 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100')
                  }`}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={optionIndex}
                      checked={answers[question.id] === optionIndex}
                      onChange={() => handleAnswerChange(question.id, optionIndex)}
                      disabled={submitted}
                      className="text-blue-600"
                    />
                    <span className="text-gray-800">{option}</span>
                    {submitted && optionIndex === question.correct_answer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {submitted && answers[question.id] === optionIndex && optionIndex !== question.correct_answer && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {question.type === 'true_false' && (
              <div className="space-y-2 mb-4">
                {['True', 'False'].map((option, optionIndex) => (
                  <label key={optionIndex} className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    submitted 
                      ? (optionIndex === question.correct_answer 
                          ? 'bg-green-100 border-green-300' 
                          : (answers[question.id] === optionIndex && optionIndex !== question.correct_answer 
                              ? 'bg-red-100 border-red-300' 
                              : 'bg-gray-50 border-gray-200'))
                      : (answers[question.id] === optionIndex 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100')
                  }`}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={optionIndex}
                      checked={answers[question.id] === optionIndex}
                      onChange={() => handleAnswerChange(question.id, optionIndex)}
                      disabled={submitted}
                      className="text-blue-600"
                    />
                    <span className="text-gray-800">{option}</span>
                    {submitted && optionIndex === question.correct_answer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {submitted && answers[question.id] === optionIndex && optionIndex !== question.correct_answer && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {question.type === 'short_answer' && (
              <div className="mb-4">
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={submitted}
                  placeholder="Enter your answer here..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  rows={3}
                />
                {submitted && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <strong>Correct Answer:</strong> {question.correct_answer}
                  </div>
                )}
              </div>
            )}

            {/* Explanation */}
            {submitted && showExplanations && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                <p className="text-blue-800">{question.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < quiz_details.questions.length}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            Submit Quiz
          </button>
        </div>
      )}

      {submitted && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
              setShowExplanations(false);
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
          >
            Reset Quiz
          </button>
        </div>
      )}
    </div>
  );
} 