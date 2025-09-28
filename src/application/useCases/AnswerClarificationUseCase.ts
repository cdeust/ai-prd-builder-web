import type { IWebSocketClient } from '../../domain/repositories/IWebSocketClient.ts';

export class AnswerClarificationUseCase {
  constructor(private readonly webSocketClient: IWebSocketClient) {}

  execute(answers: string[]): void {
    if (!this.webSocketClient.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    this.webSocketClient.send('clarification_answers', { answers });
  }
}