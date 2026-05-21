import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react';
import type { PolicyRules } from '@/types/booking';

interface PolicyItem {
    id: number;
    name: string;
    slug: string;
    type: string;
    description?: string;
    rules?: PolicyRules;
    is_active: boolean;
    created_at: string;
}

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
    policies: PaginatedData<PolicyItem>;
    filters: { search?: string };
}

function PolicyRulesDisplay({ rules }: { rules?: PolicyRules }) {
    if (!rules) return <span className="text-label-sm text-stitch-on-surface-variant/60">No rules</span>;
    const parts: string[] = [];
    if (rules.before_14_days !== undefined) parts.push(`14+ days: ${rules.before_14_days}%`);
    if (rules.before_7_days !== undefined) parts.push(`7–13 days: ${rules.before_7_days}%`);
    if (rules.after !== undefined) parts.push(`<7 days: ${rules.after}%`);
    return <span className="text-label-sm text-stitch-on-surface-variant/80">{parts.join(' · ')}</span>;
}

export default function PoliciesIndex({ policies, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleFilter() {
        router.get('/admin/policies', { search: search || undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    function handleDelete(id: number, name: string) {
        if (confirm(`Delete policy "${name}"?`)) {
            router.delete(`/admin/policies/${id}`, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Policies" />

            <header className="mb-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="font-display text-display-lg text-stitch-primary mb-2">Policies</h2>
                        <p className="text-body-lg text-stitch-on-surface-variant">
                            Manage cancellation and other policy rules
                        </p>
                    </div>
                    <Link
                        href="/admin/policies/create"
                        className="bg-stitch-primary text-stitch-on-primary px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2"
                    >
                        <Plus className="size-5" />
                        Add Policy
                    </Link>
                </div>
            </header>

            <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10">
                <div className="p-gutter border-b border-stitch-outline-variant/10">
                    <div className="flex gap-3 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stitch-on-surface-variant" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                placeholder="Search policies..."
                                className="w-full pl-10 pr-4 py-2 border border-stitch-outline-variant rounded-lg text-body-md bg-transparent focus:outline-none focus:border-stitch-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-label-sm text-stitch-on-surface-variant border-b border-stitch-outline-variant/10">
                                <th className="text-left px-gutter py-4 font-medium">Name</th>
                                <th className="text-left px-gutter py-4 font-medium">Type</th>
                                <th className="text-left px-gutter py-4 font-medium">Rules</th>
                                <th className="text-left px-gutter py-4 font-medium">Status</th>
                                <th className="text-left px-gutter py-4 font-medium">Created</th>
                                <th className="text-right px-gutter py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-gutter py-12 text-center text-stitch-on-surface-variant">
                                        <Tag className="size-8 mx-auto mb-3 opacity-40" />
                                        <p className="text-body-md">No policies found.</p>
                                    </td>
                                </tr>
                            ) : (
                                policies.data.map((policy) => (
                                    <tr key={policy.id} className="border-b border-stitch-outline-variant/5 hover:bg-stitch-surface-container-low transition-colors">
                                        <td className="px-gutter py-4">
                                            <p className="font-bold text-stitch-primary">{policy.name}</p>
                                            <p className="text-label-sm text-stitch-on-surface-variant/70">{policy.slug}</p>
                                        </td>
                                        <td className="px-gutter py-4">
                                            <span className="capitalize text-label-sm bg-stitch-surface-container-high px-3 py-1 rounded-full">
                                                {policy.type}
                                            </span>
                                        </td>
                                        <td className="px-gutter py-4">
                                            <PolicyRulesDisplay rules={policy.rules} />
                                        </td>
                                        <td className="px-gutter py-4">
                                            <span className={`inline-flex items-center gap-1.5 text-label-sm ${policy.is_active ? 'text-green-700' : 'text-stitch-on-surface-variant/60'}`}>
                                                <span className={`size-2 rounded-full ${policy.is_active ? 'bg-green-500' : 'bg-stitch-outline-variant'}`} />
                                                {policy.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-gutter py-4 text-label-sm text-stitch-on-surface-variant">
                                            {policy.created_at}
                                        </td>
                                        <td className="px-gutter py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/policies/${policy.id}/edit`}
                                                    className="p-2 rounded-lg hover:bg-stitch-surface-container-high transition-colors"
                                                >
                                                    <Edit className="size-4 text-stitch-on-surface-variant" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(policy.id, policy.name)}
                                                    className="p-2 rounded-lg hover:bg-stitch-error/10 transition-colors"
                                                >
                                                    <Trash2 className="size-4 text-stitch-error" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {policies.meta.total > 15 && (
                    <div className="px-gutter py-4 border-t border-stitch-outline-variant/10 flex justify-between items-center text-label-sm text-stitch-on-surface-variant">
                        <span>
                            Showing {policies.meta.from}–{policies.meta.to} of {policies.meta.total}
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}
