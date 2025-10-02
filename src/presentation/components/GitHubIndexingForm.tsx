import React, { useState } from 'react';
import { IndexGitHubUseCase } from '../../application/useCases/IndexGitHubUseCase.ts';
import type { IndexGitHubInput } from '../../application/useCases/IndexGitHubUseCase.ts';
import type { GitHubIndexResponse } from '../../domain/entities/Codebase.ts';

interface GitHubIndexingFormProps {
  indexGitHubUseCase: IndexGitHubUseCase;
  onSuccess?: (response: GitHubIndexResponse) => void;
  onError?: (error: Error) => void;
}

export const GitHubIndexingForm: React.FC<GitHubIndexingFormProps> = ({
  indexGitHubUseCase,
  onSuccess,
  onError
}) => {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const input: IndexGitHubInput = {
        repositoryUrl: repositoryUrl.trim(),
        branch: branch.trim() || 'main',
        accessToken: accessToken.trim() || undefined
      };

      const response = await indexGitHubUseCase.execute(input);

      if (onSuccess) {
        onSuccess(response);
      }

      // Reset form
      setRepositoryUrl('');
      setBranch('main');
      setAccessToken('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to index repository';
      setError(errorMessage);

      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="github-indexing-form">
      <h2>Index GitHub Repository</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="repositoryUrl">
            Repository URL *
          </label>
          <input
            type="text"
            id="repositoryUrl"
            value={repositoryUrl}
            onChange={(e) => setRepositoryUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            required
            disabled={isLoading}
          />
          <small>
            Examples: https://github.com/owner/repo or git@github.com:owner/repo.git
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="branch">
            Branch
          </label>
          <input
            type="text"
            id="branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            disabled={isLoading}
          />
          <small>
            Default: main
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="accessToken">
            GitHub Access Token (Optional)
          </label>
          <input
            type="password"
            id="accessToken"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            disabled={isLoading}
          />
          <small>
            Required for private repositories. Create at: github.com/settings/tokens
          </small>
        </div>

        {error && (
          <div className="error-message" role="alert">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !repositoryUrl.trim()}
          className="btn-primary"
        >
          {isLoading ? 'Indexing...' : 'Index Repository'}
        </button>
      </form>

      <style>{`
        .github-indexing-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .github-indexing-form h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #555;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #4a90e2;
        }

        .form-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #777;
          font-size: 0.875rem;
        }

        .error-message {
          padding: 0.75rem;
          margin-bottom: 1rem;
          background-color: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          color: #c33;
        }

        .btn-primary {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #357abd;
        }

        .btn-primary:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
