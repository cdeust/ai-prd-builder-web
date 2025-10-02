export class ApiClient {
  constructor(private readonly baseURL: string) {}

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      const errorMessage = await this.extractErrorMessage(response);
      throw new Error(errorMessage);
    }
    return response.json();
  }

  async post<T, R>(endpoint: string, data: T): Promise<R> {
    console.log(`[ApiClient] POST ${endpoint}`, data);
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      console.log(`[ApiClient] Response status: ${response.status}`);

      if (!response.ok) {
        const errorMessage = await this.extractErrorMessage(response);
        console.error(`[ApiClient] Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`[ApiClient] Success:`, result);
      return result;
    } catch (error) {
      console.error(`[ApiClient] Request failed:`, error);
      throw error;
    }
  }

  private async extractErrorMessage(response: Response): Promise<string> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        // Try different error formats
        if (errorData.reason) return errorData.reason;
        if (errorData.error) return errorData.error;
        if (errorData.message) return errorData.message;
        return JSON.stringify(errorData);
      } else {
        const text = await response.text();
        return text || `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch {
      return `HTTP ${response.status}: ${response.statusText}`;
    }
  }

  async delete(endpoint: string): Promise<void> {
    console.log(`[ApiClient] DELETE ${endpoint}`);
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE'
      });

      console.log(`[ApiClient] Response status: ${response.status}`);

      if (!response.ok) {
        const errorMessage = await this.extractErrorMessage(response);
        console.error(`[ApiClient] Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      console.log(`[ApiClient] Delete successful`);
    } catch (error) {
      console.error(`[ApiClient] Delete failed:`, error);
      throw error;
    }
  }

  async getBlob(endpoint: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) {
      const errorMessage = await this.extractErrorMessage(response);
      throw new Error(errorMessage);
    }
    return response.blob();
  }
}