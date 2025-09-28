export interface WebSocketMessageHandler<T = unknown> {
  (data: T): void;
}

export interface IWebSocketClient {
  connect(requestId: string): Promise<void>;
  disconnect(): void;
  send<T>(type: string, data?: T): void;
  onMessage<T>(type: string, handler: WebSocketMessageHandler<T>): void;
  isConnected(): boolean;
}