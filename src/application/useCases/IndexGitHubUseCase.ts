import type { ICodebaseRepository } from '../../domain/repositories/ICodebaseRepository.ts';
import type { GitHubIndexRequest, GitHubIndexResponse } from '../../domain/entities/Codebase.ts';

export class IndexGitHubUseCase {
  constructor(private codebaseRepository: ICodebaseRepository) {}

  async execute(input: IndexGitHubInput): Promise<GitHubIndexResponse> {
    // Validate GitHub URL
    if (!this.isValidGitHubUrl(input.repositoryUrl)) {
      throw new Error('Invalid GitHub repository URL. Must start with https://github.com/ or git@github.com:');
    }

    // Normalize the URL
    const normalizedUrl = this.normalizeGitHubUrl(input.repositoryUrl);

    const request: GitHubIndexRequest = {
      repositoryUrl: normalizedUrl,
      branch: input.branch || 'main',
      accessToken: input.accessToken
    };

    return await this.codebaseRepository.indexGitHubRepository(request);
  }

  private isValidGitHubUrl(url: string): boolean {
    return url.startsWith('https://github.com/') || url.startsWith('git@github.com:');
  }

  private normalizeGitHubUrl(url: string): string {
    // Convert SSH URLs to HTTPS
    if (url.startsWith('git@github.com:')) {
      const path = url.replace('git@github.com:', '').replace(/\.git$/, '');
      return `https://github.com/${path}`;
    }

    // Remove .git suffix from HTTPS URLs
    return url.replace(/\.git$/, '');
  }
}

export interface IndexGitHubInput {
  repositoryUrl: string;
  branch?: string;
  accessToken?: string;
}
