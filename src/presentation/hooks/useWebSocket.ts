import { useState, useEffect, useCallback } from 'react';
import { DIContainer } from '../../shared/DIContainer.ts';
import { PRDDocument } from '../../domain/entities/PRDDocument.ts';

interface WebSocketState {
  isConnected: boolean;
  questions: string[];
  progress: number;
  status: string;
  document: PRDDocument | null;
  error: string | null;
}

export function useWebSocket(requestId: string | null) {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    questions: [],
    progress: 0,
    status: '',
    document: null,
    error: null,
  });

  const container = DIContainer.getInstance();
  const wsClient = container.getWebSocketClient();

  useEffect(() => {
    if (!requestId) return;

    wsClient.connect(requestId)
      .then(() => {
        setState(prev => ({ ...prev, isConnected: true }));
      })
      .catch(error => {
        setState(prev => ({ ...prev, error: error.message }));
      });

    wsClient.onMessage('progress', (data: any) => {
      setState(prev => ({
        ...prev,
        progress: data.progress || 0,
        status: data.status || '',
      }));
    });

    wsClient.onMessage('clarification_needed', (data: any) => {
      setState(prev => ({
        ...prev,
        questions: data.questions || [],
      }));
    });

    wsClient.onMessage('completed', (data: any) => {
      setState(prev => ({
        ...prev,
        document: data.document || null,
        progress: 100,
        status: 'completed',
      }));
    });

    wsClient.onMessage('error', (data: any) => {
      setState(prev => ({
        ...prev,
        error: data.message || 'Unknown error',
        status: 'failed',
      }));
    });

    return () => {
      wsClient.disconnect();
    };
  }, [requestId]);

  const clearQuestions = useCallback(() => {
    setState(prev => ({ ...prev, questions: [] }));
  }, []);

  return {
    ...state,
    clearQuestions,
  };
}