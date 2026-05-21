import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function PolicyCreate() {
    const [data, setData] = useState({
        name: '',
        slug: '',
        type: 'cancellation',
        description: '',
        rules_before_14_days: '100',
        rules_before_7_days: '75',
        rules_after: '0',
        is_active: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleChange(key: string, value: any) {
        setData((prev) => {
            const next = { ...prev, [key]: value };
            if (key === 'name' && !prev.slug) {
                next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            }
            return next;
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const rules = {
            before_14_days: parseInt(data.rules_before_14_days, 10) || 0,
            before_7_days: parseInt(data.rules_before_7_days, 10) || 0,
            after: parseInt(data.rules_after, 10) || 0,
        };

        router.post('/admin/policies', {
            ...data,
            rules: JSON.stringify(rules),
        }, {
            onSuccess: () => setProcessing(false),
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setProcessing(false);
            },
        });
    }

    const isCancellation = data.type === 'cancellation';

    return (
        <>
            <Head title="Create Policy" />
            <header className="mb-8">
                <h2 className="font-display text-display-lg text-stitch-primary mb-2">Create Policy</h2>
                <p className="text-body-lg text-stitch-on-surface-variant">Define cancellation rules and other policies</p>
            </header>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
                <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-label-md font-medium text-stitch-on-surface">Name</label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full border border-stitch-outline-variant rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-stitch-primary"
                                placeholder="Flexible"
                            />
                            {errors.name && <p className="text-label-sm text-stitch-error">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="slug" className="text-label-md font-medium text-stitch-on-surface">Slug</label>
                            <input
                                id="slug"
                                value={data.slug}
                                onChange={(e) => handleChange('slug', e.target.value)}
                                className="w-full border border-stitch-outline-variant rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-stitch-primary"
                                placeholder="flexible"
                            />
                            {errors.slug && <p className="text-label-sm text-stitch-error">{errors.slug}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="type" className="text-label-md font-medium text-stitch-on-surface">Type</label>
                        <select
                            id="type"
                            value={data.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                            className="w-full border border-stitch-outline-variant rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-stitch-primary"
                        >
                            <option value="cancellation">Cancellation</option>
                            <option value="house_rules">House Rules</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.type && <p className="text-label-sm text-stitch-error">{errors.type}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-label-md font-medium text-stitch-on-surface">Description</label>
                        <textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full border border-stitch-outline-variant rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-stitch-primary"
                            placeholder="Free cancellation up to 24 hours before check-in."
                        />
                        {errors.description && <p className="text-label-sm text-stitch-error">{errors.description}</p>}
                    </div>

                    {isCancellation && (
                        <div className="space-y-4">
                            <label className="text-label-md font-medium text-stitch-on-surface">Refund Rules</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                                <div className="space-y-2">
                                    <label className="text-label-sm text-stitch-on-surface-variant">14+ days before check-in</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={data.rules_before_14_days}
                                            onChange={(e) => handleChange('rules_before_14_days', e.target.value)}
                                            className="w-full border border-stitch-outline-variant rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-stitch-primary"
                                        />
                                        <span className="text-label-sm text-stitch-on-surface-variant shrink-0">%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label-sm text-stitch-on-surface-variant">7–13 days before check-in</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={data.rules_before_7_days}
                                            onChange={(e) => handleChange('rules_before_7_days', e.target.value)}
                                            className="w-full border border-stitch-outline-variant rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-stitch-primary"
                                        />
                                        <span className="text-label-sm text-stitch-on-surface-variant shrink-0">%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label-sm text-stitch-on-surface-variant">Less than 7 days</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={data.rules_after}
                                            onChange={(e) => handleChange('rules_after', e.target.value)}
                                            className="w-full border border-stitch-outline-variant rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-stitch-primary"
                                        />
                                        <span className="text-label-sm text-stitch-on-surface-variant shrink-0">%</span>
                                    </div>
                                </div>
                            </div>
                            {errors.rules && <p className="text-label-sm text-stitch-error">{errors.rules}</p>}
                        </div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            className="size-5 rounded border-stitch-outline-variant text-stitch-primary focus:ring-stitch-primary"
                        />
                        <span className="text-body-md text-stitch-on-surface">Active</span>
                    </label>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.get('/admin/policies')}>Cancel</Button>
                    <Button type="submit" disabled={processing}>
                        {processing && <Spinner />}
                        Create Policy
                    </Button>
                </div>
            </form>
        </>
    );
}
