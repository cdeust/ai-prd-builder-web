export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageType =
  | 'text'
  | 'thinking'
  | 'clarification'
  | 'complete'
  | 'error';

export interface ChatMessageProps {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: Date;
  questions?: string[];
  isStreaming?: boolean;
}

export class ChatMessage {
  private constructor(private readonly props: ChatMessageProps) {}

  static create(props: ChatMessageProps): ChatMessage {
    return new ChatMessage(props);
  }

  static createUserMessage(content: string): ChatMessage {
    return new ChatMessage({
      id: crypto.randomUUID(),
      role: 'user',
      type: 'text',
      content,
      timestamp: new Date(),
    });
  }

  static createAssistantMessage(content: string, type: MessageType = 'text'): ChatMessage {
    return new ChatMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      type,
      content,
      timestamp: new Date(),
    });
  }

  static createClarificationMessage(questions: string[]): ChatMessage {
    return new ChatMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      type: 'clarification',
      content: 'I need clarification on the following:',
      questions,
      timestamp: new Date(),
    });
  }

  static createThinkingMessage(content: string): ChatMessage {
    return new ChatMessage({
      id: crypto.randomUUID(),
      role: 'assistant',
      type: 'thinking',
      content,
      timestamp: new Date(),
      isStreaming: true,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get role(): MessageRole {
    return this.props.role;
  }

  get type(): MessageType {
    return this.props.type;
  }

  get content(): string {
    return this.props.content;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get questions(): string[] | undefined {
    return this.props.questions;
  }

  get isStreaming(): boolean {
    return this.props.isStreaming || false;
  }

  withContent(content: string): ChatMessage {
    return new ChatMessage({
      ...this.props,
      content,
    });
  }

  stopStreaming(): ChatMessage {
    return new ChatMessage({
      ...this.props,
      isStreaming: false,
    });
  }
}