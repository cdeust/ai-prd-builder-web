import { ApiClient } from '../api/ApiClient.ts';
import type {
  ICodebaseRepository,
  CreateCodebaseDTO,
  SearchCodebaseDTO
} from '../../domain/repositories/ICodebaseRepository.ts';
import type {
  Codebase,
  SearchResult,
  IndexingStatus,
  GitHubIndexRequest,
  GitHubIndexResponse,
  PRDEnrichmentRequest,
  PRDEnrichmentResponse
} from '../../domain/entities/Codebase.ts';

// API DTOs with string dates (as received from JSON)
type CodebaseApiDTO = Omit<Codebase, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

type IndexingStatusApiDTO = Omit<IndexingStatus, 'lastUpdated'> & {
  lastUpdated: string;
};

export class CodebaseApiRepository implements ICodebaseRepository {
  constructor(private apiClient: ApiClient) {}

  async createCodebase(data: CreateCodebaseDTO): Promise<Codebase> {
    const response = await this.apiClient.post<CodebaseApiDTO, CodebaseApiDTO>('/api/v1/codebases', data);
    return this.parseDates(response);
  }

  async getCodebase(id: string): Promise<Codebase> {
    const response = await this.apiClient.get<CodebaseApiDTO>(`/api/v1/codebases/${id}`);
    return this.parseDates(response);
  }

  async listCodebases(): Promise<Codebase[]> {
    const response = await this.apiClient.get<CodebaseApiDTO[]>('/api/v1/codebases');
    return response.map(cb => this.parseDates(cb));
  }

  async deleteCodebase(id: string): Promise<void> {
    await this.apiClient.delete(`/api/v1/codebases/${id}`);
  }

  async indexGitHubRepository(request: GitHubIndexRequest): Promise<GitHubIndexResponse> {
    return await this.apiClient.post<GitHubIndexResponse>(
      '/api/v1/codebases/index-github',
      request
    );
  }

  async getIndexingStatus(codebaseId: string): Promise<IndexingStatus> {
    const response = await this.apiClient.get<IndexingStatusApiDTO>(
      `/api/v1/codebases/${codebaseId}/indexing-status`
    );
    return {
      ...response,
      lastUpdated: new Date(response.lastUpdated)
    };
  }

  async searchCodebase(codebaseId: string, query: SearchCodebaseDTO): Promise<SearchResult[]> {
    return await this.apiClient.post<SearchResult[]>(
      `/api/v1/codebases/${codebaseId}/search`,
      query
    );
  }

  async linkCodebaseToPRD(codebaseId: string, prdId: string): Promise<void> {
    await this.apiClient.post(`/api/v1/codebases/${codebaseId}/link-prd`, {
      prdRequestId: prdId
    });
  }

  async unlinkCodebaseFromPRD(codebaseId: string, prdId: string): Promise<void> {
    await this.apiClient.delete(`/api/v1/codebases/${codebaseId}/link-prd/${prdId}`);
  }

  async enrichPRDWithCodebase(request: PRDEnrichmentRequest): Promise<PRDEnrichmentResponse> {
    return await this.apiClient.post<PRDEnrichmentResponse>(
      '/api/v1/codebases/enrich-prd',
      request
    );
  }

  // Helper to parse date strings to Date objects
  private parseDates(dto: CodebaseApiDTO): Codebase {
    return {
      ...dto,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt)
    };
  }
}
