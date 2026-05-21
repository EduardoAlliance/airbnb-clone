import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PropertyForm } from '@/components/admin/property-form';
import { PropertyImages } from '@/components/admin/property-images';

interface Amenity {
    id: number;
    name: string;
    slug: string;
}

interface Policy {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface ExistingImage {
    id: number;
    url: string;
    name: string;
}

interface Props {
    property: {
        id: number;
        title: string;
        description: string;
        address: string;
        city: string;
        state: string;
        country: string;
        postal_code: string | null;
        latitude: number | null;
        longitude: number | null;
        guests: number;
        bedrooms: number;
        beds: number;
        bathrooms: number;
        base_price: number;
        cleaning_fee: number;
        check_in_time?: string | null;
        check_out_time?: string | null;
        status: 'draft' | 'published';
        amenities: number[];
        policies: number[];
        existing_images: ExistingImage[];
    };
    amenities: Amenity[];
    policies: Policy[];
}

export default function Edit({ property, amenities, policies }: Props) {
    const [data, setData] = useState<Record<string, any>>({
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        state: property.state,
        country: property.country,
        postal_code: property.postal_code ?? '',
        latitude: property.latitude?.toString() ?? '',
        longitude: property.longitude?.toString() ?? '',
        guests: property.guests,
        bedrooms: property.bedrooms,
        beds: property.beds,
        bathrooms: property.bathrooms.toString(),
        base_price: property.base_price.toString(),
        cleaning_fee: property.cleaning_fee.toString(),
        check_in_time: property.check_in_time ?? '',
        check_out_time: property.check_out_time ?? '',
        status: property.status,
        amenities: property.amenities,
        policies: property.policies,
    });
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [removeImages, setRemoveImages] = useState<number[]>([]);
    const [existingImages, setExistingImages] = useState<ExistingImage[]>(property.existing_images);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleSetData(key: string, value: any) {
        setData((prev) => ({ ...prev, [key]: value }));
    }

    function handleRemoveExisting(id: number) {
        setRemoveImages((prev) => [...prev, id]);
        setExistingImages((prev) => prev.filter((img) => img.id !== id));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'amenities' || key === 'policies') {
                (value as number[]).forEach((id) => formData.append(`${key}[]`, id.toString()));
            } else {
                formData.append(key, value as string);
            }
        });
        removeImages.forEach((id) => formData.append('remove_images[]', id.toString()));
        newFiles.forEach((file) => formData.append('images[]', file));

        router.post(`/admin/properties/${property.id}`, formData, {
            onSuccess: () => setProcessing(false),
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
        });
    }

    return (
        <>
            <Head title="Edit Property" />

            <header className="mb-8">
                <h2 className="font-display text-display-lg text-stitch-primary mb-2">
                    Edit Property
                </h2>
                <p className="text-body-lg text-stitch-on-surface-variant">
                    {property.title}
                </p>
            </header>

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
                <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                    <h3 className="font-display text-headline-md text-stitch-primary mb-6">
                        Basic Information
                    </h3>
                    <PropertyForm
                        data={data}
                        setData={handleSetData}
                        errors={errors}
                        processing={processing}
                        amenities={amenities}
                        selectedAmenities={data.amenities}
                        policies={policies}
                        selectedPolicies={data.policies}
                        isEdit
                    />
                </div>

                <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                    <h3 className="font-display text-headline-md text-stitch-primary mb-6">
                        Images
                    </h3>
                    <PropertyImages
                        newFiles={newFiles}
                        existingImages={existingImages}
                        onAddFiles={(files) => setNewFiles((prev) => [...prev, ...files])}
                        onRemoveFile={(i) => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        onRemoveExisting={handleRemoveExisting}
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.get('/admin/properties')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing && <Spinner />}
                        Update Property
                    </Button>
                </div>
            </form>
        </>
    );
}
