import { useEffect, useMemo, useRef, useState } from "react";
import { fetchWithAuthRefresh } from "@/shared/api/fetch-with-auth-refresh";
import { API_BASE_URL } from "@/shared/config/api";

export type ProtectedImage = {
  id: number | string;
  src: string;
};

type CachedImage = {
  activeCount: number;
  lastUsedAt: number;
  objectUrl: string;
};

const imageLoadRootMarginPx = 300;
const imageObjectUrlCacheLimit = 40;
const imageObjectUrlCache = new Map<string, CachedImage>();
const activeImageSrcUsageCount = new Map<string, number>();

export const protectedImagePlaceholder =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

// Проверяет, нужно ли грузить изображение через авторизованный fetch.
export function shouldFetchProtectedImage(src: string) {
  try {
    const sourceUrl = new URL(src, window.location.href);
    const apiBaseUrl = new URL(API_BASE_URL);

    return sourceUrl.origin === apiBaseUrl.origin && sourceUrl.pathname.startsWith(apiBaseUrl.pathname);
  } catch {
    return false;
  }
}

// Загружает защищенное изображение и переиспользует короткий кеш object URL.
function pruneImageObjectUrlCache() {
  if (imageObjectUrlCache.size <= imageObjectUrlCacheLimit) {
    return;
  }

  const removableImages = [...imageObjectUrlCache.entries()]
    .filter(([, cachedImage]) => cachedImage.activeCount === 0)
    .sort(([, firstImage], [, secondImage]) => firstImage.lastUsedAt - secondImage.lastUsedAt);

  for (const [src, cachedImage] of removableImages) {
    if (imageObjectUrlCache.size <= imageObjectUrlCacheLimit) {
      return;
    }

    URL.revokeObjectURL(cachedImage.objectUrl);
    imageObjectUrlCache.delete(src);
  }
}

function retainProtectedImageSrc(src: string) {
  activeImageSrcUsageCount.set(src, (activeImageSrcUsageCount.get(src) ?? 0) + 1);

  const cachedImage = imageObjectUrlCache.get(src);

  if (cachedImage) {
    cachedImage.activeCount += 1;
    cachedImage.lastUsedAt = Date.now();
  }
}

function releaseProtectedImageSrc(src: string) {
  const nextUsageCount = Math.max(0, (activeImageSrcUsageCount.get(src) ?? 0) - 1);

  if (nextUsageCount === 0) {
    activeImageSrcUsageCount.delete(src);
  } else {
    activeImageSrcUsageCount.set(src, nextUsageCount);
  }

  const cachedImage = imageObjectUrlCache.get(src);

  if (cachedImage) {
    cachedImage.activeCount = nextUsageCount;
  }

  pruneImageObjectUrlCache();
}

