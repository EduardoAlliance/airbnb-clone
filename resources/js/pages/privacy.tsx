import { Head, Link } from '@inertiajs/react';
import { Navbar } from '@/components/stitch/navbar';
import { Footer } from '@/components/stitch/footer';

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy" />

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
                            Privacy Policy
                        </h1>
                        <p className="text-label-sm text-stitch-on-surface-variant mb-10">
                            Last updated: May 20, 2026
                        </p>

                        <div className="space-y-6 text-body-md leading-relaxed text-stitch-on-surface-variant">
                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    1. Information We Collect
                                </h2>
                                <p>
                                    When you create an account, make a booking, or contact us, we collect
                                    personal information such as your name, email address, phone number,
                                    payment details, and billing address. We also collect information about
                                    your bookings, preferences, and communications with hosts.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    2. How We Use Your Information
                                </h2>
                                <p>
                                    We use your information to process bookings, communicate with you
                                    about your reservations, improve our services, send relevant
                                    recommendations, and comply with legal obligations. We do not sell
                                    your personal information to third parties.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    3. Data Security
                                </h2>
                                <p>
                                    We implement industry-standard security measures to protect your
                                    personal information. All payment transactions are processed through
                                    PCI-compliant partners and your payment data is encrypted in transit
                                    and at rest.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    4. Your Rights
                                </h2>
                                <p>
                                    You have the right to access, correct, or delete your personal data
                                    at any time. You can manage your preferences in your account settings
                                    or contact us directly. We will respond to your request within 30 days.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    5. Cookies
                                </h2>
                                <p>
                                    We use essential cookies to operate our platform and optional cookies
                                    to improve your experience. You can manage cookie preferences in your
                                    browser settings at any time.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-headline-sm font-display text-stitch-primary mb-3">
                                    6. Contact Us
                                </h2>
                                <p>
                                    If you have questions about this Privacy Policy, please contact us at
                                    privacy@evergreenretreats.com or through our support page.
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
