import React, { useState } from 'react';
import { SearchCodebaseUseCase } from '../../application/useCases/SearchCodebaseUseCase.ts';
import type { SearchCodebaseInput } from '../../application/useCases/SearchCodebaseUseCase.ts';
import type { SearchResult } from '../../domain/entities/Codebase.ts';

interface CodebaseSearchProps {
  codebaseId: string;
  searchCodebaseUseCase: SearchCodebaseUseCase;
  onResultSelect?: (result: SearchResult) => void;
}

export const CodebaseSearch: React.FC<CodebaseSearchProps> = ({
  codebaseId,
  searchCodebaseUseCase,
  onResultSelect
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const input: SearchCodebaseInput = {
        codebaseId,
        query: query.trim(),
        limit: 25,
        similarityThreshold: 0.5
      };

      const searchResults = await searchCodebaseUseCase.execute(input);
      setResults(searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  return (
    <div className="codebase-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code... (e.g., 'function login', 'class User')"
            disabled={isLoading}
            className="search-input"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="search-button"
          >
            {isLoading ? '🔍 Searching...' : '🔍 Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message" role="alert">
          ⚠️ {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          <h3>Found {results.length} results</h3>
          <ul className="results-list">
            {results.map((result, index) => (
              <li
                key={result.file.id}
                className="result-item"
                onClick={() => handleResultClick(result)}
              >
                <div className="result-header">
                  <span className="result-path">{result.file.filePath}</span>
                  <span className="result-similarity">
                    {(result.similarity * 100).toFixed(1)}% match
                  </span>
                </div>
                {result.file.language && (
                  <span className="result-language">{result.file.language}</span>
                )}
                {result.matchedContent && (
                  <pre className="result-content">{result.matchedContent}</pre>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLoading && query && results.length === 0 && !error && (
        <div className="no-results">
          No results found for "{query}"
        </div>
      )}

      <style>{`
        .codebase-search {
          max-width: 800px;
          margin: 0 auto;
          padding: 1rem;
        }

        .search-form {
          margin-bottom: 2rem;
        }

        .search-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #4a90e2;
        }

        .search-button {
          padding: 0.75rem 1.5rem;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .search-button:hover:not(:disabled) {
          background-color: #357abd;
        }

        .search-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          padding: 1rem;
          margin-bottom: 1rem;
          background-color: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          color: #c33;
        }

        .search-results h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .results-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .result-item {
          padding: 1rem;
          margin-bottom: 0.5rem;
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .result-item:hover {
          background: #f0f0f0;
          border-color: #4a90e2;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .result-path {
          font-family: monospace;
          font-size: 0.9rem;
          color: #333;
          font-weight: 600;
        }

        .result-similarity {
          padding: 0.25rem 0.5rem;
          background-color: #4a90e2;
          color: white;
          border-radius: 3px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .result-language {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background-color: #e0e0e0;
          border-radius: 3px;
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .result-content {
          margin: 0.5rem 0 0 0;
          padding: 0.75rem;
          background: #282c34;
          color: #abb2bf;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
          overflow-x: auto;
          max-height: 200px;
        }

        .no-results {
          padding: 2rem;
          text-align: center;
          color: #777;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
