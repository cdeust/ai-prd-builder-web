import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Code2, Plus, RefreshCw } from 'lucide-react';
import { DIContainer } from '../../shared/DIContainer.ts';
import type { Codebase } from '../../domain/entities/Codebase.ts';

interface CodebaseSelectorProps {
  value: string;
  onChange: (codebaseId: string) => void;
  disabled?: boolean;
}

export function CodebaseSelector({ value, onChange, disabled }: CodebaseSelectorProps) {
  const [codebases, setCodebases] = useState<Codebase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const container = DIContainer.getInstance();
  const codebaseRepository = container.getCodebaseRepository();

  const fetchCodebases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await codebaseRepository.listCodebases();
      setCodebases(data);
    } catch (err) {
      console.error('Failed to fetch codebases:', err);
      setError('Failed to load codebases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodebases();
  }, []);

  if (loading) {
    return (
      <div className="form-group">
        <label className="form-label">
          <Code2 size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Codebase Context (Optional)
        </label>
        <div className="codebase-loading">
          <RefreshCw size={16} className="spinning" />
          <span>Loading codebases...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-group">
        <label className="form-label">
          <Code2 size={16} style={{ display: 'inline', marginRight: '8px' }} />
          Codebase Context (Optional)
        </label>
        <div className="codebase-error">
          <p>{error}</p>
          <button type="button" onClick={fetchCodebases} className="retry-button">
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      <label className="form-label">
        <Code2 size={16} style={{ display: 'inline', marginRight: '8px' }} />
        Codebase Context (Optional)
      </label>
      <p className="form-helper-text">
        Link an existing codebase to provide context for the PRD generation
      </p>

      <div className="codebase-selector-wrapper">
        <select
          className="form-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">No codebase (default)</option>
          {codebases.map((codebase) => (
            <option key={codebase.id} value={codebase.id}>
              {codebase.name}
              {codebase.repositoryUrl && ` (${new URL(codebase.repositoryUrl).pathname})`}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="codebase-action-button"
          onClick={() => setShowCreateDialog(true)}
          disabled={disabled}
          title="Create or index a new codebase"
        >
          <Plus size={16} />
        </button>

        <button
          type="button"
          className="codebase-action-button"
          onClick={fetchCodebases}
          disabled={disabled}
          title="Refresh codebase list"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {value && codebases.find(cb => cb.id === value) && (
        <div className="codebase-info">
          <p className="codebase-description">
            {codebases.find(cb => cb.id === value)?.description || 'No description'}
          </p>
        </div>
      )}

      {showCreateDialog && createPortal(
        <CreateCodebaseDialog
          onClose={() => setShowCreateDialog(false)}
          onCreated={(codebaseId) => {
            setShowCreateDialog(false);
            fetchCodebases();
            onChange(codebaseId);
          }}
        />,
        document.body
      )}
    </div>
  );
}

interface CreateCodebaseDialogProps {
  onClose: () => void;
  onCreated: (codebaseId: string) => void;
}

function CreateCodebaseDialog({ onClose, onCreated }: CreateCodebaseDialogProps) {
  const [name, setName] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [description, setDescription] = useState('');
  const [branch, setBranch] = useState('main');
  const [accessToken, setAccessToken] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const container = DIContainer.getInstance();
  const indexGitHubUseCase = container.indexGitHubUseCase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    console.log('📤 Starting GitHub indexing...', { repositoryUrl, branch });

    setCreating(true);
    setError(null);

    try {
      console.log('🔄 Calling indexGitHubUseCase.execute...');
      const result = await indexGitHubUseCase.execute({
        repositoryUrl,
        branch: branch || 'main',
        accessToken: accessToken || undefined,
      });

      console.log('✅ Successfully indexed repository:', result);
      onCreated(result.codebaseId);
    } catch (err) {
      console.error('❌ Failed to index codebase - Full error object:', err);

      // Extract error details
      let errorMessage = 'Failed to index repository. Please check the URL and try again.';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.error) {
          errorMessage = typeof errorObj.error === 'string' ? errorObj.error : JSON.stringify(errorObj.error);
        }
      }

      setError(errorMessage);
      setCreating(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="dialog-content" onClick={handleContentClick}>
        <div className="dialog-header">
          <h3>Index GitHub Repository</h3>
          <button type="button" className="close-button" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          <div className="form-group">
            <label className="form-label">
              Repository URL <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="https://github.com/owner/repo"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Branch</label>
            <input
              type="text"
              className="form-input"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">GitHub Access Token (Optional)</label>
            <input
              type="password"
              className="form-input"
              placeholder="ghp_..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
            <p className="form-helper-text">
              Required for private repositories. Get one from GitHub Settings → Developer settings
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="dialog-footer">
            <button
              type="button"
              className="button-secondary"
              onClick={handleClose}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={(e) => {
                e.preventDefault();
                console.log('🔘 Button clicked!', { repositoryUrl, branch });
                handleSubmit(e as any);
              }}
              disabled={creating || !repositoryUrl}
            >
              {creating ? 'Indexing...' : 'Index Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
