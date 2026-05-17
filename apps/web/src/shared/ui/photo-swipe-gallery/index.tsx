import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ImgHTMLAttributes, type ReactNode } from "react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import { protectedImagePlaceholder, useProtectedImageSources } from "@/shared/lib/protected-image";

type PhotoSwipeImage = {
  id: number | string;
  name: string;
  src: string;
};

type ImageSize = {
  height: number;
  width: number;
};

type PhotoSwipeGalleryProps<TImage extends PhotoSwipeImage> = {
  className?: string;
  images: TImage[];
  renderImage: (params: {
    image: TImage;
    imageProps: ImgHTMLAttributes<HTMLImageElement>;
    linkProps: AnchorHTMLAttributes<HTMLAnchorElement> & {
      "data-image-key": string;
      "data-pswp-height": number;
      "data-pswp-width": number;
      ref?: (element: HTMLAnchorElement | null) => void;
    };
  }) => ReactNode;
};

const fallbackSize: ImageSize = {
  height: 1200,
  width: 1600,
};

export function PhotoSwipeGallery<TImage extends PhotoSwipeImage>({ className, images, renderImage }: PhotoSwipeGalleryProps<TImage>) {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const { getImageSrc, registerImageAnchor } = useProtectedImageSources(images);
  const [sizes, setSizes] = useState<Record<string, ImageSize>>({});

  useEffect(() => {
    if (!galleryRef.current) {
      return undefined;
    }

    const lightbox = new PhotoSwipeLightbox({
      gallery: galleryRef.current,
      children: "a",
      pswpModule: () => import("photoswipe"),
    });

    lightbox.init();

    return () => {
      lightbox.destroy();
    };
  }, [images.length]);

  return (
    <div ref={galleryRef} className={className}>
      {images.map((image) => {
        const imageKey = String(image.id);
        const imageSrc = getImageSrc(image);
        const size = sizes[imageKey] ?? fallbackSize;

        return renderImage({
          image,
          linkProps: {
            "aria-label": `Открыть фото ${image.name}`,
            "data-pswp-height": size.height,
            "data-pswp-width": size.width,
            "data-image-key": imageKey,
            href: imageSrc,
            ref: (element) => {
              registerImageAnchor(image, element);
            },
            rel: "noreferrer",
            target: "_blank",
          },
          imageProps: {
            alt: image.name,
            loading: "lazy",
            onLoad: (event) => {
              const { naturalHeight, naturalWidth } = event.currentTarget;

              if (imageSrc === protectedImagePlaceholder || naturalHeight === 0 || naturalWidth === 0) {
                return;
              }

              setSizes((currentSizes) => ({
                ...currentSizes,
                [imageKey]: {
                  height: naturalHeight,
                  width: naturalWidth,
                },
              }));
            },
            src: imageSrc,
          },
        });
      })}
    </div>
  );
}
