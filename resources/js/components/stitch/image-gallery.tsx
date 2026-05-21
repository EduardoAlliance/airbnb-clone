import { Grid3x3 } from 'lucide-react';

interface GalleryImage {
    url: string;
    alt?: string;
}

interface ImageGalleryProps {
    images: GalleryImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
    if (images.length === 0) {
        return null;
    }

    const mainImage = images[0];
    const sideImages = images.slice(1, 5);

    return (
        <div className="shadow-soft grid h-[400px] grid-cols-1 gap-3 overflow-hidden rounded-xl md:h-[560px] md:grid-cols-4 md:grid-rows-2">
            <div className="relative col-span-1 row-span-1 cursor-pointer overflow-hidden md:col-span-2 md:row-span-2">
                <img
                    className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    src={mainImage.url}
                    alt={mainImage.alt}
                />
            </div>
            {sideImages.slice(0, 2).map((img, i) => (
                <div key={i} className="relative hidden cursor-pointer overflow-hidden md:block">
                    <img
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                        src={img.url}
                        alt={img.alt}
                    />
                </div>
            ))}
            <div className="relative hidden cursor-pointer overflow-hidden rounded-tr-xl md:block">
                {sideImages[2] && (
                    <img
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                        src={sideImages[2].url}
                        alt={sideImages[2].alt}
                    />
                )}
            </div>
            <div className="relative hidden cursor-pointer overflow-hidden md:block">
                {sideImages[3] && (
                    <img
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                        src={sideImages[3].url}
                        alt={sideImages[3].alt}
                    />
                )}
            </div>
            <div className="relative hidden cursor-pointer overflow-hidden rounded-br-xl md:block">
                {sideImages[4] && (
                    <img
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                        src={sideImages[4].url}
                        alt={sideImages[4].alt}
                    />
                )}
                <button className="absolute bottom-6 right-6 flex items-center gap-2 rounded-lg border border-stitch-primary bg-stitch-surface px-4 py-2 text-label-md transition-colors hover:bg-stitch-surface-container-high">
                    <Grid3x3 className="size-[18px]" />
                    Show all photos
                </button>
            </div>
        </div>
    );
}
