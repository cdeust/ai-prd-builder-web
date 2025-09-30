import type { IPRDRepository, CreatePRDRequestDTO } from '../../domain/repositories/IPRDRepository.ts';
import { PRDRequest } from '../../domain/entities/PRDRequest.ts';
import { Priority } from '../../domain/valueObjects/Priority.ts';
import { RequestStatus } from '../../domain/valueObjects/RequestStatus.ts';
import { PRDDocument } from '../../domain/entities/PRDDocument.ts';
import { PRDSection } from '../../domain/entities/PRDSection.ts';
import { ApiClient } from '../api/ApiClient.ts';

export class PRDApiRepository implements IPRDRepository {
  constructor(private readonly apiClient: ApiClient) {}

  async createRequest(data: CreatePRDRequestDTO): Promise<PRDRequest> {
    // Call the dedicated endpoint for creating PRD requests (Request-First workflow)
    const response = await this.apiClient.post<CreatePRDRequestDTO, any>('/api/v1/prd/requests', data);

    return PRDRequest.create({
      id: response.request_id || response.requestId,
      title: response.title || data.title,
      description: response.description || data.description,
      priority: Priority.create(data.priority),
      status: RequestStatus.create(response.status || 'pending'),
      progress: 0,
      createdAt: new Date(response.created_at || response.createdAt || Date.now()),
      updatedAt: new Date(response.created_at || response.createdAt || Date.now())
    });
  }

  async getRequest(id: string): Promise<PRDRequest> {
    const response = await this.apiClient.get<any>(`/api/v1/prd/status/${id}`);

    return PRDRequest.create({
      id: response.request_id || response.requestId || id,
      title: response.title || '',
      description: response.description || '',
      priority: Priority.create(response.priority || 'medium'),
      status: RequestStatus.create(response.status),
      progress: response.progress || 0,
      document: response.document ? this.mapDocument(response.document) : undefined,
      createdAt: new Date(response.created_at || response.createdAt),
      updatedAt: new Date(response.updated_at || response.updatedAt),
      completedAt: response.completed_at || response.completedAt ? new Date(response.completed_at || response.completedAt) : undefined,
      error: response.error
    });
  }

  async getAllRequests(): Promise<PRDRequest[]> {
    const response = await this.apiClient.get<any[]>('/api/v1/prd/requests');
    return response.map(item => PRDRequest.create({
      id: item.request_id || item.requestId,
      title: item.title || '',
      description: item.description || '',
      priority: Priority.create(item.priority || 'medium'),
      status: RequestStatus.create(item.status),
      progress: item.progress || 0,
      createdAt: new Date(item.created_at || item.createdAt),
      updatedAt: new Date(item.updated_at || item.updatedAt)
    }));
  }

  async downloadDocument(documentId: string): Promise<Blob> {
    return this.apiClient.getBlob(`/api/v1/prd/download/${documentId}`);
  }

  private mapDocument(data: any): PRDDocument {
    return PRDDocument.create({
      id: data.id,
      title: data.title,
      version: data.version || '1.0',
      sections: (data.sections || []).map((s: any) => PRDSection.create({
        id: s.id,
        title: s.title,
        content: s.content,
        order: s.order
      })),
      createdAt: new Date(data.created_at || data.createdAt),
      updatedAt: new Date(data.updated_at || data.updatedAt)
    });
  }
}