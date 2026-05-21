import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import AdminSettingsLayout from '@/layouts/admin/settings-layout';
import AuthLayout from '@/layouts/auth-layout';
import AccountLayout from '@/layouts/account-layout';
import AccountSettingsLayout from '@/layouts/account/settings-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name === 'about':
            case name === 'privacy':
            case name === 'terms':
            case name.startsWith('cabins/'):
                return null;
            case name === 'account/two-factor-challenge':
                return AuthLayout;
            case name.startsWith('account/settings/'):
                return [AccountLayout, AccountSettingsLayout];
            case name.startsWith('account/'):
                return AccountLayout;
            case name.startsWith('admin/settings/'):
                return [AdminLayout, AdminSettingsLayout];
            case name.startsWith('admin/'):
                return AdminLayout;
            case name.startsWith('settings/'):
                return [AdminLayout, AdminSettingsLayout];
            case name.startsWith('auth/'):
                return AuthLayout;
            default:
                return AdminLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
