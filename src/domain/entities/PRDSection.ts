export interface PRDSectionProps {
  id: string;
  title: string;
  content: string;
  order: number;
}

export class PRDSection {
  private constructor(private readonly props: PRDSectionProps) {}

  static create(props: PRDSectionProps): PRDSection {
    if (!props.id || !props.title) {
      throw new Error('PRDSection requires id and title');
    }
    return new PRDSection(props);
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get content(): string {
    return this.props.content;
  }

  get order(): number {
    return this.props.order;
  }
}