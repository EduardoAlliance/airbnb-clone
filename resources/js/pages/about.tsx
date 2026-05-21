import { Head, Link } from '@inertiajs/react';
import { Navbar } from '@/components/stitch/navbar';
import { Footer } from '@/components/stitch/footer';

export default function About() {
    return (
        <>
            <Head title="About Us" />

            <div className="min-h-screen bg-stitch-background text-stitch-on-surface font-body">
                <Navbar />

                <main className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
                    <div className="max-w-3xl mx-auto">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-label-md text-stitch-secondary hover:underline mb-8"
                        >
                            &larr; Back to home
                        </Link>

                        <h1 className="text-display-lg-mobile md:text-[40px] font-display text-stitch-primary mb-6">
                            About Evergreen Retreats
                        </h1>

                        <div className="prose prose-lg max-w-none text-stitch-on-surface space-y-6">
                            <p className="text-body-lg leading-relaxed text-stitch-on-surface-variant">
                                Evergreen Retreats is a curated collection of handpicked cabins and
                                nature escapes across the most beautiful landscapes in North America.
                                We believe that the best memories are made around a crackling fire,
                                under a canopy of stars, surrounded by the people who matter most.
                            </p>

                            <h2 className="text-headline-md font-display text-stitch-primary mt-10 mb-4">
                                Our Story
                            </h2>
                            <p className="text-body-md leading-relaxed text-stitch-on-surface-variant">
                                Founded in 2020, Evergreen Retreats was born from a simple idea:
                                disconnect to reconnect. Our founders, avid hikers and outdoor
                                enthusiasts, realized that finding a peaceful, well-maintained cabin
                                in nature was harder than it should be. So they set out to change that.
                            </p>
                            <p className="text-body-md leading-relaxed text-stitch-on-surface-variant">
                                Today, we partner with cabin owners who share our passion for
                                hospitality and conservation. Every property in our collection meets
                                strict quality standards for cleanliness, comfort, and environmental
                                responsibility.
                            </p>

                            <h2 className="text-headline-md font-display text-stitch-primary mt-10 mb-4">
                                Our Mission
                            </h2>
                            <p className="text-body-md leading-relaxed text-stitch-on-surface-variant">
                                To provide unforgettable nature experiences while promoting sustainable
                                tourism and supporting local communities. We carefully vet each cabin
                                to ensure it meets our standards for quality, safety, and environmental
                                stewardship.
                            </p>

                            <h2 className="text-headline-md font-display text-stitch-primary mt-10 mb-4">
                                Why Choose Us
                            </h2>
                            <ul className="space-y-3 text-body-md text-stitch-on-surface-variant list-disc pl-6">
                                <li><strong className="text-stitch-on-surface">Handpicked Properties:</strong> Every cabin is personally inspected.</li>
                                <li><strong className="text-stitch-on-surface">Transparent Pricing:</strong> No hidden fees, no surprises.</li>
                                <li><strong className="text-stitch-on-surface">24/7 Support:</strong> We are here whenever you need us.</li>
                                <li><strong className="text-stitch-on-surface">Sustainable Focus:</strong> We offset carbon for every booking.</li>
                            </ul>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
