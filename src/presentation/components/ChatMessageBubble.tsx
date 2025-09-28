import { ChatMessage } from '../../domain/valueObjects/ChatMessage.ts';
import './ChatMessageBubble.css';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  const isThinking = message.type === 'thinking';
  const isError = message.type === 'error';
  const isClarification = message.type === 'clarification';

  const containerClass = `message-container ${isUser ? 'user' : 'assistant'}`;
  const bubbleClass = `message-bubble ${
    isUser
      ? 'user'
      : isError
      ? 'error'
      : isThinking
      ? 'thinking'
      : 'assistant'
  }`;

  return (
    <div className={containerClass}>
      <div className={bubbleClass}>
        {isThinking && message.isStreaming && (
          <div className="thinking-indicator">
            <div className="thinking-dots">
              <span className="thinking-dot"></span>
              <span className="thinking-dot"></span>
              <span className="thinking-dot"></span>
            </div>
            <span className="thinking-text">{message.content}</span>
          </div>
        )}

        {!isThinking && (
          <div className="message-content">{message.content}</div>
        )}

        {isClarification && message.questions && (
          <ul className="clarification-questions">
            {message.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        )}

        <div className="message-timestamp">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}