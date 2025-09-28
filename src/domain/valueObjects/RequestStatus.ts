export type RequestStatusType = 'pending' | 'processing' | 'completed' | 'failed';

export class RequestStatus {
  private constructor(private readonly value: RequestStatusType) {}

  static create(value: string): RequestStatus {
    if (!['pending', 'processing', 'completed', 'failed'].includes(value)) {
      throw new Error(`Invalid status: ${value}`);
    }
    return new RequestStatus(value as RequestStatusType);
  }

  getValue(): RequestStatusType {
    return this.value;
  }

  isPending(): boolean {
    return this.value === 'pending';
  }

  isProcessing(): boolean {
    return this.value === 'processing';
  }

  isCompleted(): boolean {
    return this.value === 'completed';
  }

  isFailed(): boolean {
    return this.value === 'failed';
  }

  equals(other: RequestStatus): boolean {
    return this.value === other.value;
  }
}