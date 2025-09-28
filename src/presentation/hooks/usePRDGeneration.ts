import { useState } from 'react';
import { DIContainer } from '../../shared/DIContainer.ts';
import type { CreatePRDRequestDTO } from '../../domain/repositories/IPRDRepository.ts';

export function usePRDGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const container = DIContainer.getInstance();
  const generateUseCase = container.generatePRDUseCase;

  const submit = async (data: CreatePRDRequestDTO) => {
    setIsLoading(true);
    setError(null);

    try {
      const request = await generateUseCase.execute(data);
      setRequestId(request.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PRD');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submit,
    isLoading,
    error,
    requestId,
  };
}