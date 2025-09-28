import { useState } from 'react';

interface ClarificationPromptProps {
  questions: string[];
  onSubmit: (answers: string[]) => void;
  disabled?: boolean;
}

export function ClarificationPrompt({
  questions,
  onSubmit,
  disabled = false,
}: ClarificationPromptProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''));

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const validAnswers = answers.filter(a => a.trim());
    if (validAnswers.length > 0 && !disabled) {
      onSubmit(answers);
    }
  };

  const allAnswered = answers.every(a => a.trim());

  return (
    <div className="border-t border-blue-200 bg-blue-50 p-4">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">
        Please answer these clarifications
      </h3>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              {index + 1}. {question}
            </label>
            <input
              type="text"
              value={answers[index]}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              disabled={disabled}
              className="w-full rounded-lg border border-blue-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Your answer..."
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={disabled || !allAnswered}
        className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {disabled ? 'Submitting...' : 'Submit Answers'}
      </button>
    </div>
  );
}