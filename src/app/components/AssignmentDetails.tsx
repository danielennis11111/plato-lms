import React from 'react';
import { format } from 'date-fns';

interface AssignmentDetailsProps {
  assignment: {
    id: number;
    name: string;
    description: string;
    due_at: string;
    points_possible: number;
    submission_type: string;
    status: 'todo' | 'in_progress' | 'completed';
    quiz_details?: {
      time_limit: number;
      allowed_attempts: number;
      questions: Array<{
        id: number;
        question: string;
        type: string;
        options: string[];
        correct_answer: number;
        points: number;
      }>;
    };
    requirements?: string[];
    rubric?: Array<{
      criterion: string;
      points: number;
      description: string;
    }>;
  };
}

export default function AssignmentDetails({ assignment }: AssignmentDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.name}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Due: {format(new Date(assignment.due_at), 'MMM d, yyyy h:mm a')}</span>
          <span>Points: {assignment.points_possible}</span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {assignment.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="prose max-w-none mb-6">
        <p className="text-gray-700">{assignment.description}</p>
      </div>

      {assignment.quiz_details && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Time Limit</span>
                <p className="text-gray-900">{assignment.quiz_details.time_limit} minutes</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Allowed Attempts</span>
                <p className="text-gray-900">{assignment.quiz_details.allowed_attempts}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Questions</h3>
              <div className="space-y-4">
                {assignment.quiz_details.questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-lg p-4 shadow">
                    <p className="font-medium mb-2">{index + 1}. {question.question}</p>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            className="h-4 w-4 text-blue-600"
                            disabled
                          />
                          <label className="ml-2 text-gray-700">{option}</label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Points: {question.points}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {assignment.requirements && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {assignment.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {assignment.rubric && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Grading Rubric</h2>
          <div className="space-y-4">
            {assignment.rubric.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">{item.criterion}</h3>
                  <span className="text-sm font-medium text-blue-600">{item.points} points</span>
                </div>
                <p className="text-gray-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 