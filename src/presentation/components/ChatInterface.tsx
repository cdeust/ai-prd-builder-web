import { useEffect, useRef } from 'react';
import { FileText, Smartphone, Layers, Users } from 'lucide-react';
import { useChatConversation } from '../hooks/useChatConversation.ts';
import { ChatMessageBubble } from './ChatMessageBubble.tsx';
import { ChatInput } from './ChatInput.tsx';
import { ClarificationPrompt } from './ClarificationPrompt.tsx';
import { PRDPreview } from './PRDPreview.tsx';
import './ChatInterface.css';

export function ChatInterface() {
  const {
    messages,
    isGenerating,
    currentPRD,
    pendingClarification,
    generationProgress,
    currentSection,
    sendMessage,
    answerClarification,
  } = useChatConversation();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or when the last message content is updated
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    // Delay slightly to ensure DOM updates
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, messages[messages.length - 1]?.content, messages.length]);

  // Force scroll on thinking messages
  useEffect(() => {
    const hasThinkingMessage = messages.some(m => m.type === 'thinking');
    if (hasThinkingMessage) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <div className="chat-interface">
      <div className="chat-panel">
        <div className="chat-header">
          <div className="chat-title-container">
            <h1>AI PRD Builder</h1>
            <span className="chat-badge">CHAT</span>
          </div>
          <div className="chat-meta">
            <span>Powered by AI</span>
            <span>•</span>
            <span>Create professional PRDs</span>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon">
                  <FileText size={40} strokeWidth={2} />
                </div>

                <h2>Let's Create Your PRD</h2>

                <p>
                  Describe your project in natural language, and I'll help you build a comprehensive Product Requirements Document in real-time.
                </p>

                <div className="examples-card">
                  <p className="examples-title">
                    <FileText size={14} className="inline-icon" />
                    Example Prompts
                  </p>
                  <ul className="examples-list">
                    <li className="example-item">
                      <Smartphone size={16} className="inline-icon" />
                      "Build a mobile app for tracking fitness goals"
                    </li>
                    <li className="example-item">
                      <Layers size={16} className="inline-icon" />
                      "Create a SaaS platform for project management"
                    </li>
                    <li className="example-item">
                      <Users size={16} className="inline-icon" />
                      "Design a social media app for pet owners"
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {messages
            .filter(message => message.type !== 'thinking')
            .map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}

          {messages
            .filter(message => message.type === 'thinking')
            .map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}

          <div ref={messagesEndRef} style={{ height: 1, minHeight: 1 }} />
        </div>

        <div className="chat-footer">
          <ChatInput
            onSend={pendingClarification ? answerClarification : sendMessage}
            disabled={isGenerating}
            placeholder={
              pendingClarification
                ? 'Type your answers here (one per line)...'
                : 'Describe your PRD requirements...'
            }
          />
        </div>
      </div>

      <div className="preview-panel">
        <PRDPreview
          prd={currentPRD}
          isGenerating={isGenerating}
          progress={generationProgress}
          currentSection={currentSection}
        />
      </div>
    </div>
  );
}