async function fetchProtectedImageObjectUrl(src: string) {
  const cachedImage = imageObjectUrlCache.get(src);

  if (cachedImage) {
    cachedImage.lastUsedAt = Date.now();
    return cachedImage.objectUrl;
  }

  const response = await fetchWithAuthRefresh(src);

  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.status}`);
  }

  const objectUrl = URL.createObjectURL(await response.blob());

  imageObjectUrlCache.set(src, {
    activeCount: activeImageSrcUsageCount.get(src) ?? 0,
    lastUsedAt: Date.now(),
    objectUrl,
  });
  pruneImageObjectUrlCache();

  return objectUrl;
}

function isNearViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return (
    rect.bottom >= -imageLoadRootMarginPx &&
    rect.right >= -imageLoadRootMarginPx &&
    rect.top <= window.innerHeight + imageLoadRootMarginPx &&
    rect.left <= window.innerWidth + imageLoadRootMarginPx
  );
}

// Лениво превращает URL защищенных изображений в blob URL рядом с viewport.
export function useProtectedImageSources<TImage extends ProtectedImage>(images: TImage[]) {
  const imagesRef = useRef(images);
  const imageAnchorsRef = useRef<Record<string, HTMLElement | null>>({});
  const imageSourcesRef = useRef<Record<string, string>>({});
  const activeImageSrcsRef = useRef(new Set<string>());
  const loadingImageKeysRef = useRef(new Set<string>());
  const isMountedRef = useRef(true);
  const imageSourceKey = useMemo(() => images.map((image) => `${image.id}:${image.src}`).join("\n"), [images]);
  const [visibleImageKeys, setVisibleImageKeys] = useState<Record<string, boolean>>({});
  const [imageSources, setImageSources] = useState<Record<string, string>>({});

  imagesRef.current = images;
  imageSourcesRef.current = imageSources;

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      activeImageSrcsRef.current.forEach(releaseProtectedImageSrc);
      activeImageSrcsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const nextActiveImageSrcs = new Set(
      imagesRef.current.filter((image) => shouldFetchProtectedImage(image.src)).map((image) => image.src),
    );

    nextActiveImageSrcs.forEach((src) => {
      if (!activeImageSrcsRef.current.has(src)) {
        retainProtectedImageSrc(src);
      }
    });

    activeImageSrcsRef.current.forEach((src) => {
      if (!nextActiveImageSrcs.has(src)) {
        releaseProtectedImageSrc(src);
      }
    });

    activeImageSrcsRef.current = nextActiveImageSrcs;
  }, [imageSourceKey]);

  useEffect(() => {
    setVisibleImageKeys({});
    loadingImageKeysRef.current.clear();

    setImageSources((currentSources) => {
      const nextSources: Record<string, string> = {};

      imagesRef.current.forEach((image) => {
        const imageKey = String(image.id);
        const currentSource = currentSources[imageKey];
        const cachedImage = imageObjectUrlCache.get(image.src);

        if (currentSource === image.src || cachedImage?.objectUrl === currentSource) {
          nextSources[imageKey] = currentSource;
        }
      });

      return nextSources;
    });

    imagesRef.current.forEach((image) => {
      if (!shouldFetchProtectedImage(image.src)) {
        setImageSources((currentSources) => ({
          ...currentSources,
          [String(image.id)]: image.src,
        }));
      }
    });
  }, [imageSourceKey]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      const visibleImages = imagesRef.current.reduce<Record<string, boolean>>((result, image) => {
        if (shouldFetchProtectedImage(image.src)) {
          result[String(image.id)] = true;
        }

        return result;
      }, {});

      setVisibleImageKeys((currentVisibleImages) => ({
        ...currentVisibleImages,
        ...visibleImages,
      }));

      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const imageKey = (entry.target as HTMLElement).dataset.imageKey;

          if (!imageKey) {
            return;
          }

          observer.unobserve(entry.target);
          setVisibleImageKeys((currentVisibleImages) => ({
            ...currentVisibleImages,
            [imageKey]: true,
          }));
        });
      },
      {
        rootMargin: `${imageLoadRootMarginPx}px`,
      },
    );

    const visibleImages: Record<string, boolean> = {};

    imagesRef.current.forEach((image) => {
      const imageKey = String(image.id);
      const imageAnchor = imageAnchorsRef.current[imageKey];

      if (imageAnchor && shouldFetchProtectedImage(image.src) && !imageSourcesRef.current[imageKey]) {
        if (isNearViewport(imageAnchor)) {
          visibleImages[imageKey] = true;
          return;
        }

        observer.observe(imageAnchor);
      }
    });

    if (Object.keys(visibleImages).length > 0) {
      setVisibleImageKeys((currentVisibleImages) => ({
        ...currentVisibleImages,
        ...visibleImages,
      }));
    }

    return () => {
      observer.disconnect();
    };
  }, [imageSourceKey]);

  useEffect(() => {
    imagesRef.current.forEach((image) => {
      const imageKey = String(image.id);

      if (!visibleImageKeys[imageKey] || imageSourcesRef.current[imageKey] || loadingImageKeysRef.current.has(imageKey)) {
        return;
      }

      loadingImageKeysRef.current.add(imageKey);

      fetchProtectedImageObjectUrl(image.src)
        .then((objectUrl) => {
          const isCurrentImage = imagesRef.current.some((currentImage) => String(currentImage.id) === imageKey && currentImage.src === image.src);

          if (!isMountedRef.current || !isCurrentImage) {
            return;
          }

          setImageSources((currentSources) => ({
            ...currentSources,
            [imageKey]: objectUrl,
          }));
        })
        .catch(() => {
          const isCurrentImage = imagesRef.current.some((currentImage) => String(currentImage.id) === imageKey && currentImage.src === image.src);

          if (!isMountedRef.current || !isCurrentImage) {
            return;
          }

          setImageSources((currentSources) => ({
            ...currentSources,
            [imageKey]: image.src,
          }));
        })
        .finally(() => {
          loadingImageKeysRef.current.delete(imageKey);
        });
    });
  }, [imageSourceKey, visibleImageKeys]);

  return {
    getImageSrc: (image: TImage) => {
      const imageKey = String(image.id);

      return imageSources[imageKey] ?? (shouldFetchProtectedImage(image.src) ? protectedImagePlaceholder : image.src);
    },
    registerImageAnchor: (image: TImage, element: HTMLElement | null) => {
      imageAnchorsRef.current[String(image.id)] = element;
    },
  };
}
