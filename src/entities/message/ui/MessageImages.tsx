import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { ImageViewer } from "./ImageViewer";

export interface MessageImagesProps {
  images: string[];
}

export function MessageImages({ images }: MessageImagesProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className={`mt-2 gap-2 ${
        images.length === 1 ? 'grid grid-cols-1' :
        images.length === 2 ? 'grid grid-cols-2' :
        'grid grid-cols-2 md:grid-cols-3'
      }`}>
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative rounded-lg overflow-hidden bg-muted ${
              images.length === 1 ? 'aspect-video max-w-md' : 'aspect-square'
            }`}
          >
            <img
              src={img}
              alt={`Изображеніе ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
              onClick={() => setViewerIndex(i)}
            />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {viewerIndex !== null && (
          <ImageViewer
            images={images}
            initialIndex={viewerIndex}
            onClose={() => setViewerIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
