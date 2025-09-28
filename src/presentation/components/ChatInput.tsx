import { useState, KeyboardEvent, FormEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Describe your PRD requirements in natural language...',
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={3}
          className="chat-textarea"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="send-button"
        >
          {disabled ? (
            <>
              <Loader2 size={18} className="button-icon spinning" />
              Working...
            </>
          ) : (
            <>
              <Send size={18} className="button-icon" />
              Send
            </>
          )}
        </button>
      </div>
      <p className="input-hint">
        Press Enter to send · Shift+Enter for new line
      </p>
    </form>
  );
}