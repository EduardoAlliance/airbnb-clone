import { Head, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/stitch/navbar';
import { CabinCard } from '@/components/stitch/cabin-card';
import { SearchBar } from '@/components/stitch/search-bar';
import { Footer } from '@/components/stitch/footer';
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

export default function Welcome({
    canRegister = true,
    featuredCabins = [],
}: {
    canRegister?: boolean;
    featuredCabins?: CabinCardData[];
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Evergreen Retreats" />

            <div className="min-h-screen bg-stitch-surface text-stitch-on-surface font-body">
                <Navbar />

                <main className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
                    <section className="mb-20 pt-12">
                        <div className="mb-10 text-center">
                            <h1 className="text-display-lg-mobile mb-4 text-stitch-primary md:text-display-lg">
                                Escape to the Wild.
                            </h1>
                            <p className="mx-auto max-w-2xl text-body-lg text-stitch-on-surface-variant">
                                Discover handcrafted cabins tucked away in nature&apos;s most serene
                                landscapes.
                            </p>
                        </div>
                        <SearchBar />
                    </section>
                

                    <section id="cabins" className="mb-20">
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <h2 className="text-headline-md text-stitch-primary">
                                    Featured Retreats
                                </h2>
                                <p className="text-body-md text-stitch-on-surface-variant">
                                    Recommended stays in the Blue Ridge Mountains
                                </p>
                            </div>
                            <a
                                href="/cabins"
                                className="hidden items-center gap-2 text-label-md text-stitch-secondary underline-offset-4 hover:underline md:flex"
                            >
                                <span>View all properties</span>
                                <ArrowRight className="size-4" />
                            </a>
                        </div>
                        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
                            {featuredCabins.map((cabin) => (
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
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
}
