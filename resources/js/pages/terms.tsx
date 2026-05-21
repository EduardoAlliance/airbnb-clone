import { Head, Link } from '@inertiajs/react';
import { Navbar } from '@/components/stitch/navbar';
import { Footer } from '@/components/stitch/footer';

export default function Terms() {
    return (
        <>
            <Head title="Terms of Service" />

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
                            Terms of Service
                        </h1>
                        <p className="text-label-sm text-stitch-on-surface-variant mb-10">
                            Last updated: May 20, 2026
                        </p>

                        <div className="space-y-6 text-body-md leading-relaxed text-stitch-on-surface-variant">
                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    1. Acceptance of Terms
                                </h2>
                                <p>
                                    By accessing or using Evergreen Retreats, you agree to be bound by
                                    these Terms of Service. If you do not agree, please do not use our
                                    platform. We reserve the right to update these terms at any time.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    2. Bookings and Cancellations
                                </h2>
                                <p>
                                    All bookings are subject to availability and the cancellation policy
                                    selected at the time of booking. Guests must be at least 18 years old
                                    to make a reservation. The person making the booking is responsible
                                    for the conduct of all guests in their party.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    3. Host Responsibilities
                                </h2>
                                <p>
                                    Hosts agree to maintain their property in a safe, clean, and
                                    habitable condition. Hosts must accurately represent their property
                                    and amenities. Failure to meet expectations may result in removal
                                    from our platform.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    4. Payments
                                </h2>
                                <p>
                                    All payments are processed securely through our payment partners.
                                    Prices are listed in USD unless otherwise noted. Guests authorize
                                    charges when completing a booking. Refunds are processed according
                                    to the applicable cancellation policy.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    5. Liability
                                </h2>
                                <p>
                                    Evergreen Retreats acts as a platform connecting guests and hosts.
                                    We are not liable for any damages, losses, or injuries arising from
                                    your use of the platform or your stay at any property. Guests use
                                    properties at their own risk.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    6. Prohibited Conduct
                                </h2>
                                <p>
                                    Users agree not to misuse the platform, engage in fraudulent activity,
                                    violate any laws, or cause damage to properties. Violation of these
                                    terms may result in account suspension and legal action.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    7. Contact
                                </h2>
                                <p>
                                    For questions about these Terms, please contact us at
                                    support@evergreenretreats.com.
                                </p>
                            </section>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
