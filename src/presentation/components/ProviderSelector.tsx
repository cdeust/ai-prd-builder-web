import { useAvailableProviders } from '../hooks/useProviderInfo.ts';
import './ProviderSelector.css';

interface ProviderSelectorProps {
  value: string;
  onChange: (provider: string) => void;
  disabled?: boolean;
}

export function ProviderSelector({ value, onChange, disabled }: ProviderSelectorProps) {
  const { providers, loading } = useAvailableProviders();

  if (loading) {
    return (
      <div className="provider-selector">
        <label className="provider-label">AI Provider</label>
        <div className="provider-loading">Loading available providers...</div>
      </div>
    );
  }

  if (providers.length === 0) {
    return null;
  }

  const selectedProvider = providers.find(p => p.id === value) || providers[0];

  return (
    <div className="provider-selector">
      <label className="provider-label">
        AI Provider
        <span className="provider-count">({providers.length} available)</span>
      </label>

      <select
        className="provider-select"
        value={value || selectedProvider.id}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {providers.map(provider => (
          <option key={provider.id} value={provider.id}>
            {provider.name}
            {provider.model ? ` - ${provider.model}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
