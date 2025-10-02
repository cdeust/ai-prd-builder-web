import { ApiClient } from '../infrastructure/api/ApiClient.ts';
import { PRDApiRepository } from '../infrastructure/repositories/PRDApiRepository.ts';
import { MockupApiRepository } from '../infrastructure/repositories/MockupApiRepository.ts';
import { CodebaseApiRepository } from '../infrastructure/repositories/CodebaseApiRepository.ts';
import { WebSocketClient } from '../infrastructure/websocket/WebSocketClient.ts';
import { GeneratePRDUseCase } from '../application/useCases/GeneratePRDUseCase.ts';
import { GetPRDRequestUseCase } from '../application/useCases/GetPRDRequestUseCase.ts';
import { DownloadPRDUseCase } from '../application/useCases/DownloadPRDUseCase.ts';
import { AnswerClarificationUseCase } from '../application/useCases/AnswerClarificationUseCase.ts';
import { UploadMockupUseCase } from '../application/useCases/UploadMockupUseCase.ts';
import { GetMockupAnalysisUseCase } from '../application/useCases/GetMockupAnalysisUseCase.ts';
import { IndexGitHubUseCase } from '../application/useCases/IndexGitHubUseCase.ts';
import { SearchCodebaseUseCase } from '../application/useCases/SearchCodebaseUseCase.ts';
import { LinkCodebaseToPRDUseCase, UnlinkCodebaseFromPRDUseCase } from '../application/useCases/LinkCodebaseToPRDUseCase.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

export class DIContainer {
  private static instance: DIContainer;

  private readonly apiClient: ApiClient;
  public readonly prdRepository: PRDApiRepository;
  private readonly mockupRepository: MockupApiRepository;
  private readonly codebaseRepository: CodebaseApiRepository;
  private readonly webSocketClient: WebSocketClient;

  public readonly generatePRDUseCase: GeneratePRDUseCase;
  public readonly getPRDRequestUseCase: GetPRDRequestUseCase;
  public readonly downloadPRDUseCase: DownloadPRDUseCase;
  public readonly answerClarificationUseCase: AnswerClarificationUseCase;
  public readonly uploadMockupUseCase: UploadMockupUseCase;
  public readonly getMockupAnalysisUseCase: GetMockupAnalysisUseCase;
  public readonly indexGitHubUseCase: IndexGitHubUseCase;
  public readonly searchCodebaseUseCase: SearchCodebaseUseCase;
  public readonly linkCodebaseToPRDUseCase: LinkCodebaseToPRDUseCase;
  public readonly unlinkCodebaseFromPRDUseCase: UnlinkCodebaseFromPRDUseCase;

  private constructor() {
    this.apiClient = new ApiClient(API_BASE_URL);
    this.prdRepository = new PRDApiRepository(this.apiClient);
    this.mockupRepository = new MockupApiRepository(this.apiClient);
    this.codebaseRepository = new CodebaseApiRepository(this.apiClient);
    this.webSocketClient = new WebSocketClient(WS_BASE_URL);

    // PRD use cases
    this.generatePRDUseCase = new GeneratePRDUseCase(this.prdRepository, this.webSocketClient);
    this.getPRDRequestUseCase = new GetPRDRequestUseCase(this.prdRepository);
    this.downloadPRDUseCase = new DownloadPRDUseCase(this.prdRepository);
    this.answerClarificationUseCase = new AnswerClarificationUseCase(this.webSocketClient);

    // Mockup use cases
    this.uploadMockupUseCase = new UploadMockupUseCase(this.mockupRepository);
    this.getMockupAnalysisUseCase = new GetMockupAnalysisUseCase(this.mockupRepository);

    // Codebase use cases
    this.indexGitHubUseCase = new IndexGitHubUseCase(this.codebaseRepository);
    this.searchCodebaseUseCase = new SearchCodebaseUseCase(this.codebaseRepository);
    this.linkCodebaseToPRDUseCase = new LinkCodebaseToPRDUseCase(this.codebaseRepository);
    this.unlinkCodebaseFromPRDUseCase = new UnlinkCodebaseFromPRDUseCase(this.codebaseRepository);
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

  getCodebaseRepository(): CodebaseApiRepository {
    return this.codebaseRepository;
  }
}