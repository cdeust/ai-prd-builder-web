import type { IPRDRepository, CreatePRDRequestDTO } from '../../domain/repositories/IPRDRepository.ts';
import type { IWebSocketClient } from '../../domain/repositories/IWebSocketClient.ts';
import { PRDRequest } from '../../domain/entities/PRDRequest.ts';

export class GeneratePRDUseCase {
  constructor(
    private readonly prdRepository: IPRDRepository,
    private readonly webSocketClient: IWebSocketClient
  ) {}

  async execute(data: CreatePRDRequestDTO): Promise<PRDRequest> {
    const request = await this.prdRepository.createRequest(data);

    await this.webSocketClient.connect(request.id);

    this.webSocketClient.send('start_generation', {
      title: data.title,
      description: data.description,
      priority: data.priority
    });

    return request;
  }
}