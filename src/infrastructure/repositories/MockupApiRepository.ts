import type {
  IMockupRepository,
  UploadMockupDTO,
  MockupListResponse,
} from '../../domain/repositories/IMockupRepository.ts';
import { MockupUpload } from '../../domain/entities/MockupUpload.ts';
import { ConsolidatedAnalysis } from '../../domain/entities/MockupAnalysis.ts';
import { ApiClient } from '../api/ApiClient.ts';

export class MockupApiRepository implements IMockupRepository {
  constructor(private readonly apiClient: ApiClient) {}

  async uploadMockup(data: UploadMockupDTO): Promise<MockupUpload> {
    const response = await this.apiClient.post<UploadMockupDTO, any>(
      '/api/v1/mockups/upload',
      data
    );

    return MockupUpload.create({
      id: response.id,
      fileName: response.fileName,
      fileSize: response.fileSize,
      mimeType: response.mimeType,
      uploadedAt: new Date(response.uploadedAt),
      isAnalyzed: response.analysisResult !== null,
      analysisConfidence: response.analysisConfidence,
      isProcessed: response.isProcessed,
      expiresAt: new Date(response.expiresAt),
    });
  }

  async getMockupsForRequest(requestId: string): Promise<MockupListResponse> {
    const response = await this.apiClient.get<any>(
      `/api/v1/mockups/request/${requestId}`
    );

    return {
      requestId: response.requestId,
      totalCount: response.totalCount,
      mockups: response.mockups.map((m: any) =>
        MockupUpload.create({
          id: m.id,
          fileName: m.fileName,
          fileSize: m.fileSize,
          mimeType: 'image/png', // Default if not provided
          uploadedAt: new Date(m.uploadedAt),
          isAnalyzed: m.isAnalyzed,
          analysisConfidence: m.analysisConfidence,
          isProcessed: m.isProcessed,
          expiresAt: new Date(), // Will be set properly from backend
        })
      ),
    };
  }

  async getMockupWithUrl(
    uploadId: string,
    expiresIn: number = 3600
  ): Promise<{
    upload: MockupUpload;
    signedUrl: string;
    urlExpiresIn: number;
  }> {
    const response = await this.apiClient.get<any>(
      `/api/v1/mockups/${uploadId}?expiresIn=${expiresIn}`
    );

    return {
      upload: MockupUpload.create({
        id: response.id,
        fileName: response.fileName,
        fileSize: response.fileSize,
        mimeType: response.mimeType,
        uploadedAt: new Date(response.uploadedAt),
        isAnalyzed: response.analysisResult !== null,
        analysisConfidence: response.analysisConfidence,
        isProcessed: response.isProcessed,
        expiresAt: new Date(response.expiresAt),
      }),
      signedUrl: response.signedUrl,
      urlExpiresIn: response.urlExpiresIn,
    };
  }

  async getConsolidatedAnalysis(requestId: string): Promise<ConsolidatedAnalysis> {
    const response = await this.apiClient.get<any>(
      `/api/v1/mockups/request/${requestId}/analysis`
    );

    return ConsolidatedAnalysis.create({
      requestId: response.requestId,
      totalMockups: response.totalMockups,
      analyzedMockups: response.analyzedMockups,
      uiElements: response.uiElements,
      userFlows: response.userFlows,
      businessLogicInferences: response.businessLogicInferences,
      extractedText: response.extractedText,
      averageConfidence: response.averageConfidence,
    });
  }

  async analyzeUnprocessedMockups(requestId: string): Promise<{
    requestId: string;
    status: string;
    message: string;
  }> {
    return this.apiClient.post<any, any>(
      `/api/v1/mockups/request/${requestId}/analyze`,
      {}
    );
  }

  async deleteMockup(uploadId: string): Promise<void> {
    await this.apiClient.delete(`/api/v1/mockups/${uploadId}`);
  }

  /**
   * Convert a File object to base64 string
   * @param file The file to convert
   * @returns Promise resolving to base64 string
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Extract base64 data after the "data:image/...;base64," prefix
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}