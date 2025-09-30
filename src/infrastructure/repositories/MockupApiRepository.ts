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

    // Handle both array and object responses from backend
    const uploadData = Array.isArray(response) ? response[0] : response;

    return MockupUpload.create({
      id: uploadData.id,
      fileName: uploadData.fileName || uploadData.file_name,
      fileSize: uploadData.fileSize || uploadData.file_size,
      mimeType: uploadData.mimeType || uploadData.mime_type,
      uploadedAt: new Date(uploadData.uploadedAt || uploadData.uploaded_at),
      isAnalyzed: uploadData.analysisResult !== null || uploadData.analysis_result !== null,
      analysisConfidence: uploadData.analysisConfidence || uploadData.analysis_confidence,
      isProcessed: uploadData.isProcessed || uploadData.is_processed,
      expiresAt: new Date(uploadData.expiresAt || uploadData.expires_at),
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

    // Handle both array and object responses from backend
    const mockupData = Array.isArray(response) ? response[0] : response;

    return {
      upload: MockupUpload.create({
        id: mockupData.id,
        fileName: mockupData.fileName || mockupData.file_name,
        fileSize: mockupData.fileSize || mockupData.file_size,
        mimeType: mockupData.mimeType || mockupData.mime_type,
        uploadedAt: new Date(mockupData.uploadedAt || mockupData.uploaded_at),
        isAnalyzed: mockupData.analysisResult !== null || mockupData.analysis_result !== null,
        analysisConfidence: mockupData.analysisConfidence || mockupData.analysis_confidence,
        isProcessed: mockupData.isProcessed || mockupData.is_processed,
        expiresAt: new Date(mockupData.expiresAt || mockupData.expires_at),
      }),
      signedUrl: mockupData.signedUrl || mockupData.signed_url,
      urlExpiresIn: mockupData.urlExpiresIn || mockupData.url_expires_in,
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