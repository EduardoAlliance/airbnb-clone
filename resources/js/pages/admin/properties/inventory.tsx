import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { InventoryTable } from '@/components/admin/inventory-table';
import { GenerateInventoryModal, type GenerateConfig } from '@/components/admin/generate-inventory-modal';
import type { InventoryDay, InventoryUpdate } from '@/types/inventory';

interface Props {
    property: {
        id: number;
        title: string;
        base_price: number;
    };
    inventory: InventoryDay[];
    existingDates: string[];
}

export default function InventoryIndex({ property, inventory, existingDates }: Props) {
    const [pendingUpdates, setPendingUpdates] = useState<InventoryUpdate[]>([]);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showGenerate, setShowGenerate] = useState(false);

    function handleUpdate(date: string, updates: Partial<InventoryDay>) {
        setPendingUpdates((prev) => {
            const existing = prev.findIndex((u) => u.date === date);
            const entry = { date, ...updates };
            if (existing >= 0) {
                const next = [...prev];
                next[existing] = { ...next[existing], ...entry };
                return next;
            }
            return [...prev, entry];
        });
    }

    function handleSave() {
        if (pendingUpdates.length === 0) return;
        setSaving(true);
        router.put(
            `/admin/properties/${property.id}/inventory`,
            { dates: pendingUpdates },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPendingUpdates([]);
                    setSaving(false);
                },
                onError: () => setSaving(false),
            }
        );
    }

    function handleGenerate(config: GenerateConfig) {
        setGenerating(true);
        setShowGenerate(false);
        router.post(
            `/admin/properties/${property.id}/inventory/generate`,
            config,
            {
                preserveScroll: true,
                onFinish: () => setGenerating(false),
            }
        );
    }

    return (
        <>
            <Head title={`Inventory - ${property.title}`} />

            <div className="mb-6">
                <Link
                    href={`/admin/properties/${property.id}`}
                    className="inline-flex items-center gap-2 text-label-md text-stitch-on-surface-variant hover:text-stitch-primary transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    Back to {property.title}
                </Link>
            </div>

            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="font-display text-display-lg text-stitch-primary mb-2">
                        Inventory Calendar
                    </h2>
                    <p className="text-body-lg text-stitch-on-surface-variant">
                        {property.title} &middot; ${property.base_price.toFixed(2)} base price
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {pendingUpdates.length > 0 && (
                        <span className="text-label-sm text-stitch-primary font-bold">
                            {pendingUpdates.length} unsaved change(s)
                        </span>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => setShowGenerate(true)}
                        disabled={generating}
                    >
                        {generating ? (
                            <Spinner />
                        ) : (
                            <RefreshCw className="size-4" />
                        )}
                        Generate Inventory
                    </Button>
                    <Button onClick={handleSave} disabled={saving || pendingUpdates.length === 0}>
                        {saving ? <Spinner /> : <Save className="size-4" />}
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-label-sm">
                        <div className="w-4 h-4 rounded bg-stitch-primary-fixed/20 border border-stitch-primary-fixed" />
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2 text-label-sm">
                        <div className="w-4 h-4 rounded bg-stitch-error-container/20 border border-stitch-error-container" />
                        <span>Unavailable</span>
                    </div>
                    <div className="flex items-center gap-2 text-label-sm">
                        <div className="w-4 h-4 rounded bg-stitch-surface-variant opacity-40" />
                        <span>Closed</span>
                    </div>
                    <div className="flex items-center gap-2 text-label-sm ml-auto">
                        <div className="w-4 h-4 rounded border-2 border-dashed border-amber-300 bg-amber-100/60" />
                        <span>No record</span>
                    </div>
                    <div className="flex items-center gap-2 text-label-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span>Unsaved</span>
                    </div>
                </div>
                <InventoryTable
                    inventory={inventory}
                    basePrice={property.base_price}
                    existingDates={existingDates}
                    pendingUpdates={pendingUpdates}
                    onUpdate={handleUpdate}
                />
            </div>

            <GenerateInventoryModal
                open={showGenerate}
                onOpenChange={setShowGenerate}
                onGenerate={handleGenerate}
                basePrice={property.base_price}
                existingDates={existingDates}
                generating={generating}
            />
        </>
    );
}
