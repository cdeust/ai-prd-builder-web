import { PRDRequest } from '../entities/PRDRequest.ts';
import { PRDDocument } from '../entities/PRDDocument.ts';

export interface CreatePRDRequestDTO {
  title: string;
  description: string;
  priority: string;
  preferredProvider?: string;
}

export interface IPRDRepository {
  createRequest(data: CreatePRDRequestDTO): Promise<PRDRequest>;
  getRequest(id: string): Promise<PRDRequest>;
  getAllRequests(): Promise<PRDRequest[]>;
  downloadDocument(documentId: string): Promise<Blob>;
}