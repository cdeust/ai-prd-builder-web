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
    sendMessage,
    answerClarification,
  } = useChatConversation();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-interface">
      <div className="chat-panel">
        <div className="chat-header">
          <h1>AI PRD Builder</h1>
          <p>Powered by AI · Create professional PRDs in minutes</p>
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

          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}

          <div ref={messagesEndRef} />
        </div>

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

      <div className="preview-panel">
        <PRDPreview prd={currentPRD} />
      </div>
    </div>
  );
}