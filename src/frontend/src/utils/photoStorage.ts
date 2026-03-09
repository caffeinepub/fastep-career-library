/**
 * Photo storage utilities.
 *
 * Photos are compressed and stored as base64 data URLs directly in the
 * backend's `photoKey` field. This avoids content-type issues with the
 * storage gateway and ensures photos are always displayed correctly.
 */

const MAX_DIMENSION = 400; // max width/height in px
const JPEG_QUALITY = 0.75; // 0–1

/**
 * Compress an image File/Blob to a small JPEG and return it as a base64
 * data URL (e.g. "data:image/jpeg;base64,...").
 */
async function compressToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height, 1);
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };
    img.src = url;
  });
}

/**
 * Upload a photo. Returns a base64 data URL string that can be stored
 * directly as `photoKey` in the backend.
 *
 * The `identity` parameter is kept for API compatibility but is not used
 * because photos are stored in-canister.
 */
export async function uploadPhoto(
  file: File | Blob,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _identity?: unknown,
): Promise<string> {
  const dataUrl = await compressToBase64(file);
  return dataUrl;
}

/**
 * Get the displayable URL for a stored photo key.
 *
 * If the key is already a data URL it is returned as-is. Otherwise an
 * empty string is returned so callers fall through to the avatar fallback.
 *
 * The `identity` parameter is kept for API compatibility.
 */
export async function getPhotoUrl(
  hash: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _identity?: unknown,
): Promise<string> {
  if (!hash) return "";
  // Data URL – return directly
  if (hash.startsWith("data:")) return hash;
  // Legacy storage-gateway hash – try to build the URL (best-effort)
  try {
    const response = await fetch("/env.json");
    const env = await response.json();
    const storageGatewayUrl = env.storage_gateway_url || env.backend_host || "";
    const backendCanisterId = env.backend_canister_id || "";
    const projectId = env.project_id || "";
    if (storageGatewayUrl && backendCanisterId && projectId) {
      return `${storageGatewayUrl}/v1/blob/?blob_hash=${encodeURIComponent(hash)}&owner_id=${encodeURIComponent(backendCanisterId)}&project_id=${encodeURIComponent(projectId)}`;
    }
  } catch {
    // ignore
  }
  return "";
}
