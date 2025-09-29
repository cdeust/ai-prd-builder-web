export interface PRDWebSocketMessage {
  type: 'status' | 'progress' | 'clarification' | 'section' | 'complete' | 'error' |
        'professionalAnalysis' | 'architecturalConflict' | 'technicalChallenge' | 'complexityScore';
  data: any;
}

export class PRDWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    private readonly baseUrl: string,
    private readonly onMessage: (message: PRDWebSocketMessage) => void,
    private readonly onError?: (error: Event) => void,
    private readonly onClose?: () => void
  ) {}

  connect(requestId: string): void {
    const wsUrl = this.baseUrl.replace(/^http/, 'ws').replace(/^https/, 'wss') + `/api/v1/prd/ws/${requestId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to:', wsUrl);
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          console.log('[WebSocket] Raw message:', event.data);
          const message: PRDWebSocketMessage = JSON.parse(event.data);
          console.log('[WebSocket] Parsed message:', message);
          this.onMessage(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error, event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.onError?.(error);
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed', event.code, event.reason);

        if (event.code !== 1000 && event.code !== 1005) {
          this.attemptReconnect(requestId);
        }

        this.onClose?.();
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      this.onError?.(error as Event);
    }
  }

  private attemptReconnect(requestId: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

      setTimeout(() => {
        this.connect(requestId);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('[WebSocket] Max reconnection attempts reached');
    }
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message, connection not open');
    }
  }

  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts;
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}