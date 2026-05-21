import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Edit,
    Eye,
    Plus,
    Search,
    Trash2,
    TreePine,
} from 'lucide-react';
import type { AdminProperty } from '@/types/property';

interface PaginatedData<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
}

interface Props {
    properties: PaginatedData<AdminProperty>;
    filters: { search?: string; status?: string };
}

export default function PropertiesIndex({ properties, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function handleFilter() {
        router.get('/admin/properties', { search, status: status || undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    function handleDelete(id: number, title: string) {
        if (confirm(`Delete "${title}"? This cannot be undone.`)) {
            router.delete(`/admin/properties/${id}`, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="Properties" />

            <header className="mb-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="font-display text-display-lg text-stitch-primary mb-2">
                            Properties
                        </h2>
                        <p className="text-body-lg text-stitch-on-surface-variant">
                            Manage your cabin listings
                        </p>
                    </div>
                    <Link
                        href="/admin/properties/create"
                        className="bg-stitch-primary text-stitch-on-primary px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Plus className="size-5" />
                        Add Property
                    </Link>
                </div>
            </header>

            <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 overflow-hidden">
                <div className="p-gutter border-b border-stitch-outline-variant/10">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-stitch-outline size-4" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                placeholder="Search by title, city, country..."
                                className="w-full pl-10 pr-4 py-2 bg-stitch-surface rounded-full border border-stitch-outline-variant text-body-md focus:ring-stitch-primary focus:border-stitch-primary"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                router.get('/admin/properties', { status: e.target.value || undefined }, {
                                    preserveState: true,
                                    replace: true,
                                });
                            }}
                            className="bg-stitch-surface border border-stitch-outline-variant rounded-lg px-4 py-2 text-body-md"
                        >
                            <option value="">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                        <button
                            onClick={handleFilter}
                            className="bg-stitch-primary text-stitch-on-primary px-6 py-2 rounded-lg font-bold hover:opacity-90"
                        >
                            Search
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-label-sm text-stitch-outline uppercase tracking-widest">
                                <th className="pb-4 pl-4 pt-4">Property</th>
                                <th className="pb-4 pt-4">Location</th>
                                <th className="pb-4 pt-4 text-center">Status</th>
                                <th className="pb-4 pt-4">Price</th>
                                <th className="pb-4 pt-4 text-center">Bookings</th>
                                <th className="pb-4 pt-4 text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-stitch-on-surface-variant">
                                        No properties found.
                                    </td>
                                </tr>
                            )}
                            {properties.data.map((property) => (
                                <tr
                                    key={property.id}
                                    className="border-t border-stitch-outline-variant/10 hover:bg-stitch-surface-container-low/50 transition-colors group"
                                >
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 rounded-lg bg-stitch-surface-variant overflow-hidden flex items-center justify-center flex-shrink-0">
                                                {property.image ? (
                                                    <img
                                                        src={property.image}
                                                        alt={property.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <TreePine className="size-6 text-stitch-on-surface-variant" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-body-md font-semibold text-stitch-primary">
                                                    {property.title}
                                                </p>
                                                <p className="text-label-sm text-stitch-on-surface-variant">
                                                    {property.guests} guests &middot; {property.bedrooms} bedrooms
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-body-md text-stitch-on-surface-variant">
                                        {property.location}
                                    </td>
                                    <td className="py-4 text-center">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-label-sm font-bold ${
                                                property.status === 'published'
                                                    ? 'bg-stitch-primary-fixed text-stitch-on-primary-fixed'
                                                    : 'bg-stitch-surface-container-high text-stitch-on-surface-variant'
                                            }`}
                                        >
                                            {property.status}
                                        </span>
                                    </td>
                                    <td className="py-4 font-semibold text-stitch-primary">
                                        ${property.base_price.toFixed(2)}
                                    </td>
                                    <td className="py-4 text-center text-body-md text-stitch-on-surface-variant">
                                        {property.bookings_count}
                                    </td>
                                    <td className="py-4 text-right pr-4">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/admin/properties/${property.id}`}
                                                className="p-2 text-stitch-primary hover:bg-stitch-primary-container/20 rounded-full transition-colors"
                                                title="View"
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                            <Link
                                                href={`/admin/properties/${property.id}/edit`}
                                                className="p-2 text-stitch-secondary hover:bg-stitch-secondary-fixed/20 rounded-full transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="size-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(property.id, property.title)}
                                                className="p-2 text-stitch-error hover:bg-stitch-error-container/20 rounded-full transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {properties.meta.last_page > 1 && (
                    <div className="px-gutter py-4 border-t border-stitch-outline-variant/10 flex items-center justify-between">
                        <span className="text-label-sm text-stitch-on-surface-variant">
                            Showing {properties.meta.from}-{properties.meta.to} of {properties.meta.total}
                        </span>
                        <div className="flex gap-2">
                            {Array.from({ length: properties.meta.last_page }, (_, i) => i + 1).map(
                                (page) => (
                                    <button
                                        key={page}
                                        onClick={() =>
                                            router.get(
                                                '/admin/properties',
                                                { page, search: filters.search, status: filters.status },
                                                { preserveState: true, replace: true }
                                            )
                                        }
                                        className={`size-8 rounded text-label-sm ${
                                            page === properties.meta.current_page
                                                ? 'bg-stitch-primary text-stitch-on-primary'
                                                : 'hover:bg-stitch-surface-variant'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
