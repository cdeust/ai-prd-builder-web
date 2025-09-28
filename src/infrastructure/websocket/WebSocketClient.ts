import type { IWebSocketClient, WebSocketMessageHandler } from '../../domain/repositories/IWebSocketClient.ts';

export class WebSocketClient implements IWebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, WebSocketMessageHandler<any>[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private readonly baseURL: string) {}

  async connect(requestId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.baseURL}/api/v1/prd/ws/interactive/${requestId}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to:', url);
        this.reconnectAttempts = 0;
        setTimeout(() => resolve(), 100);
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[WebSocket ${timestamp}] Raw message received:`, event.data);

        try {
          if (typeof event.data === 'string' && !event.data.startsWith('{')) {
            console.log(`[WebSocket ${timestamp}] Plain text (ignoring):`, event.data);
            return;
          }

          const message = JSON.parse(event.data);
          console.log(`[WebSocket ${timestamp}] Parsed JSON:`, message);
          console.log(`[WebSocket ${timestamp}] Calling ${this.handlers.get(message.type)?.length || 0} handler(s) for type: ${message.type}`);
          this.handleMessage(message);
        } catch (error) {
          console.error(`[WebSocket ${timestamp}] Parse error:`, error);
          console.error(`[WebSocket ${timestamp}] Raw data:`, event.data);
        }
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        this.attemptReconnect(requestId);
      };
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send<T>(type: string, data?: T): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[WebSocket] Cannot send - readyState:', this.ws?.readyState);
      throw new Error('WebSocket not connected');
    }

    const message = { type, ...data };
    console.log('[WebSocket] Sending message:', message);
    this.ws.send(JSON.stringify(message));
  }

  onMessage<T>(type: string, handler: WebSocketMessageHandler<T>): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  clearHandlers(type?: string): void {
    if (type) {
      this.handlers.delete(type);
    } else {
      this.handlers.clear();
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private handleMessage(message: any): void {
    const { type, ...data } = message;
    console.log(`[WebSocket] handleMessage called for type: ${type}`);
    console.log(`[WebSocket] Available handler types:`, Array.from(this.handlers.keys()));
    const handlers = this.handlers.get(type);

    if (handlers && handlers.length > 0) {
      console.log(`[WebSocket] Executing ${handlers.length} handler(s) for type: ${type}`);
      handlers.forEach((handler, index) => {
        try {
          handler(data);
          console.log(`[WebSocket] Handler ${index + 1} executed successfully`);
        } catch (error) {
          console.error(`[WebSocket] Handler ${index + 1} threw error:`, error);
        }
      });
    } else {
      console.warn(`[WebSocket] No handlers registered for message type: ${type}`);
    }
  }

  private attemptReconnect(requestId: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`[WebSocket] Reconnect attempt ${this.reconnectAttempts}`);
        this.connect(requestId).catch(console.error);
      }, 1000 * this.reconnectAttempts);
    }
  }
}