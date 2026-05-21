import { Link } from '@inertiajs/react';
import { MapPin, Star } from 'lucide-react';

interface CabinCardProps {
    title: string;
    location: string;
    price: number;
    rating: number;
    imageUrl: string;
    imageAlt?: string;
    href: string;
    badges?: string[];
}

export function CabinCard({
    title,
    location,
    price,
    rating,
    imageUrl,
    imageAlt,
    href,
    badges,
}: CabinCardProps) {
    return (
        <Link
            href={href}
            className="group overflow-hidden rounded-xl border border-stitch-outline-variant/10 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={imageUrl}
                    alt={imageAlt ?? title}
                />
                <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 shadow-sm backdrop-blur-sm">
                    <Star className="size-3.5 text-stitch-secondary fill-stitch-secondary" />
                    <span className="text-label-md text-stitch-primary">{rating}</span>
                </div>
            </div>
            <div className="p-6">
                <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-headline-sm text-stitch-primary">{title}</h3>
                    <span className="text-lg text-stitch-primary">
                        ${price}
                        <span className="text-label-sm font-normal text-stitch-on-surface-variant">
                            /night
                        </span>
                    </span>
                </div>
                <p className="mb-6 flex items-center gap-1 text-body-md text-stitch-on-surface-variant">
                    <MapPin className="size-4" />
                    {location}
                </p>
                {badges && badges.length > 0 && (
                    <div className="mb-6 flex gap-2">
                        {badges.map((badge) => (
                            <span
                                key={badge}
                                className="rounded-full bg-stitch-secondary/10 px-3 py-1 text-label-sm text-stitch-on-secondary-container"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                )}
                <div className="w-full rounded-lg border-2 border-stitch-secondary py-3 text-center text-label-md text-stitch-secondary transition-colors duration-200 hover:bg-stitch-secondary hover:text-stitch-on-secondary">
                    View Details
                </div>
            </div>
        </Link>
    );
}
