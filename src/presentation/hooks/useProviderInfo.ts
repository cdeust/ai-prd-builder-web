import { useState, useEffect } from 'react';

export interface AvailableProvider {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  priority: number;
  requiresApiKey: boolean;
  model?: string;
}

export function useAvailableProviders() {
  const [providers, setProviders] = useState<AvailableProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/prd/providers/available`);

        if (!response.ok) {
          throw new Error('Failed to fetch available providers');
        }

        const data: { providers: AvailableProvider[] } = await response.json();
        setProviders(data.providers);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch providers:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Set default fallback
        setProviders([{
          id: 'native',
          name: 'Native PRD Generator',
          description: 'Built-in PRD generation',
          isAvailable: true,
          priority: 0,
          requiresApiKey: false
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return { providers, loading, error };
}
