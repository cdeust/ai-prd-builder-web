import type { IMockupRepository } from '../../domain/repositories/IMockupRepository.ts';
import { ConsolidatedAnalysis } from '../../domain/entities/MockupAnalysis.ts';

export class GetMockupAnalysisUseCase {
  constructor(private readonly mockupRepository: IMockupRepository) {}

  async execute(requestId: string): Promise<ConsolidatedAnalysis> {
    return this.mockupRepository.getConsolidatedAnalysis(requestId);
  }

  async triggerAnalysis(requestId: string): Promise<void> {
    await this.mockupRepository.analyzeUnprocessedMockups(requestId);
  }

  async getAnalysisSummary(requestId: string): Promise<{
    hasAnalysis: boolean;
    summary: string;
    confidence: string;
    isComplete: boolean;
  }> {
    try {
      const analysis = await this.execute(requestId);

      return {
        hasAnalysis: true,
        summary: analysis.summary,
        confidence: analysis.confidencePercentage,
        isComplete: analysis.isFullyAnalyzed,
      };
    } catch (error) {
      return {
        hasAnalysis: false,
        summary: 'No mockup analysis available',
        confidence: '0%',
        isComplete: false,
      };
    }
  }
}