import { Link } from '@inertiajs/react';

interface FooterProps {
    title?: string;
}

export function Footer({ title = 'Evergreen Retreats' }: FooterProps) {
    return (
        <footer className="border-t border-stitch-outline-variant bg-stitch-surface-container-highest">
            <div className="mx-auto flex w-full max-w-container-max flex-col items-center justify-between px-margin-mobile md:px-margin-desktop py-gutter md:flex-row">
                <div className="mb-4 md:mb-0">
                    <span className="text-headline-sm font-semibold text-stitch-primary font-display">
                        {title}
                    </span>
                    <p className="mt-1 text-label-sm text-stitch-on-surface-variant">
                        &copy; 2024 {title}. All rights reserved.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-gutter">
                    <Link
                        href="/about"
                        className="text-label-sm text-stitch-on-surface-variant transition-colors hover:text-stitch-secondary font-body"
                    >
                        About Us
                    </Link>
                    <Link
                        href="/privacy"
                        className="text-label-sm text-stitch-on-surface-variant transition-colors hover:text-stitch-secondary font-body"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="/terms"
                        className="text-label-sm text-stitch-on-surface-variant transition-colors hover:text-stitch-secondary font-body"
                    >
                        Terms of Service
                    </Link>
                </div>
            </div>
        </footer>
    );
}
