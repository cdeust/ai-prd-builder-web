export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export class Priority {
  private constructor(private readonly value: PriorityLevel) {}

  static create(value: string): Priority {
    if (!['low', 'medium', 'high', 'critical'].includes(value)) {
      throw new Error(`Invalid priority: ${value}`);
    }
    return new Priority(value as PriorityLevel);
  }

  getValue(): PriorityLevel {
    return this.value;
  }

  equals(other: Priority): boolean {
    return this.value === other.value;
  }
}