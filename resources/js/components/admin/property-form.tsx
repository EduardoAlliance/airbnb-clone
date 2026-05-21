import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import InputError from '@/components/input-error';
import { MapPicker } from '@/components/admin/map-picker';
import type { PolicyRules } from '@/types/booking';

interface Amenity {
    id: number;
    name: string;
    slug: string;
}

interface Policy {
    id: number;
    name: string;
    slug: string;
    description?: string;
    rules?: PolicyRules;
}

interface PropertyFormProps {
    data: Record<string, any>;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    amenities: Amenity[];
    selectedAmenities: number[];
    policies?: Policy[];
    selectedPolicies?: number[];
    isEdit?: boolean;
}

function PolicyRulesSummary({ rules }: { rules?: PolicyRules }) {
    if (!rules) return null;
    const parts: string[] = [];
    if (rules.before_14_days !== undefined) parts.push(`14+ days: ${rules.before_14_days}%`);
    if (rules.before_7_days !== undefined) parts.push(`7–13 days: ${rules.before_7_days}%`);
    if (rules.after !== undefined) parts.push(`<7 days: ${rules.after}%`);
    if (parts.length === 0) return null;
    return (
        <span className="block text-label-xs text-stitch-on-surface-variant/70 mt-0.5">
            {parts.join(' · ')}
        </span>
    );
}

export function PropertyForm({
    data,
    setData,
    errors,
    processing,
    amenities,
    selectedAmenities,
    policies,
    selectedPolicies,
    isEdit,
}: PropertyFormProps) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={data.title ?? ''}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="e.g. Whispering Pines A-Frame"
                    />
                    <InputError message={errors.title} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="base_price">Base Price (per night)</Label>
                    <Input
                        id="base_price"
                        type="number"
                        step="0.01"
                        value={data.base_price ?? ''}
                        onChange={(e) => setData('base_price', e.target.value)}
                        placeholder="250"
                    />
                    <InputError message={errors.base_price} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    rows={5}
                    value={data.description ?? ''}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Describe the property..."
                />
                <InputError message={errors.description} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={data.address ?? ''}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder="123 Main St"
                />
                <InputError message={errors.address} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        value={data.city ?? ''}
                        onChange={(e) => setData('city', e.target.value)}
                    />
                    <InputError message={errors.city} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                        id="state"
                        value={data.state ?? ''}
                        onChange={(e) => setData('state', e.target.value)}
                    />
                    <InputError message={errors.state} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                        id="country"
                        value={data.country ?? ''}
                        onChange={(e) => setData('country', e.target.value)}
                    />
                    <InputError message={errors.country} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                        id="postal_code"
                        value={data.postal_code ?? ''}
                        onChange={(e) => setData('postal_code', e.target.value)}
                    />
                    <InputError message={errors.postal_code} />
                </div>
            </div>

            <div className="space-y-3">
                <Label>Location on Map</Label>
                <MapPicker
                    latitude={data.latitude ? parseFloat(data.latitude) : null}
                    longitude={data.longitude ? parseFloat(data.longitude) : null}
                    onChange={(lat, lng) => {
                        setData('latitude', lat.toString());
                        setData('longitude', lng.toString());
                    }}
                    address={data.address}
                />
                <InputError message={errors.latitude} />
                <InputError message={errors.longitude} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-gutter">
                <div className="space-y-2">
                    <Label htmlFor="guests">Max Guests</Label>
                    <Input
                        id="guests"
                        type="number"
                        value={data.guests ?? ''}
                        onChange={(e) => setData('guests', parseInt(e.target.value) || 0)}
                    />
                    <InputError message={errors.guests} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                        id="bedrooms"
                        type="number"
                        value={data.bedrooms ?? ''}
                        onChange={(e) => setData('bedrooms', parseInt(e.target.value) || 0)}
                    />
                    <InputError message={errors.bedrooms} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="beds">Beds</Label>
                    <Input
                        id="beds"
                        type="number"
                        value={data.beds ?? ''}
                        onChange={(e) => setData('beds', parseInt(e.target.value) || 0)}
                    />
                    <InputError message={errors.beds} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                        id="bathrooms"
                        type="number"
                        step="0.5"
                        value={data.bathrooms ?? ''}
                        onChange={(e) => setData('bathrooms', e.target.value)}
                    />
                    <InputError message={errors.bathrooms} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cleaning_fee">Cleaning Fee</Label>
                    <Input
                        id="cleaning_fee"
                        type="number"
                        step="0.01"
                        value={data.cleaning_fee ?? ''}
                        onChange={(e) => setData('cleaning_fee', e.target.value)}
                    />
                    <InputError message={errors.cleaning_fee} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="check_in_time">Check-in Time</Label>
                    <Input
                        id="check_in_time"
                        type="time"
                        value={data.check_in_time ?? ''}
                        onChange={(e) => setData('check_in_time', e.target.value)}
                    />
                    <InputError message={errors.check_in_time} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="check_out_time">Check-out Time</Label>
                    <Input
                        id="check_out_time"
                        type="time"
                        value={data.check_out_time ?? ''}
                        onChange={(e) => setData('check_out_time', e.target.value)}
                    />
                    <InputError message={errors.check_out_time} />
                </div>
            </div>

            {amenities.length > 0 && (
                <div className="space-y-3">
                    <Label>Amenities</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {amenities.map((amenity) => (
                            <label
                                key={amenity.id}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedAmenities.includes(amenity.id)}
                                    onChange={() => {
                                        const updated = selectedAmenities.includes(amenity.id)
                                            ? selectedAmenities.filter((id) => id !== amenity.id)
                                            : [...selectedAmenities, amenity.id];
                                        setData('amenities', updated);
                                    }}
                                    className="w-5 h-5 rounded border-stitch-outline-variant text-stitch-primary focus:ring-stitch-primary"
                                />
                                <span className="text-body-md text-stitch-on-surface-variant group-hover:text-stitch-primary transition-colors">
                                    {amenity.name}
                                </span>
                            </label>
                        ))}
                    </div>
                    <InputError message={errors.amenities} />
                </div>
            )}

            {policies && policies.length > 0 && (
                <div className="space-y-3">
                    <Label>Cancellation Policy</Label>
                    <div className="space-y-3">
                        {policies.map((policy) => (
                            <label
                                key={policy.id}
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    (selectedPolicies ?? []).includes(policy.id)
                                        ? 'border-stitch-primary bg-stitch-primary-container/20'
                                        : 'border-stitch-outline-variant/30 bg-stitch-surface-container-lowest hover:border-stitch-outline-variant'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="cancellation_policy"
                                    checked={(selectedPolicies ?? []).includes(policy.id)}
                                    onChange={() => setData('policies', [policy.id])}
                                    className="mt-0.5 size-5 border-stitch-outline-variant text-stitch-primary focus:ring-stitch-primary"
                                />
                                <div>
                                    <span className="block text-body-md font-semibold text-stitch-on-surface">
                                        {policy.name}
                                    </span>
                                    {policy.description && (
                                        <span className="block text-label-sm text-stitch-on-surface-variant mt-0.5">
                                            {policy.description}
                                        </span>
                                    )}
                                    <PolicyRulesSummary rules={policy.rules} />
                                </div>
                            </label>
                        ))}
                    </div>
                    <InputError message={errors.policies} />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                    id="status"
                    value={data.status ?? 'draft'}
                    onChange={(e) => setData('status', e.target.value)}
                    className="w-full border-0 border-b border-stitch-outline-variant focus:border-stitch-primary focus:ring-0 bg-transparent py-2 text-body-md"
                >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
                <InputError message={errors.status} />
            </div>
        </div>
    );
}
