export interface UIElementData {
  type: string;
  label?: string;
  confidence: number;
}

export interface UserFlowData {
  flowName: string;
  steps: string[];
  confidence: number;
}

export interface BusinessLogicData {
  feature: string;
  description: string;
  confidence: number;
  requiredComponents: string[];
}

export interface ConsolidatedAnalysisProps {
  requestId: string;
  totalMockups: number;
  analyzedMockups: number;
  uiElements: string[];
  userFlows: UserFlowData[];
  businessLogicInferences: BusinessLogicData[];
  extractedText: string[];
  averageConfidence: number;
}

export class ConsolidatedAnalysis {
  private constructor(private readonly props: ConsolidatedAnalysisProps) {}

  static create(props: ConsolidatedAnalysisProps): ConsolidatedAnalysis {
    if (!props.requestId) {
      throw new Error('ConsolidatedAnalysis requires requestId');
    }
    if (props.totalMockups < 0 || props.analyzedMockups < 0) {
      throw new Error('Mockup counts must be non-negative');
    }
    if (props.averageConfidence < 0 || props.averageConfidence > 1) {
      throw new Error('Average confidence must be between 0 and 1');
    }
    return new ConsolidatedAnalysis(props);
  }

  get requestId(): string {
    return this.props.requestId;
  }

  get totalMockups(): number {
    return this.props.totalMockups;
  }

  get analyzedMockups(): number {
    return this.props.analyzedMockups;
  }

  get uiElements(): string[] {
    return this.props.uiElements;
  }

  get userFlows(): UserFlowData[] {
    return this.props.userFlows;
  }

  get businessLogicInferences(): BusinessLogicData[] {
    return this.props.businessLogicInferences;
  }

  get extractedText(): string[] {
    return this.props.extractedText;
  }

  get averageConfidence(): number {
    return this.props.averageConfidence;
  }

  get isFullyAnalyzed(): boolean {
    return this.props.totalMockups === this.props.analyzedMockups;
  }

  get confidencePercentage(): string {
    return `${(this.props.averageConfidence * 100).toFixed(1)}%`;
  }

  get summary(): string {
    const features = this.props.businessLogicInferences.length;
    const flows = this.props.userFlows.length;
    const elements = this.props.uiElements.length;

    return `Detected ${features} features, ${flows} user flows, and ${elements} UI components`;
  }
}