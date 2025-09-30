import type { IMockupRepository } from '../../domain/repositories/IMockupRepository.ts';
import { MockupUpload } from '../../domain/entities/MockupUpload.ts';
import { MockupApiRepository } from '../../infrastructure/repositories/MockupApiRepository.ts';

export class UploadMockupUseCase {
  constructor(private readonly mockupRepository: IMockupRepository) {}

  async execute(requestId: string, file: File): Promise<MockupUpload> {
    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must not exceed 10MB');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are supported');
    }

    // Convert file to base64
    const base64Data = await MockupApiRepository.fileToBase64(file);

    // Upload to backend
    return this.mockupRepository.uploadMockup({
      requestId,
      fileName: file.name,
      mimeType: file.type,
      imageData: base64Data,
    });
  }

  async uploadMultiple(requestId: string, files: File[]): Promise<MockupUpload[]> {
    if (files.length > 20) {
      throw new Error('Maximum 20 mockups allowed per request');
    }

    const uploads: MockupUpload[] = [];

    for (const file of files) {
      try {
        const upload = await this.execute(requestId, file);
        uploads.push(upload);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files
      }
    }

    return uploads;
  }
}