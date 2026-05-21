import CustomAdminLayout from '@/layouts/admin/custom-layout';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return <CustomAdminLayout>{children}</CustomAdminLayout>;
}
