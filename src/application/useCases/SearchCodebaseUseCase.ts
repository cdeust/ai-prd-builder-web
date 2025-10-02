import type { ICodebaseRepository, SearchCodebaseDTO } from '../../domain/repositories/ICodebaseRepository.ts';
import type { SearchResult } from '../../domain/entities/Codebase.ts';

export class SearchCodebaseUseCase {
  constructor(private codebaseRepository: ICodebaseRepository) {}

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
}

export interface SearchCodebaseInput {
  codebaseId: string;
  query: string;
  limit?: number;
  similarityThreshold?: number;
}
