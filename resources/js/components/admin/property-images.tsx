import { useCallback, useRef } from 'react';
import { CloudUpload, Trash2 } from 'lucide-react';

interface ExistingImage {
    id: number;
    url: string;
    name: string;
}

interface PropertyImagesProps {
    newFiles: File[];
    existingImages?: ExistingImage[];
    onAddFiles: (files: File[]) => void;
    onRemoveFile: (index: number) => void;
    onRemoveExisting?: (id: number) => void;
}

export function PropertyImages({
    newFiles,
    existingImages,
    onAddFiles,
    onRemoveFile,
    onRemoveExisting,
}: PropertyImagesProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files).filter((f) =>
                f.type.startsWith('image/')
            );
            if (files.length) onAddFiles(files);
        },
        [onAddFiles]
    );

    const handleSelect = () => inputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length) onAddFiles(files);
        e.target.value = '';
    };

    return (
        <div>
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={handleSelect}
                className="border-2 border-dashed border-stitch-outline-variant rounded-xl p-8 text-center cursor-pointer hover:border-stitch-primary transition-colors"
            >
                <CloudUpload className="size-10 text-stitch-primary mx-auto mb-3" />
                <p className="text-label-md text-stitch-on-surface-variant">
                    Drag & drop images here, or click to select
                </p>
                <p className="text-label-sm text-stitch-outline mt-1">
                    PNG, JPG, WebP up to 10MB
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {(existingImages && existingImages.length > 0) || newFiles.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {existingImages?.map((img) => (
                        <div key={img.id} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-stitch-surface-variant">
                            <img
                                src={img.url}
                                alt={img.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => onRemoveExisting?.(img.id)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                    ))}
                    {newFiles.map((file, i) => (
                        <div key={`new-${i}`} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-stitch-surface-variant">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => onRemoveFile(i)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
