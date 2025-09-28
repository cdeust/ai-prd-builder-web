import { useState, useEffect } from 'react';
import { DIContainer } from '../../shared/DIContainer.ts';
import { PRDRequest } from '../../domain/entities/PRDRequest.ts';

export function usePRDRequest(requestId: string | null) {
  const [request, setRequest] = useState<PRDRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const container = DIContainer.getInstance();
  const getRequestUseCase = container.getPRDRequestUseCase;

  const refresh = async () => {
    if (!requestId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getRequestUseCase.execute(requestId);
      setRequest(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [requestId]);

  return {
    request,
    loading,
    error,
    refresh,
  };
}