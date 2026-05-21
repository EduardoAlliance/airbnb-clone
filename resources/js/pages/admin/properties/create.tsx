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

interface Props {
    amenities: Amenity[];
    policies: Policy[];
}

export default function Create({ amenities, policies }: Props) {
    const [data, setData] = useState<Record<string, any>>({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        latitude: '',
        longitude: '',
        guests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: '1',
        base_price: '',
        cleaning_fee: '0',
        status: 'draft',
        amenities: [] as number[],
        policies: [] as number[],
    });
    const [files, setFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleSetData(key: string, value: any) {
        setData((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'amenities' || key === 'policies') {
                (value as number[]).forEach((id) => formData.append(`${key}[]`, id.toString()));
            } else {
                formData.append(key, value as string);
            }
        });
        files.forEach((file) => formData.append('images[]', file));

        router.post('/admin/properties', formData, {
            onSuccess: () => setProcessing(false),
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
        });
    }

    return (
        <>
            <Head title="Create Property" />

            <header className="mb-8">
                <h2 className="font-display text-display-lg text-stitch-primary mb-2">
                    Create Property
                </h2>
                <p className="text-body-lg text-stitch-on-surface-variant">
                    Add a new cabin to your listings
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
                    />
                </div>

                <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                    <h3 className="font-display text-headline-md text-stitch-primary mb-6">
                        Images
                    </h3>
                    <PropertyImages
                        newFiles={files}
                        onAddFiles={(newFiles) => setFiles((prev) => [...prev, ...newFiles])}
                        onRemoveFile={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
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
                        Create Property
                    </Button>
                </div>
            </form>
        </>
    );
}
