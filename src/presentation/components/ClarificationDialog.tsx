import { useState, FormEvent } from 'react';

interface ClarificationDialogProps {
  questions: string[];
  onSubmit: (answers: string[]) => void;
}

export function ClarificationDialog({ questions, onSubmit }: ClarificationDialogProps) {
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        width: '90%',
      }}>
        <h2>Clarification Required</h2>
        <form onSubmit={handleSubmit}>
          {questions.map((question, index) => (
            <div key={index} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                {question}
              </label>
              <textarea
                value={answers[index]}
                onChange={(e) => updateAnswer(index, e.target.value)}
                required
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>
          ))}
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Submit Answers
          </button>
        </form>
      </div>
    </div>
  );
}