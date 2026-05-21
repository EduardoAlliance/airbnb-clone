import { Link } from '@inertiajs/react';
import { TreePine, Sparkles } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const stitchVars = {
    '--background': 'var(--stitch-surface)',
    '--foreground': 'var(--stitch-on-surface)',
    '--primary': 'var(--stitch-primary)',
    '--primary-foreground': 'var(--stitch-on-primary)',
    '--secondary': 'var(--stitch-secondary)',
    '--secondary-foreground': 'var(--stitch-on-secondary)',
    '--muted': 'var(--stitch-surface-container)',
    '--muted-foreground': 'var(--stitch-on-surface-variant)',
    '--accent': 'var(--stitch-primary-container)',
    '--accent-foreground': 'var(--stitch-on-primary-container)',
    '--destructive': 'var(--stitch-error)',
    '--destructive-foreground': 'var(--stitch-on-error)',
    '--border': 'var(--stitch-outline-variant)',
    '--input': 'var(--stitch-outline-variant)',
    '--ring': 'var(--stitch-primary)',
} as React.CSSProperties;

export default function AuthStitchLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div
            className="flex min-h-screen flex-col md:flex-row bg-stitch-surface"
            style={stitchVars}
        >
            <section className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-stitch-primary items-center justify-center px-margin-desktop py-16">
                <div className="absolute inset-0 bg-gradient-to-b from-stitch-primary/60 to-stitch-primary pointer-events-none z-10" />
                <div className="relative z-20 text-stitch-on-primary max-w-lg">
                    <div className="flex items-center gap-3 mb-12">
                        <AppLogoIcon className="size-10 fill-stitch-on-primary" />
                        <span className="font-display text-headline-sm text-stitch-on-primary">Evergreen Retreats</span>
                    </div>
                    <h1 className="font-display text-display-lg text-stitch-on-primary mb-6 leading-tight">
                        The Great Indoors awaits.
                    </h1>
                    <p className="font-body text-body-lg text-stitch-primary-fixed/80 leading-relaxed mb-12">
                        Experience the intersection of wild nature and sophisticated comfort.
                        Your sanctuary in the wilderness is just a few steps away.
                    </p>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col gap-3">
                            <TreePine className="size-8 text-stitch-secondary-fixed" />
                            <h3 className="font-display text-headline-sm text-stitch-surface-bright">Curated Cabins</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Sparkles className="size-8 text-stitch-secondary-fixed" />
                            <h3 className="font-display text-headline-sm text-stitch-surface-bright">Nature Focused</h3>
                        </div>
                    </div>
                </div>
            </section>

            <section className="flex-1 flex flex-col justify-center px-margin-mobile md:px-margin-desktop bg-stitch-surface py-12">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-10 text-center md:text-left">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2 font-display text-headline-sm font-semibold text-stitch-primary"
                        >
                            <AppLogoIcon className="size-8 fill-stitch-primary" />
                            Evergreen Retreats
                        </Link>
                    </div>

                    <header className="mb-8">
                        <h2 className="font-display text-headline-md text-stitch-primary mb-2">
                            {title}
                        </h2>
                        {description && (
                            <p className="font-body text-body-md text-stitch-on-surface-variant">
                                {description}
                            </p>
                        )}
                    </header>

                    {children}
                </div>
            </section>
        </div>
    );
}
