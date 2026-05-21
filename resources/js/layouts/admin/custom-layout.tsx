import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/stitch/admin-sidebar';

export default function CustomAdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex bg-stitch-background text-stitch-on-surface font-body">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-gutter">
                {children}
            </main>
        </div>
    );
}
