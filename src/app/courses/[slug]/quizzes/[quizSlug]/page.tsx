'use client';

import { useState, useEffect } from 'react';
import { mockCanvasApi } from '@/lib/mockCanvasApi';
import { format } from 'date-fns';
import { ArrowLeft, Clock, Award, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: number;
  name: string;
  description: string;
  due_at: string;
  course_id: number;
  points_possible: number;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  attempts?: number;
  max_attempts?: number;
  time_limit?: number; // in minutes
  questions: QuizQuestion[];
}

interface Course {
  id: number;
  name: string;
  course_code: string;
}

export default function QuizPage({
  params,
}: {
  params: { slug: string; quizSlug: string };
}) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get course by slug
        const courseData = await mockCanvasApi.getCourse(params.slug);
        if (!courseData) {
          setError('Course not found');
          return;
        }
        setCourse(courseData);

        // Get quiz by name
        const quizData = await mockCanvasApi.getQuizByName(
          courseData.id,
          params.quizSlug
        );
        
        if (!quizData) {
          setError('Quiz not found');
          return;
        }
        
        setQuiz(quizData);
        
        // Check if quiz was already completed
        if (quizData.status === 'graded') {
          setIsSubmitted(true);
          setShowResults(true);
          // Load previous answers if available
          const savedAnswers = localStorage.getItem(`quiz-${quizData.id}-answers`);
          if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
          }
        }
        
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Error loading quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug, params.quizSlug]);

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeRemaining !== null && timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeRemaining, isSubmitted]);

  const startQuiz = () => {
    setQuizStarted(true);
    if (quiz?.time_limit) {
      setTimeRemaining(quiz.time_limit * 60); // Convert minutes to seconds
    }
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (isSubmitted) return;
    
    const newAnswers = { ...answers, [questionId]: answerIndex };
    setAnswers(newAnswers);
    
    // Save answers to localStorage
    localStorage.setItem(`quiz-${quiz?.id}-answers`, JSON.stringify(newAnswers));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const calculatedScore = Math.round((correctAnswers / quiz.questions.length) * quiz.points_possible);
    setScore(calculatedScore);
    setIsSubmitted(true);
    setShowResults(true);

    try {
      // Update quiz status in backend
      await mockCanvasApi.submitQuiz(quiz.id, answers, calculatedScore);
      setQuiz(prev => prev ? { ...prev, status: 'graded', grade: calculatedScore } : null);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const resetQuiz = () => {
    if (!quiz || (quiz.attempts || 0) >= (quiz.max_attempts || 1)) return;
    
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setShowResults(false);
    setScore(0);
    setQuizStarted(false);
    setTimeRemaining(null);
    localStorage.removeItem(`quiz-${quiz.id}-answers`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
        <Link
          href={`/courses/${params.slug}`}
          className="text-blue-500 hover:text-blue-600 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Course</span>
        </Link>
      </div>
    );
  }

  if (!quiz || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h1>
        <Link
          href={`/courses/${params.slug}`}
          className="text-blue-500 hover:text-blue-600 flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Course</span>
        </Link>
      </div>
    );
  }

  if (!quizStarted && !isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href={`/courses/${params.slug}`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.name}</h1>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700">{quiz.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Due Date</span>
                </div>
                <p className="text-gray-900 mt-2">
                  {format(new Date(quiz.due_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Points</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {quiz.points_possible}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Quiz Information</h3>
              <ul className="text-blue-800 space-y-1">
                <li>• {quiz.questions.length} questions</li>
                {quiz.time_limit && <li>• {quiz.time_limit} minute time limit</li>}
                <li>• {quiz.max_attempts || 1} attempt{(quiz.max_attempts || 1) > 1 ? 's' : ''} allowed</li>
                {quiz.attempts && <li>• You have used {quiz.attempts} attempt{quiz.attempts > 1 ? 's' : ''}</li>}
              </ul>
            </div>

            <button
              onClick={startQuiz}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              disabled={quiz.status === 'graded' && (quiz.attempts || 0) >= (quiz.max_attempts || 1)}
            >
              {quiz.status === 'graded' ? 'Retake Quiz' : 'Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const allQuestionsAnswered = quiz.questions.every(q => answers[q.id] !== undefined);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              href={`/courses/${params.slug}`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.name}</h1>
          </div>
          
          {timeRemaining !== null && !isSubmitted && (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {!isSubmitted && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <div className="flex space-x-2">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentQuestionIndex
                      ? 'bg-blue-500'
                      : answers[quiz.questions[index].id] !== undefined
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quiz Content */}
      {showResults ? (
        <div className="bg-white rounded-lg p-6 space-y-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              score >= quiz.points_possible * 0.7 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {score >= quiz.points_possible * 0.7 ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-lg text-gray-600">
              Your score: {score} / {quiz.points_possible} ({Math.round((score / quiz.points_possible) * 100)}%)
            </p>
          </div>

          {/* Results breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review Your Answers</h3>
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isCorrect ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-2">Q{index + 1}: {question.question}</p>
                      <div className="space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-800'
                                : optionIndex === userAnswer && !isCorrect
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-50'
                            }`}
                          >
                            {option}
                            {optionIndex === question.correctAnswer && ' ✓ (Correct)'}
                            {optionIndex === userAnswer && optionIndex !== question.correctAnswer && ' ✗ (Your answer)'}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-blue-800 text-sm">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4">
            {quiz.max_attempts && (quiz.attempts || 0) < quiz.max_attempts && (
              <button
                onClick={resetQuiz}
                className="flex items-center space-x-2 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Question {currentQuestionIndex + 1}</h2>
            <p className="text-lg text-gray-900 mb-6">{currentQuestion.question}</p>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  answers[currentQuestion.id] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-800"
            >
              Previous
            </button>

            <div className="flex space-x-4">
              {!isLastQuestion ? (
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
                  disabled={answers[currentQuestion.id] === undefined}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allQuestionsAnswered}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 