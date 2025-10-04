import type { ICodebaseRepository, SearchCodebaseDTO } from '../../domain/repositories/ICodebaseRepository.ts';
import type {
  SearchResult,
  PRDEnrichmentRequest,
  PRDEnrichmentResponse
} from '../../domain/entities/Codebase.ts';

/**
 * Use Case: Search codebase and enrich PRD generation with context
 *
 * Provides two main operations:
 * 1. Search codebase files by semantic similarity
 * 2. Enrich PRD generation with relevant code context (RAG)
 */
export class SearchCodebaseUseCase {
  constructor(private codebaseRepository: ICodebaseRepository) {}

  /**
   * Search codebase files using semantic similarity
   */
  async execute(input: SearchCodebaseInput): Promise<SearchResult[]> {
    // Validate input
    if (!input.query || input.query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    if (!input.codebaseId) {
      throw new Error('Codebase ID is required');
    }

    const searchDTO: SearchCodebaseDTO = {
      query: input.query.trim(),
      limit: input.limit || 25,
      similarityThreshold: input.similarityThreshold || 0.5
    };

    const results = await this.codebaseRepository.searchCodebase(input.codebaseId, searchDTO);

    // Sort by similarity (descending)
    return results.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Enrich PRD generation with relevant codebase context using RAG
   */
  async enrichPRD(input: EnrichPRDInput): Promise<PRDEnrichmentResponse> {
    // Validate input
    if (!input.prdDescription || input.prdDescription.trim().length === 0) {
      throw new Error('PRD description cannot be empty');
    }

    if (!input.codebaseId) {
      throw new Error('Codebase ID is required');
    }

    const request: PRDEnrichmentRequest = {
      prdDescription: input.prdDescription.trim(),
      codebaseId: input.codebaseId,
      maxChunks: input.maxChunks ?? 20,
      similarityThreshold: input.similarityThreshold ?? 0.6
    };

    return await this.codebaseRepository.enrichPRDWithCodebase(request);
  }
}

export interface SearchCodebaseInput {
  codebaseId: string;
  query: string;
  limit?: number;
  similarityThreshold?: number;
}

export interface EnrichPRDInput {
  prdDescription: string;
  codebaseId: string;
  maxChunks?: number;
  similarityThreshold?: number;
}
