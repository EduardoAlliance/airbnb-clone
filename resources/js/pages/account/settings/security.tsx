import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { KeyRound, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface PageProps {
    user?: {
        profile?: {
            two_factor_email_enabled?: boolean;
        } | null;
    } | null;
}

export default function GuestSecurity() {
    const { user } = usePage<PageProps>().props;
    const twoFactorEnabled = user?.profile?.two_factor_email_enabled ?? false;

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [toggling2fa, setToggling2fa] = useState(false);

    function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        router.put('/settings/password', {
            current_password: currentPassword,
            password,
            password_confirmation: passwordConfirmation,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowPasswordModal(false);
                setCurrentPassword('');
                setPassword('');
                setPasswordConfirmation('');
                setErrors({});
            },
            onError: (errs) => setErrors(errs),
            onFinish: () => setSaving(false),
        });
    }

    function toggle2fa() {
        setToggling2fa(true);
        router.post('/account/settings/security/two-factor-email', {}, {
            preserveScroll: true,
            onFinish: () => setToggling2fa(false),
        });
    }

    return (
        <>
            <Head title="Security settings" />

            <section className="bg-stitch-surface-container-lowest rounded-xl p-8 shadow-[0_4px_20px_-2px_rgba(24,36,19,0.15)] border border-stitch-outline-variant/10">
                <h2 className="font-display text-headline-sm text-stitch-primary mb-6">Security</h2>

                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 border-b border-stitch-outline-variant/10">
                        <div>
                            <h4 className="text-body-lg text-stitch-on-surface font-semibold">Change Password</h4>
                            <p className="text-label-md text-stitch-on-surface-variant">
                                It&apos;s a good idea to use a strong password that you don&apos;t use elsewhere.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2 border border-stitch-secondary text-stitch-secondary rounded-lg text-label-md hover:bg-stitch-secondary/5 transition-colors shrink-0"
                        >
                            Update Password
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 border-b border-stitch-outline-variant/10">
                        <div className="flex gap-4">
                            <div className="p-3 bg-stitch-primary-fixed text-stitch-primary rounded-full size-fit">
                                <Smartphone className="size-5" />
                            </div>
                            <div>
                                <h4 className="text-body-lg text-stitch-on-surface font-semibold">Two-factor Authentication</h4>
                                <p className="text-label-md text-stitch-on-surface-variant">
                                    Add an extra layer of security to your account.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-label-md text-stitch-on-surface-variant">
                                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <button
                                type="button"
                                role="switch"
                                disabled={toggling2fa}
                                aria-checked={twoFactorEnabled}
                                onClick={toggle2fa}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ${
                                    twoFactorEnabled ? 'bg-stitch-primary' : 'bg-stitch-outline-variant'
                                } disabled:opacity-50`}
                            >
                                <span
                                    className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                                        twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-stitch-surface-container-lowest rounded-xl p-8 w-full max-w-md mx-4 shadow-xl border border-stitch-outline-variant/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display text-headline-xs text-stitch-primary">Update Password</h3>
                            <button
                                onClick={() => { setShowPasswordModal(false); setErrors({}); }}
                                className="text-stitch-on-surface-variant hover:text-stitch-on-surface"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="current_password">Current Password</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <InputError message={errors.current_password} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => { setShowPasswordModal(false); setErrors({}); }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Password'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
