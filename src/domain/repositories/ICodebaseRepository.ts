import type {
  Codebase,
  SearchResult,
  IndexingStatus,
  GitHubIndexRequest,
  GitHubIndexResponse,
  PRDEnrichmentRequest,
  PRDEnrichmentResponse
} from '../entities/Codebase';

export type CreateCodebaseDTO = {
  name: string;
  repositoryUrl?: string;
  description?: string;
};

export type SearchCodebaseDTO = {
  query: string;
  limit?: number;
  similarityThreshold?: number;
};

export interface ICodebaseRepository {
  // CRUD Operations
  createCodebase(data: CreateCodebaseDTO): Promise<Codebase>;
  getCodebase(id: string): Promise<Codebase>;
  listCodebases(): Promise<Codebase[]>;
  deleteCodebase(id: string): Promise<void>;

  // GitHub Indexing
  indexGitHubRepository(request: GitHubIndexRequest): Promise<GitHubIndexResponse>;
  getIndexingStatus(codebaseId: string): Promise<IndexingStatus>;

  // Search
  searchCodebase(codebaseId: string, query: SearchCodebaseDTO): Promise<SearchResult[]>;

  // PRD Linking
  linkCodebaseToPRD(codebaseId: string, prdId: string): Promise<void>;
  unlinkCodebaseFromPRD(codebaseId: string, prdId: string): Promise<void>;

  // RAG / PRD Enrichment
  enrichPRDWithCodebase(request: PRDEnrichmentRequest): Promise<PRDEnrichmentResponse>;
}
