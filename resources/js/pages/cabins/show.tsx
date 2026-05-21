import { Head } from '@inertiajs/react';
import {
    Bath,
    Calendar,
    Car,
    ChefHat,
    ChevronRight,
    CircleUser,
    Flame,
    Flag,
    House,
    MapPin,
    Phone,
    ShieldCheck,
    Snowflake,
    Star,
    Wifi,
} from 'lucide-react';
import { Navbar } from '@/components/stitch/navbar';
import { ImageGallery } from '@/components/stitch/image-gallery';
import { BookingWidget } from '@/components/stitch/booking-widget';
import { Footer } from '@/components/stitch/footer';
import { LocationMap } from '@/components/map/location-map';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const fallbackGalleryImages = [
    {
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC14JWe9P2BR1DUGP_e953ClWMiT4DiZP4k7BZ1gCGwwptPO_HVc6wkQfy0ft9wNqalqUqRpmo-AXmE8jCgxK5y4p7VY8Zywg9UGd6Tv-bxF7RbtSROSnD1ZMnY_3q2wQAf9AmTn5e7XMpR6MErNOHoCczPTAmLzykIQt51zebtfOy6ltEfs-i1XCnc8II9oOmmaAn5cUJs6hncf67M_2HQtCNUJbeDmUROx7MUZQRYNo-RZbMc-tY-mrNBcXxxwfqif0tvb2XOSQY',
        alt: 'Cabin exterior',
    },
];

const amenityIcons = [Wifi, Flame, ChefHat, Car, Snowflake, Bath];

interface CabinShowProps {
    cabin: {
        id: number;
        slug: string;
        title: string;
        location: string;
        price: number;
        rating: number;
        reviewCount: number;
        hostName: string;
        hostAvatar?: string | null;
        hostPhone?: string | null;
        guestCapacity: string;
        description: string;
        address: string;
        checkInTime?: string | null;
        checkOutTime?: string | null;
        amenities: string[];
        images: Array<{
            url: string;
            alt: string;
        }>;
        bookingHref: string;
        cleaningFee: number;
        maxGuests: number;
        availability: Array<{
            date: string;
            price: number;
            isAvailable: boolean;
            closed: boolean;
        }>;
        latitude: number | null;
        longitude: number | null;
    };
}

