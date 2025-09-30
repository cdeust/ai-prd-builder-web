export interface MockupUploadProps {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  isAnalyzed: boolean;
  analysisConfidence?: number;
  isProcessed: boolean;
  expiresAt: Date;
}

export class MockupUpload {
  private constructor(private readonly props: MockupUploadProps) {}

  static create(props: MockupUploadProps): MockupUpload {
    if (!props.id || !props.fileName) {
      throw new Error('MockupUpload requires id and fileName');
    }
    if (props.fileSize <= 0) {
      throw new Error('File size must be greater than 0');
    }
    if (props.fileSize > 10 * 1024 * 1024) {
      throw new Error('File size must not exceed 10MB');
    }
    if (!props.mimeType.startsWith('image/')) {
      throw new Error('Only image files are supported');
    }
    return new MockupUpload(props);
  }

  get id(): string {
    return this.props.id;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get uploadedAt(): Date {
    return this.props.uploadedAt;
  }

  get isAnalyzed(): boolean {
    return this.props.isAnalyzed;
  }

  get analysisConfidence(): number | undefined {
    return this.props.analysisConfidence;
  }

  get isProcessed(): boolean {
    return this.props.isProcessed;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  get fileSizeFormatted(): string {
    const kb = this.props.fileSize / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  }
}