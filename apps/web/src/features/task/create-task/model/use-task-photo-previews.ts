import { useEffect, useState, type ChangeEvent } from "react";

export type TaskPhotoPreview = {
  id: string;
  index: number;
  name: string;
  url: string;
};

type UseTaskPhotoPreviewsParams = {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
};

export function useTaskPhotoPreviews({ photos, onPhotosChange }: UseTaskPhotoPreviewsParams) {
  const [photoPreviews, setPhotoPreviews] = useState<TaskPhotoPreview[]>([]);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith("image/"));

      if (!files.length) {
        return;
      }

      onPhotosChange([...photos, ...files]);
    };

    window.addEventListener("paste", onPaste);

    return () => {
      window.removeEventListener("paste", onPaste);
    };
  }, [onPhotosChange, photos]);

  useEffect(() => {
    const nextPreviews = photos.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${file.size}-${index}`,
      index,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPhotoPreviews(nextPreviews);
    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [photos]);

  const handlePhotosChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));

    if (files.length === 0) {
      return;
    }

    onPhotosChange([...photos, ...files]);
    event.target.value = "";
  };

  const handleRemovePhoto = (photoIndex: number) => {
    onPhotosChange(photos.filter((_, index) => index !== photoIndex));
  };

  return {
    photoPreviews,
    handlePhotosChange,
    handleRemovePhoto,
  };
}
