export type Codebase = {
  id: string;
  name: string;
  repositoryUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type CodeFile = {
  id: string;
  codebaseId: string;
  filePath: string;
  content?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SearchResult = {
  file: CodeFile;
  similarity: number;
  matchedContent?: string;
};

export type IndexingStatus = {
  codebaseId: string;
  status: 'pending' | 'indexing' | 'completed' | 'failed';
  progress: number; // 0-100
  filesProcessed: number;
  totalFiles: number;
  chunksCreated: number;
  embeddingsGenerated: number;
  lastUpdated: Date;
};

export type GitHubIndexRequest = {
  repositoryUrl: string;
  branch?: string;
  accessToken?: string;
};

export type GitHubIndexResponse = {
  codebaseId: string;
  repositoryUrl: string;
  branch: string;
  totalFiles: number;
  merkleRootHash: string;
  indexingStatus: string;
  message: string;
};
