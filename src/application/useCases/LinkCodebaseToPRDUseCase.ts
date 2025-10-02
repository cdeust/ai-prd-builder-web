import type { ICodebaseRepository } from '../../domain/repositories/ICodebaseRepository.ts';

export class LinkCodebaseToPRDUseCase {
  constructor(private codebaseRepository: ICodebaseRepository) {}

  async execute(input: LinkCodebaseInput): Promise<void> {
    if (!input.codebaseId || !input.prdId) {
      throw new Error('Both codebaseId and prdId are required');
    }

    await this.codebaseRepository.linkCodebaseToPRD(input.codebaseId, input.prdId);
  }
}

export interface LinkCodebaseInput {
  codebaseId: string;
  prdId: string;
}

export class UnlinkCodebaseFromPRDUseCase {
  constructor(private codebaseRepository: ICodebaseRepository) {}

  async execute(input: LinkCodebaseInput): Promise<void> {
    if (!input.codebaseId || !input.prdId) {
      throw new Error('Both codebaseId and prdId are required');
    }

    await this.codebaseRepository.unlinkCodebaseFromPRD(input.codebaseId, input.prdId);
  }
}
