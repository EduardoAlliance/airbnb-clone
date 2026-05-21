import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Lock, Shield, TreePine, HeadphonesIcon, Info, MapPin, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CancellationPolicy {
    name: string;
    description?: string;
    rules?: Record<string, number>;
}

interface BookingNewProps {
    cabin?: {
        id?: number;
        slug?: string;
        title?: string;
        location?: string;
        price?: number;
        rating?: number;
        reviewCount?: number;
        imageUrl?: string;
        imageAlt?: string;
        showHref?: string;
        storeHref?: string;
        checkIn?: string | null;
        checkOut?: string | null;
        guests?: number;
        nights?: number;
        subtotal?: number;
        nightlyBreakdown?: Array<{
            date: string;
            price: number;
        }>;
        cleaningFee?: number;
        serviceFee?: number;
        total?: number;
        cancellationPolicy?: CancellationPolicy | null;
    };
}

function formatStayDate(value?: string | null): string {
    if (! value) {
        return 'Select dates';
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1);

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatShortDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1);

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

export default function BookingNew({ cabin }: BookingNewProps) {
    const title = cabin?.title ?? 'The Whispering Fir Cabin';
    const location = cabin?.location ?? 'Olympic National Forest, WA';
    const price = cabin?.price ?? 350;
    const rating = cabin?.rating ?? 4.92;
    const reviewCount = cabin?.reviewCount ?? 128;
    const nights = cabin?.nights ?? 0;
    const guests = cabin?.guests ?? 2;
    const subtotal = cabin?.subtotal ?? 0;
    const nightlyBreakdown = cabin?.nightlyBreakdown ?? [];
    const cleaningFee = cabin?.cleaningFee ?? 0;
    const serviceFee = cabin?.serviceFee ?? 0;
    const total = cabin?.total ?? 0;
    const cancellationPolicy = cabin?.cancellationPolicy ?? null;
    const canSubmitBooking = Boolean(cabin?.checkIn && cabin?.checkOut && nights > 0 && cabin?.storeHref);

    return (
        <>
            <Head title="Complete Your Booking" />

            <div className="py-12">
                <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
                    <div className="space-y-12 lg:col-span-8">
                        <section>
                            <Link
                                href={cabin?.showHref ?? '/cabins'}
                                className="inline-flex items-center text-stitch-secondary font-label-md mb-6 hover:-translate-x-0.5 transition-transform"
                            >
                                <ArrowLeft className="size-[18px] mr-2" />
                                Modify Selection
                            </Link>
                            <h1 className="font-display text-display-lg text-stitch-primary mb-4">
                                Complete Your Booking
                            </h1>
                            <p className="text-body-lg text-stitch-on-surface-variant">
                                Review your stay details and secure your retreat in the wild.
                            </p>
                        </section>

                        <section className="rounded-2xl border border-stitch-outline-variant bg-white p-8 shadow-soft">
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="font-display text-headline-sm text-stitch-primary">
                                    Payment Information
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Shield className="size-4 text-stitch-secondary" />
                                    <span className="text-label-sm uppercase tracking-widest text-stitch-secondary">
                                        Secure Checkout
                                    </span>
                                </div>
                            </div>

                            <Form action={cabin?.storeHref ?? '#'} method="post" className="space-y-6">
                                {({ processing, errors }) => (
                                    <>
                                        <input type="hidden" name="check_in" value={cabin?.checkIn ?? ''} />
                                        <input type="hidden" name="check_out" value={cabin?.checkOut ?? ''} />
                                        <input type="hidden" name="guests" value={String(guests)} />

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="md:col-span-2">
                                                <Label htmlFor="cardholder-name" className="mb-2 block text-label-sm font-semibold text-stitch-primary">
                                                    Cardholder Name
                                                </Label>
                                                <Input
                                                    id="cardholder-name"
                                                    name="cardholder_name"
                                                    placeholder="Johnathan Evergreen"
                                                    className="h-12 rounded-xl border-stitch-outline-variant bg-stitch-surface px-4 text-body-md text-stitch-on-surface placeholder:text-stitch-outline focus:border-stitch-primary focus:ring-stitch-primary/20"
                                                />
                                                <InputError message={errors.cardholder_name} />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label htmlFor="card-number" className="mb-2 block text-label-sm font-semibold text-stitch-primary">
                                                    Card Number
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="card-number"
                                                        name="card_number"
                                                        placeholder="4242 4242 4242 4242"
                                                        className="h-12 rounded-xl border-stitch-outline-variant bg-stitch-surface pl-4 pr-12 text-body-md text-stitch-on-surface placeholder:text-stitch-outline focus:border-stitch-primary focus:ring-stitch-primary/20"
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <CreditCard className="size-5 text-stitch-outline" />
                                                    </div>
                                                </div>
                                                <InputError message={errors.card_number} />
                                            </div>
                                            <div>
                                                <Label htmlFor="expiry" className="mb-2 block text-label-sm font-semibold text-stitch-primary">
                                                    Expiry Date
                                                </Label>
                                                <Input
                                                    id="expiry"
                                                    name="expiry"
                                                    placeholder="MM/YY"
                                                    className="h-12 rounded-xl border-stitch-outline-variant bg-stitch-surface px-4 text-body-md text-stitch-on-surface placeholder:text-stitch-outline focus:border-stitch-primary focus:ring-stitch-primary/20"
                                                />
                                                <InputError message={errors.expiry} />
                                            </div>
                                            <div>
                                                <Label htmlFor="cvc" className="mb-2 block text-label-sm font-semibold text-stitch-primary">
                                                    CVC
                                                </Label>
                                                <Input
                                                    id="cvc"
                                                    name="cvc"
                                                    placeholder="123"
                                                    className="h-12 rounded-xl border-stitch-outline-variant bg-stitch-surface px-4 text-body-md text-stitch-on-surface placeholder:text-stitch-outline focus:border-stitch-primary focus:ring-stitch-primary/20"
                                                />
                                                <InputError message={errors.cvc} />
                                            </div>
                                        </div>

                                        <InputError message={errors.check_in} />
                                        <InputError message={errors.check_out} />
                                        <InputError message={errors.guests} />

                                        <div className="border-t border-stitch-outline-variant pt-6">
                                            <label className="flex cursor-pointer items-center gap-3 group">
                                                <div className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-stitch-outline-variant bg-stitch-surface transition-colors group-hover:border-stitch-primary has-checked:border-stitch-primary has-checked:bg-stitch-primary">
                                                    <input
                                                        type="checkbox"
                                                        className="size-3 appearance-none opacity-0"
                                                    />
                                                    <svg className="hidden size-3 text-stitch-on-primary has-checked:block" viewBox="0 0 12 12" fill="none">
                                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                                <span className="text-label-md text-stitch-on-surface-variant transition-colors group-hover:text-stitch-on-surface">
                                                    Save card details for future tranquility
                                                </span>
                                            </label>
                                        </div>

                                        {!canSubmitBooking && (
                                            <p className="text-label-sm text-stitch-error">
                                                Select valid dates from the property page before completing payment.
                                            </p>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={processing || !canSubmitBooking}
                                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-stitch-primary py-5 text-[18px] text-stitch-on-primary shadow-soft transition-all hover:opacity-90 active:scale-[0.98] disabled:pointer-events-none disabled:bg-stitch-outline-variant disabled:text-stitch-on-surface-variant"
                                        >
                                            {processing && <Spinner />}
                                            Proceed to Payment
                                            <Lock className="size-5" />
                                        </Button>

                                        <p className="text-center text-label-sm text-stitch-on-surface-variant opacity-70">
                                            By clicking &ldquo;Proceed to Payment&rdquo;, you agree to our{' '}
                                            <a href="#" className="underline">Terms of Service</a> and{' '}
                                            <a href="#" className="underline">Cancellation Policy</a>.
                                        </p>
                                    </>
                                )}
                            </Form>
                        </section>

                        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="flex items-center gap-2">
                                <Shield className="size-5 text-stitch-on-surface-variant" />
                                <span className="text-label-sm text-stitch-on-surface-variant">PCI Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TreePine className="size-5 text-stitch-on-surface-variant" />
                                <span className="text-label-sm text-stitch-on-surface-variant">Eco-Certified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <HeadphonesIcon className="size-5 text-stitch-on-surface-variant" />
                                <span className="text-label-sm text-stitch-on-surface-variant">24/7 Concierge</span>
                            </div>
                        </div>
                    </div>

                    <aside className="lg:col-span-4">
                        <div className="sticky top-32 space-y-6">
                            <div className="bg-stitch-surface-container-low rounded-xl overflow-hidden border border-stitch-outline-variant/30">
                                <div className="h-56 relative overflow-hidden">
                                    <img
                                        src={cabin?.imageUrl ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWds_AdcYd59tPZT8xE5mqgYhMDwbmgee8Mn_VsChgCXjtRE8l0vHv7US0MUuoM1MZNlEoaouvIAG-8c8Q-iKiseEfBvuPbqzLG8JT5SGfjHLwjeObpWZW2rmE3BhRmQVOg46KsiruwHmlsmNAaV6TD9l24tCPgAK_co9S4GmO3adKsFMS2M2abzTRfVD03rAyBdPtDdn05BJbQOCWYkHhuCQom3QE-b0QdGRquSY_vB4WLhBv1tYuuXEfqa04zy_oN0MjGlSEf8ai'}
                                        alt={cabin?.imageAlt ?? 'A luxurious modern A-frame timber cabin nestled in a misty pine forest'}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-label-sm text-stitch-primary">
                                        Rare Find: High Demand
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="font-display text-headline-sm text-stitch-primary mb-2">
                                        {title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-stitch-on-surface-variant mb-6">
                                        <MapPin className="size-[18px]" />
                                        <span className="text-body-md">{location}</span>
                                    </div>

                                    <div className="flex items-center gap-1 text-body-md text-stitch-on-surface-variant mb-6">
                                        <Star className="size-3.5 fill-stitch-secondary text-stitch-secondary" />
                                        <span className="font-bold text-stitch-on-surface">{rating}</span>
                                        <span className="text-stitch-outline">&middot; {reviewCount} reviews</span>
                                    </div>

                                    <div className="space-y-4 py-6 border-y border-stitch-outline-variant/30">
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-label-sm text-stitch-on-surface-variant uppercase">Check-in</span>
                                                <span className="font-label-md text-stitch-primary">{formatStayDate(cabin?.checkIn)}</span>
                                            </div>
                                            <span className="text-stitch-outline">&rarr;</span>
                                            <div className="flex flex-col text-right">
                                                <span className="text-label-sm text-stitch-on-surface-variant uppercase">Check-out</span>
                                                <span className="font-label-md text-stitch-primary">{formatStayDate(cabin?.checkOut)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <Users className="size-[18px] text-stitch-secondary" />
                                            <span className="text-body-md">{guests} Guests &middot; {nights} Nights</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 space-y-4">
                                        <h4 className="font-label-md text-stitch-primary">Price Breakdown</h4>
                                        <div className="flex justify-between text-body-md text-stitch-on-surface-variant">
                                            <span>{nights} selected nights</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        {nightlyBreakdown.length > 0 && (
                                            <div className="rounded-xl bg-stitch-surface-container-low p-4">
                                                <div className="mb-2 text-label-sm font-semibold text-stitch-primary">
                                                    Nightly rates
                                                </div>
                                                <div className="space-y-2 text-body-md text-stitch-on-surface-variant">
                                                    {nightlyBreakdown.map((item) => (
                                                        <div key={item.date} className="flex justify-between gap-4">
                                                            <span>{formatShortDate(item.date)}</span>
                                                            <span>${item.price.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-body-md text-stitch-on-surface-variant">
                                            <span className="flex items-center gap-1">
                                                Cleaning fee
                                                <Info className="size-4" />
                                            </span>
                                            <span>${cleaningFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-body-md text-stitch-on-surface-variant">
                                            <span className="flex items-center gap-1">
                                                Service fee
                                                <Info className="size-4" />
                                            </span>
                                            <span>${serviceFee.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-4 border-t border-stitch-outline-variant flex justify-between items-center">
                                            <span className="font-display text-headline-sm text-stitch-primary">Total (USD)</span>
                                            <span className="font-display text-headline-sm text-stitch-primary">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-stitch-primary-container text-stitch-on-primary-container p-6 rounded-xl border border-stitch-primary/20">
                                <div className="flex items-start gap-4">
                                    <div className="size-10 flex items-center justify-center rounded-full bg-stitch-primary-container">
                                        <span className="text-xl leading-none">&times;</span>
                                    </div>
                                    <div>
                                        <p className="font-label-md mb-1">
                                            {cancellationPolicy?.name ?? 'Flexible'} Cancellation
                                        </p>
                                        <p className="text-label-sm opacity-80">
                                            {cancellationPolicy?.description ?? 'Free cancellation up to 24 hours before check-in.'}
                                        </p>
                                        {cancellationPolicy?.rules && (
                                            <ul className="mt-2 text-label-xs opacity-70 space-y-0.5">
                                                {cancellationPolicy.rules.before_14_days !== undefined && (
                                                    <li>14+ days before check-in: {cancellationPolicy.rules.before_14_days}% refund</li>
                                                )}
                                                {cancellationPolicy.rules.before_7_days !== undefined && (
                                                    <li>7–13 days before check-in: {cancellationPolicy.rules.before_7_days}% refund</li>
                                                )}
                                                {cancellationPolicy.rules.after !== undefined && (
                                                    <li>Less than 7 days: {cancellationPolicy.rules.after}% refund</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
