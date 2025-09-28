import { PRDSection } from './PRDSection.ts';

export interface PRDDocumentProps {
  id: string;
  title: string;
  version: string;
  sections: PRDSection[];
  createdAt: Date;
  updatedAt: Date;
}

export class PRDDocument {
  private constructor(private readonly props: PRDDocumentProps) {}

  static create(props: PRDDocumentProps): PRDDocument {
    if (!props.id || !props.title) {
      throw new Error('PRDDocument requires id and title');
    }
    return new PRDDocument(props);
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get version(): string {
    return this.props.version;
  }

  get sections(): PRDSection[] {
    return [...this.props.sections];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}