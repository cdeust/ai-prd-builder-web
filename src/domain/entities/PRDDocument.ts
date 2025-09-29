import { PRDSection } from './PRDSection.ts';

export interface ArchitecturalConflict {
  requirement1: string;
  requirement2: string;
  conflictReason: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  resolution: string;
}

export interface TechnicalChallenge {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  mitigation?: string;
}

export interface ProfessionalAnalysis {
  hasCriticalIssues: boolean;
  executiveSummary: string;
  conflictCount: number;
  challengeCount: number;
  complexityScore?: number;
  blockingIssues: string[];
  conflicts: ArchitecturalConflict[];
  challenges: TechnicalChallenge[];
  scalingBreakpoints?: any[];
}

export interface PRDDocumentProps {
  id: string;
  title: string;
  version: string;
  sections: PRDSection[];
  professionalAnalysis?: ProfessionalAnalysis; // NEW field
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

  get professionalAnalysis(): ProfessionalAnalysis | undefined {
    return this.props.professionalAnalysis;
  }

  get hasCriticalIssues(): boolean {
    return this.props.professionalAnalysis?.hasCriticalIssues ?? false;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}