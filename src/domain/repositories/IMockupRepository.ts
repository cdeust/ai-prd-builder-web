import { MockupUpload } from '../entities/MockupUpload';
import { ConsolidatedAnalysis } from '../entities/MockupAnalysis';

export interface UploadMockupDTO {
  requestId: string;
  fileName: string;
  mimeType: string;
  imageData: string; // base64 encoded
}

export interface MockupListResponse {
  requestId: string;
  totalCount: number;
  mockups: MockupUpload[];
}

export interface IMockupRepository {
  /**
   * Upload a mockup image for a PRD request
   * @param data Upload data including file information
   * @returns Promise resolving to the uploaded mockup
   */
  uploadMockup(data: UploadMockupDTO): Promise<MockupUpload>;

  /**
   * Get all mockups for a specific PRD request
   * @param requestId The PRD request ID
   * @returns Promise resolving to list of mockups
   */
  getMockupsForRequest(requestId: string): Promise<MockupListResponse>;

  /**
   * Get a specific mockup by ID with signed URL
   * @param uploadId The mockup upload ID
   * @param expiresIn URL expiration time in seconds (default: 3600)
   * @returns Promise resolving to mockup with temporary access URL
   */
  getMockupWithUrl(uploadId: string, expiresIn?: number): Promise<{
    upload: MockupUpload;
    signedUrl: string;
    urlExpiresIn: number;
  }>;

  /**
   * Get consolidated analysis from all mockups for a request
   * @param requestId The PRD request ID
   * @returns Promise resolving to consolidated analysis
   */
  getConsolidatedAnalysis(requestId: string): Promise<ConsolidatedAnalysis>;

  /**
   * Trigger analysis for unprocessed mockups
   * @param requestId The PRD request ID
   * @returns Promise resolving when analysis job is started
   */
  analyzeUnprocessedMockups(requestId: string): Promise<{
    requestId: string;
    status: string;
    message: string;
  }>;

  /**
   * Delete a specific mockup
   * @param uploadId The mockup upload ID
   * @returns Promise resolving when deletion is complete
   */
  deleteMockup(uploadId: string): Promise<void>;
}