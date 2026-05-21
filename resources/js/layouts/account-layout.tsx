import { Navbar } from '@/components/stitch/navbar';
import { Footer } from '@/components/stitch/footer';
import type { ReactNode } from 'react';

export default function GuestLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-stitch-surface text-stitch-on-surface font-body">
            <Navbar />
            <main className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
                {children}
            </main>
            <Footer />
        </div>
    );
}
