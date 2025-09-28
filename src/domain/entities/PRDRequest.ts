import { Priority } from '../valueObjects/Priority.ts';
import { RequestStatus } from '../valueObjects/RequestStatus.ts';
import { PRDDocument } from './PRDDocument.ts';

export interface PRDRequestProps {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: RequestStatus;
  progress: number;
  document?: PRDDocument;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
}

export class PRDRequest {
  private constructor(private readonly props: PRDRequestProps) {}

  static create(props: PRDRequestProps): PRDRequest {
    if (!props.id || !props.title || !props.description) {
      throw new Error('PRDRequest requires id, title, and description');
    }
    if (props.progress < 0 || props.progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
    return new PRDRequest(props);
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get priority(): Priority {
    return this.props.priority;
  }

  get status(): RequestStatus {
    return this.props.status;
  }

  get progress(): number {
    return this.props.progress;
  }

  get document(): PRDDocument | undefined {
    return this.props.document;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get error(): string | undefined {
    return this.props.error;
  }
}