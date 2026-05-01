import { API_BASE_URL } from "@/shared/config/api";

export function getTaskImageSrc(imageUrl: string) {
  return imageUrl.startsWith("http") ? imageUrl : `${API_BASE_URL}${imageUrl}`;
}
