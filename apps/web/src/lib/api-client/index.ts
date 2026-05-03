export interface ApiClientConfig {
  baseUrl?: string;
}

export function createApiClient(_config: ApiClientConfig = {}) {
  return {
    ready: false as const,
  };
}

export * from "./image-assets";
export * from "./batches";
