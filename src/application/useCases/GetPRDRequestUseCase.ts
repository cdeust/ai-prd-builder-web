import type { IPRDRepository } from '../../domain/repositories/IPRDRepository.ts';
import { PRDRequest } from '../../domain/entities/PRDRequest.ts';

export class GetPRDRequestUseCase {
  constructor(private readonly prdRepository: IPRDRepository) {}

  async execute(requestId: string): Promise<PRDRequest> {
    return this.prdRepository.getRequest(requestId);
  }
}