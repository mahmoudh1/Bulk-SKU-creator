export const supportedImageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export type SupportedImageMimeType = (typeof supportedImageMimeTypes)[number];

export type ImageAssetErrorCode =
  | "INVALID_FILE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "UPLOAD_FAILED"
  | "UNAUTHORIZED"
  | "MISSING_ORGANIZATION";

export interface ImageAssetApiError {
  code: ImageAssetErrorCode;
  message: string;
}

export interface CreateImageAssetInput {
  organizationId: string;
  file: File;
}

export interface ImageAssetDto {
  image_id: string;
  organization_id: string;
  filename: string;
  media_type: SupportedImageMimeType;
  size_bytes: number;
  created_at: string;
}

const imageAssetsStorageKey = "bulk-sku-creator:image-assets:v1";

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredImageAssets(): ImageAssetDto[] {
  if (!canUseBrowserStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(imageAssetsStorageKey);
    return raw ? (JSON.parse(raw) as ImageAssetDto[]) : [];
  } catch {
    return [];
  }
}

function writeStoredImageAssets(assets: ImageAssetDto[]) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(imageAssetsStorageKey, JSON.stringify(assets));
}

function shouldUseLocalFallback() {
  return import.meta.env.MODE === "test";
}

async function parseApiError(response: Response): Promise<ImageAssetApiError> {
  try {
    const body = (await response.json()) as ImageAssetApiError;

    if (body?.code && body?.message) {
      return body;
    }
  } catch {
    // Fall through to a stable client-facing error.
  }

  return { code: "UPLOAD_FAILED", message: "Image service could not store the asset. Try again." };
}

export function listStoredImageAssets(organizationId: string) {
  return readStoredImageAssets().filter((asset) => asset.organization_id === organizationId);
}

export function findStoredImageAsset(imageId: string, organizationId: string) {
  return listStoredImageAssets(organizationId).find((asset) => asset.image_id === imageId) ?? null;
}

export function isSupportedImageType(type: string): type is SupportedImageMimeType {
  return supportedImageMimeTypes.includes(type as SupportedImageMimeType);
}

export function validateImageFile(file: File | null): ImageAssetApiError | null {
  if (!file) {
    return { code: "INVALID_FILE", message: "Choose one supported product image before uploading." };
  }

  if (!isSupportedImageType(file.type)) {
    return {
      code: "UNSUPPORTED_MEDIA_TYPE",
      message: "Unsupported image type. Upload a JPG, PNG, or WebP product image.",
    };
  }

  if (file.size === 0) {
    return { code: "INVALID_FILE", message: "The selected image is empty. Choose a different file." };
  }

  return null;
}

export async function createImageAsset({ file, organizationId }: CreateImageAssetInput): Promise<ImageAssetDto> {
  if (!organizationId) {
    throw { code: "MISSING_ORGANIZATION", message: "Select an active workspace before uploading images." } satisfies ImageAssetApiError;
  }

  const validationError = validateImageFile(file);

  if (validationError) {
    throw validationError;
  }

  if (!shouldUseLocalFallback()) {
    const formData = new FormData();
    formData.append("organizationId", organizationId);
    formData.append("file", file);

    const response = await fetch("/api/image-assets", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return (await response.json()) as ImageAssetDto;
  }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

  const asset = {
    image_id: `img_${organizationId}_${safeName}`,
    organization_id: organizationId,
    filename: file.name,
    media_type: file.type as SupportedImageMimeType,
    size_bytes: file.size,
    created_at: new Date().toISOString(),
  };

  const existing = readStoredImageAssets().filter((storedAsset) => storedAsset.image_id !== asset.image_id);
  writeStoredImageAssets([...existing, asset]);

  return asset;
}
