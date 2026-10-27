"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Images,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { ProductImage } from "@/types/catalog";

type ProductGalleryProps = {
  productName: string;
  images: ProductImage[];
};

export function ProductGallery({
  productName,
  images,
}: ProductGalleryProps) {
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      if (a.is_primary !== b.is_primary) {
        return a.is_primary ? -1 : 1;
      }

      return a.sort_order - b.sort_order;
    });
  }, [images]);

  const [selectedImageId, setSelectedImageId] = useState(
    sortedImages[0]?.id ?? null,
  );
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const selectedIndex = Math.max(
    0,
    sortedImages.findIndex((image) => image.id === selectedImageId),
  );
  const selectedImage = sortedImages[selectedIndex];

  const closeViewer = useCallback(() => {
    setIsViewerOpen(false);
    setZoom(1);
  }, []);

  const showImage = useCallback(
    (index: number) => {
      if (!sortedImages.length) return;
      const nextIndex = (index + sortedImages.length) % sortedImages.length;
      setSelectedImageId(sortedImages[nextIndex].id);
      setZoom(1);
    },
    [sortedImages],
  );

  useEffect(() => {
    if (!isViewerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") showImage(selectedIndex - 1);
      if (event.key === "ArrowRight") showImage(selectedIndex + 1);
      if (event.key === "+" || event.key === "=") {
        setZoom((current) => Math.min(3, Number((current + 0.25).toFixed(2))));
      }
      if (event.key === "-") {
        setZoom((current) => Math.max(1, Number((current - 0.25).toFixed(2))));
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeViewer, isViewerOpen, selectedIndex, showImage]);

  if (!selectedImage) {
    return (
      <div className="overflow-hidden rounded-3xl border border-border bg-muted">
        <div className="flex aspect-square flex-col items-center justify-center text-muted-foreground">
          <span className="text-sm">Imagen próximamente</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="group relative overflow-hidden rounded-3xl border border-border bg-muted">
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setIsViewerOpen(true);
            }}
            aria-label={`Ampliar fotos de ${productName}`}
            className="relative block aspect-square w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.alt_text ?? productName}
              className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02] sm:p-5"
            />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs font-medium text-white opacity-100 shadow-sm transition sm:opacity-0 sm:group-hover:opacity-100">
              <ZoomIn size={15} />
              Ver fotos y ampliar
            </span>
          </button>
        </div>

        {sortedImages.length > 1 && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {sortedImages.map((image, index) => {
              const isSelected = image.id === selectedImage.id;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImageId(image.id)}
                  aria-label={`Ver imagen ${index + 1} de ${productName}`}
                  aria-pressed={isSelected}
                  className={`relative overflow-hidden rounded-xl border-2 bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSelected ? "border-primary" : "border-transparent hover:border-border"}`}
                >
                  <div className="aspect-square">
                    <img
                      src={image.url}
                      alt={image.alt_text ?? `${productName}, foto ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Images size={14} />
          Selecciona una foto para verla en grande y explorar sus detalles.
        </p>
      </div>

      {isViewerOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de imágenes de ${productName}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeViewer();
          }}
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/15 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium sm:text-base">{productName}</p>
              <p className="text-xs text-white/65">
                Foto {selectedIndex + 1} de {sortedImages.length}
                {zoom > 1 ? ` · Zoom ${Math.round(zoom * 100)}%` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((current) => Math.max(1, Number((current - 0.25).toFixed(2))))}
                disabled={zoom <= 1}
                aria-label="Reducir zoom"
                title="Reducir zoom (−)"
                className="rounded-full border border-white/20 p-2.5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ZoomOut size={19} />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                aria-label="Restablecer zoom"
                title="Restablecer zoom"
                className="hidden rounded-full border border-white/20 px-3 py-2 text-xs transition hover:bg-white/10 sm:inline-flex"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((current) => Math.min(3, Number((current + 0.25).toFixed(2))))}
                disabled={zoom >= 3}
                aria-label="Aumentar zoom"
                title="Aumentar zoom (+)"
                className="rounded-full border border-white/20 p-2.5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ZoomIn size={19} />
              </button>
              <button
                type="button"
                onClick={closeViewer}
                aria-label="Cerrar galería"
                title="Cerrar (Esc)"
                className="ml-1 rounded-full bg-white/10 p-2.5 transition hover:bg-white/20"
              >
                <X size={21} />
              </button>
            </div>
          </header>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-14 py-4 sm:px-20 sm:py-6">
            {sortedImages.length > 1 && (
              <button
                type="button"
                onClick={() => showImage(selectedIndex - 1)}
                aria-label="Foto anterior"
                title="Foto anterior (←)"
                className="absolute left-2 z-10 rounded-full border border-white/20 bg-black/40 p-2.5 transition hover:bg-white/15 sm:left-5 sm:p-3"
              >
                <ChevronLeft size={25} />
              </button>
            )}

            <div className="flex h-full w-full items-center justify-center overflow-auto">
              <img
                key={selectedImage.id}
                src={selectedImage.url}
                alt={selectedImage.alt_text ?? productName}
                draggable={false}
                className="max-h-full max-w-full select-none object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                }}
              />
            </div>

            {sortedImages.length > 1 && (
              <button
                type="button"
                onClick={() => showImage(selectedIndex + 1)}
                aria-label="Foto siguiente"
                title="Foto siguiente (→)"
                className="absolute right-2 z-10 rounded-full border border-white/20 bg-black/40 p-2.5 transition hover:bg-white/15 sm:right-5 sm:p-3"
              >
                <ChevronRight size={25} />
              </button>
            )}
          </div>

          {sortedImages.length > 1 && (
            <div className="flex shrink-0 justify-center gap-2 overflow-x-auto border-t border-white/15 px-4 py-3">
              {sortedImages.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => showImage(index)}
                  aria-label={`Abrir foto ${index + 1}`}
                  aria-pressed={image.id === selectedImage.id}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-16 ${image.id === selectedImage.id ? "border-white" : "border-white/20 opacity-60 hover:opacity-100"}`}
                >
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="shrink-0 pb-2 text-center text-[11px] text-white/45 sm:pb-3">
            Usa las flechas para cambiar de foto · + / − para ampliar · Esc para cerrar
          </div>
        </div>
      )}
    </>
  );
}