export default function CabinShow({ cabin }: CabinShowProps) {
    const galleryImages = cabin.images.length > 0 ? cabin.images : fallbackGalleryImages;
    const amenities = cabin.amenities.length > 0 ? cabin.amenities : ['Wifi', 'Estacionamiento', 'Cocina equipada'];

    return (
        <>
            <Head title={cabin.title} />

            <div className="min-h-screen bg-stitch-background text-stitch-on-surface font-body">
                <Navbar />

                <main className="mx-auto max-w-container-max px-margin-mobile py-8 md:px-margin-desktop">
                    <div className="mb-8">
                        <h1 className="mb-2 text-display-lg-mobile leading-tight text-stitch-primary md:text-[40px]">
                            {cabin.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-label-md text-stitch-on-surface-variant">
                            <div className="flex items-center gap-1">
                                <Star className="size-[18px] fill-stitch-secondary text-stitch-secondary" />
                                <span className="font-bold text-stitch-on-surface">
                                    {cabin.rating}
                                </span>
                                <span className="underline">
                                    {cabin.reviewCount} reviews
                                </span>
                            </div>
                            <span>&middot;</span>
                            <div className="flex items-center gap-1 font-semibold underline">
                                <MapPin className="size-4" />
                                <span>{cabin.location}</span>
                            </div>
                        </div>
                    </div>

                    <ImageGallery images={galleryImages} />

                    <div className="mt-12 grid grid-cols-1 gap-gutter lg:grid-cols-12">
                        <div className="space-y-12 lg:col-span-8">
                            <section className="flex items-start justify-between border-b border-stitch-outline-variant pb-8">
                                <div>
                                    <h2 className="mb-1 text-headline-md text-stitch-primary">
                                        Entire cabin hosted by {cabin.hostName}
                                    </h2>
                                    <p className="text-body-md text-stitch-on-surface-variant">
                                        {cabin.guestCapacity}
                                    </p>
                                </div>
                                <Avatar className="size-14 border-2 border-stitch-primary-fixed bg-stitch-surface-container-high">
                                    {cabin.hostAvatar ? (
                                        <AvatarImage src={cabin.hostAvatar} alt={cabin.hostName} />
                                    ) : null}
                                    <AvatarFallback>
                                        <CircleUser className="size-full text-stitch-on-surface-variant" />
                                    </AvatarFallback>
                                </Avatar>
                            </section>

                            <section className="space-y-6 border-b border-stitch-outline-variant pb-8">
                                <div className="flex gap-6">
                                    <ShieldCheck className="mt-1 size-7 text-stitch-secondary" />
                                    <div>
                                        <p className="font-bold text-stitch-on-surface">
                                            {cabin.hostName} is a Superhost
                                        </p>
                                        <p className="text-body-md text-stitch-on-surface-variant">
                                            Perfil conectado con datos reales. Luego podemos sumar
                                            reputacion, respuesta y antiguedad del anfitrion.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <MapPin className="mt-1 size-7 text-stitch-secondary" />
                                    <div>
                                        <p className="font-bold text-stitch-on-surface">
                                            Great location
                                        </p>
                                        <p className="text-body-md text-stitch-on-surface-variant">
                                            {cabin.address}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <Calendar className="mt-1 size-7 text-stitch-secondary" />
                                    <div>
                                        <p className="font-bold text-stitch-on-surface">
                                            Check-in: {cabin.checkInTime ?? '3:00 PM'} &middot; Check-out: {cabin.checkOutTime ?? '11:00 AM'}
                                        </p>
                                        <p className="text-body-md text-stitch-on-surface-variant">
                                            Flexible check-in and check-out times available upon request.
                                        </p>
                                    </div>
                                </div>
                                {cabin.hostPhone && (
                                    <div className="flex gap-6">
                                        <Phone className="mt-1 size-7 text-stitch-secondary" />
                                        <div>
                                            <p className="font-bold text-stitch-on-surface">
                                                Host phone
                                            </p>
                                            <a
                                                href={`tel:${cabin.hostPhone}`}
                                                className="text-body-md text-stitch-secondary hover:underline"
                                            >
                                                {cabin.hostPhone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {/* Message Host — coming soon */}
                            </section>

                            <section className="border-b border-stitch-outline-variant pb-12">
                                <p className="mb-6 text-body-lg leading-[1.8] text-stitch-on-surface">
                                    {cabin.description}
                                </p>
                                <button className="flex items-center gap-1 font-bold text-stitch-primary underline underline-offset-4">
                                    Show more <ChevronRight className="size-[18px]" />
                                </button>
                            </section>

                            <section>
                                <h3 className="mb-8 text-headline-sm text-stitch-primary">
                                    What this place offers
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {amenities.map((item, index) => {
                                        const Icon = amenityIcons[index % amenityIcons.length];

                                        return (
                                            <div
                                                key={item}
                                                className="flex items-center gap-4 rounded-xl border border-transparent bg-stitch-surface-container-low p-4 transition-all hover:border-stitch-outline-variant"
                                            >
                                                <Icon className="size-6 text-stitch-primary" />
                                                <span className="text-body-md font-medium text-stitch-on-surface">
                                                    {item}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                        <div className="lg:col-span-4">
                            <BookingWidget
                                price={cabin.price}
                                rating={cabin.rating}
                                reviewCount={cabin.reviewCount}
                                bookingHref={cabin.bookingHref}
                                cleaningFee={cabin.cleaningFee}
                                maxGuests={cabin.maxGuests}
                                availability={cabin.availability}
                            />
                            <div className="mt-8 flex items-center justify-center gap-4 text-label-sm text-stitch-on-surface-variant">
                                <Flag className="size-5" />
                                <span className="underline">Report this listing</span>
                            </div>
                        </div>
                    </div>

                    <section className="mt-20 border-t border-stitch-outline-variant pt-12">
                        <h3 className="mb-6 text-headline-md text-stitch-primary">
                            Where you&apos;ll be
                        </h3>
                        <div className="shadow-soft relative rounded-2xl overflow-hidden">
                            {cabin.latitude && cabin.longitude ? (
                                <LocationMap
                                    latitude={cabin.latitude}
                                    longitude={cabin.longitude}
                                    title={cabin.title}
                                    className="h-[480px]"
                                />
                            ) : (
                                <div className="h-[480px] bg-stitch-surface-container-low flex items-center justify-center text-stitch-on-surface-variant">
                                    <MapPin className="size-8 mr-2" />
                                    Location not set
                                </div>
                            )}
                        </div>
                        <div className="mt-8">
                            <h4 className="mb-2 font-bold text-stitch-primary">
                                {cabin.location}
                            </h4>
                            <p className="max-w-3xl text-body-md leading-relaxed text-stitch-on-surface-variant">
                                {cabin.address}
                            </p>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
}
