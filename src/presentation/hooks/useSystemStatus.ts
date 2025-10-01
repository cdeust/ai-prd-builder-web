import { useState, useEffect } from 'react';
import { useAvailableProviders } from './useProviderInfo.ts';

export interface SystemStatus {
  provider: {
    name: string;
    status: 'online' | 'offline' | 'loading';
  };
  server: {
    status: 'online' | 'offline' | 'loading';
  };
  database: {
    status: 'online' | 'offline' | 'loading';
  };
}

export function useSystemStatus() {
  const { providers, loading: providersLoading } = useAvailableProviders();
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'loading'>('loading');
  const [databaseStatus, setDatabaseStatus] = useState<'online' | 'offline' | 'loading'>('loading');

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/prd/providers/available`);

        if (response.ok) {
          setServerStatus('online');
          // If server is responding, database is likely online too
          setDatabaseStatus('online');
        } else {
          setServerStatus('offline');
          setDatabaseStatus('offline');
        }
      } catch (error) {
        setServerStatus('offline');
        setDatabaseStatus('offline');
      }
    };

    checkServerHealth();

    // Check every 30 seconds
    const interval = setInterval(checkServerHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const selectedProvider = providers.length > 0 ? providers[0] : null;

  return {
    provider: {
      name: selectedProvider?.name || 'No Provider',
      status: providersLoading ? 'loading' : (selectedProvider ? 'online' : 'offline')
    },
    server: {
      status: serverStatus
    },
    database: {
      status: databaseStatus
    }
  };
}
