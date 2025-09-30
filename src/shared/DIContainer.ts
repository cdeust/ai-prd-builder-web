import { ApiClient } from '../infrastructure/api/ApiClient.ts';
import { PRDApiRepository } from '../infrastructure/repositories/PRDApiRepository.ts';
import { MockupApiRepository } from '../infrastructure/repositories/MockupApiRepository.ts';
import { WebSocketClient } from '../infrastructure/websocket/WebSocketClient.ts';
import { GeneratePRDUseCase } from '../application/useCases/GeneratePRDUseCase.ts';
import { GetPRDRequestUseCase } from '../application/useCases/GetPRDRequestUseCase.ts';
import { DownloadPRDUseCase } from '../application/useCases/DownloadPRDUseCase.ts';
import { AnswerClarificationUseCase } from '../application/useCases/AnswerClarificationUseCase.ts';
import { UploadMockupUseCase } from '../application/useCases/UploadMockupUseCase.ts';
import { GetMockupAnalysisUseCase } from '../application/useCases/GetMockupAnalysisUseCase.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export class DIContainer {
  private static instance: DIContainer;

  private readonly apiClient: ApiClient;
  public readonly prdRepository: PRDApiRepository;
  private readonly mockupRepository: MockupApiRepository;
  private readonly webSocketClient: WebSocketClient;

  public readonly generatePRDUseCase: GeneratePRDUseCase;
  public readonly getPRDRequestUseCase: GetPRDRequestUseCase;
  public readonly downloadPRDUseCase: DownloadPRDUseCase;
  public readonly answerClarificationUseCase: AnswerClarificationUseCase;
  public readonly uploadMockupUseCase: UploadMockupUseCase;
  public readonly getMockupAnalysisUseCase: GetMockupAnalysisUseCase;

  private constructor() {
    this.apiClient = new ApiClient(API_BASE_URL);
    this.prdRepository = new PRDApiRepository(this.apiClient);
    this.mockupRepository = new MockupApiRepository(this.apiClient);
    this.webSocketClient = new WebSocketClient(WS_BASE_URL);

    this.generatePRDUseCase = new GeneratePRDUseCase(this.prdRepository, this.webSocketClient);
    this.getPRDRequestUseCase = new GetPRDRequestUseCase(this.prdRepository);
    this.downloadPRDUseCase = new DownloadPRDUseCase(this.prdRepository);
    this.answerClarificationUseCase = new AnswerClarificationUseCase(this.webSocketClient);
    this.uploadMockupUseCase = new UploadMockupUseCase(this.mockupRepository);
    this.getMockupAnalysisUseCase = new GetMockupAnalysisUseCase(this.mockupRepository);
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  getWebSocketClient(): WebSocketClient {
    return this.webSocketClient;
  }

  getPRDRepository(): PRDApiRepository {
    return this.prdRepository;
  }

  getMockupRepository(): MockupApiRepository {
    return this.mockupRepository;
  }
}