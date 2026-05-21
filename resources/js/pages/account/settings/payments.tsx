import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { CreditCard, Plus, Trash2, Wallet } from 'lucide-react';

const savedCards = [
    { id: 1, brand: 'Visa', ending: '4242', expires: '12/26', icon: CreditCard },
    { id: 2, brand: 'Mastercard', ending: '8812', expires: '05/25', icon: Wallet },
];

export default function GuestPayments() {
    const [showAddCard, setShowAddCard] = useState(false);

    return (
        <>
            <Head title="Payment settings" />

            <section className="bg-stitch-surface-container-lowest rounded-xl p-8 shadow-[0_4px_20px_-2px_rgba(24,36,19,0.15)] border border-stitch-outline-variant/10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-headline-sm text-stitch-primary">Payment Methods</h2>
                    <button
                        onClick={() => setShowAddCard(!showAddCard)}
                        className="flex items-center gap-2 text-stitch-secondary text-label-md hover:underline"
                    >
                        <Plus className="size-4" />
                        Add New Method
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-6">
                    {savedCards.map((card) => (
                        <div
                            key={card.id}
                            className="p-gutter border border-stitch-outline-variant/30 rounded-xl flex items-center justify-between hover:bg-stitch-surface-container-low transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-stitch-surface-variant p-2 rounded">
                                    <card.icon className="size-5 text-stitch-secondary" />
                                </div>
                                <div>
                                    <p className="text-label-md text-stitch-primary">{card.brand} ending in {card.ending}</p>
                                    <p className="text-label-sm text-stitch-on-surface-variant">Expires {card.expires}</p>
                                </div>
                            </div>
                            <button className="text-stitch-on-surface-variant hover:text-stitch-error opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {showAddCard && (
                    <div className="border border-stitch-outline-variant/30 rounded-xl p-6 space-y-6 bg-stitch-surface-container-low/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-label-sm text-stitch-on-surface-variant">Cardholder Name</label>
                                <input
                                    className="bg-transparent border-0 border-b border-stitch-outline-variant focus:ring-0 focus:border-stitch-primary px-0 py-2 text-body-md text-stitch-on-surface"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-label-sm text-stitch-on-surface-variant">Card Number</label>
                                <input
                                    className="bg-transparent border-0 border-b border-stitch-outline-variant focus:ring-0 focus:border-stitch-primary px-0 py-2 text-body-md text-stitch-on-surface"
                                    placeholder="0000 0000 0000 0000"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-label-sm text-stitch-on-surface-variant">Expiry Date</label>
                                <input
                                    className="bg-transparent border-0 border-b border-stitch-outline-variant focus:ring-0 focus:border-stitch-primary px-0 py-2 text-body-md text-stitch-on-surface"
                                    placeholder="MM/YY"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-label-sm text-stitch-on-surface-variant">CVC</label>
                                <input
                                    className="bg-transparent border-0 border-b border-stitch-outline-variant focus:ring-0 focus:border-stitch-primary px-0 py-2 text-body-md text-stitch-on-surface"
                                    placeholder="***"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button className="px-6 py-2 bg-stitch-primary text-stitch-on-primary rounded-lg text-label-md hover:opacity-90 transition-opacity">
                                Save Card
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}
