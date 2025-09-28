import type { IPRDRepository } from '../../domain/repositories/IPRDRepository.ts';

export class DownloadPRDUseCase {
  constructor(private readonly prdRepository: IPRDRepository) {}

  async execute(documentId: string, filename: string): Promise<void> {
    const blob = await this.prdRepository.downloadDocument(documentId);

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}