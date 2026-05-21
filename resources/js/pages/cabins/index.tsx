import { Head } from '@inertiajs/react';
import { Navbar } from '@/components/stitch/navbar';
import { CabinCard } from '@/components/stitch/cabin-card';
import { Footer } from '@/components/stitch/footer';
import { Search, SlidersHorizontal } from 'lucide-react';
interface CabinCardData {
    id: number;
    slug: string;
    title: string;
    location: string;
    price: number;
    rating: number;
    imageUrl: string;
    imageAlt?: string;
    href: string;
    badges: string[];
}

export default function CabinsIndex({ cabins }: { cabins: CabinCardData[] }) {
    return (
        <>
            <Head title="Explore Cabins" />

            <div className="min-h-screen bg-stitch-surface text-stitch-on-surface font-body">
                <Navbar
                    links={[
                        { label: 'Explore', href: '/cabins', active: true },
                        { label: 'My Bookings', href: '#' },
                        { label: 'Notifications', href: '#' },
                    ]}
                />

                <main className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop py-12">
                    <div className="mb-10">
                        <h1 className="text-display-lg-mobile mb-2 text-stitch-primary md:text-display-lg">
                            Explore Cabins
                        </h1>
                        <p className="max-w-2xl text-body-lg text-stitch-on-surface-variant">
                            Discover handcrafted retreats in nature&apos;s most serene landscapes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
                        <aside className="hidden lg:block lg:col-span-4">
                            <div className="sticky top-[112px] space-y-6 rounded-2xl border border-stitch-outline-variant bg-white p-6 shadow-soft">
                                <div className="flex items-center gap-2 border-b border-stitch-outline-variant pb-4">
                                    <SlidersHorizontal className="size-5 text-stitch-primary" />
                                    <span className="text-headline-sm font-bold text-stitch-primary">
                                        Filters
                                    </span>
                                </div>

                                <div>
                                    <label className="mb-2 block text-label-md font-semibold text-stitch-primary">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stitch-outline" />
                                        <input
                                            type="text"
                                            placeholder="Search cabins..."
                                            className="w-full rounded-xl border border-stitch-outline-variant bg-stitch-surface py-2.5 pl-10 pr-4 text-body-md text-stitch-on-surface placeholder:text-stitch-outline focus:border-stitch-primary focus:outline-hidden"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-label-md font-semibold text-stitch-primary">
                                        Price range
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="w-full rounded-xl border border-stitch-outline-variant bg-stitch-surface px-3 py-2 text-body-md text-stitch-on-surface placeholder:text-stitch-outline focus:border-stitch-primary focus:outline-hidden"
                                        />
                                        <span className="text-stitch-outline">&ndash;</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="w-full rounded-xl border border-stitch-outline-variant bg-stitch-surface px-3 py-2 text-body-md text-stitch-on-surface placeholder:text-stitch-outline focus:border-stitch-primary focus:outline-hidden"
                                        />
                                    </div>
                                </div>

                                <button className="w-full rounded-xl bg-stitch-primary py-3 text-label-md font-bold text-stitch-on-primary transition-colors hover:opacity-90">
                                    Apply Filters
                                </button>
                            </div>
                        </aside>

                        <div className="lg:col-span-8">
                            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
                                {cabins.map((cabin) => (
                                    <CabinCard
                                        key={cabin.id}
                                        title={cabin.title}
                                        location={cabin.location}
                                        price={cabin.price}
                                        rating={cabin.rating}
                                        imageUrl={cabin.imageUrl}
                                        imageAlt={cabin.imageAlt}
                                        badges={cabin.badges}
                                        href={cabin.href}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
