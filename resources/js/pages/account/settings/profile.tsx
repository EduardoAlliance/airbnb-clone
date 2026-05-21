import { Head, usePage, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';

interface ProfilePageUser {
    name: string;
    email: string;
    phone?: string | null;
    language?: string | null;
    profile?: {
        first_name?: string | null;
        last_name?: string | null;
        bio?: string | null;
        avatar_url?: string | null;
        date_of_birth?: string | null;
    } | null;
}

interface PageProps {
    user?: ProfilePageUser;
}

const languages = [
    { value: 'en', label: 'English (US)' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'es', label: 'Spanish' },
    { value: 'pt', label: 'Portuguese' },
];

export default function GuestProfile() {
    const { user } = usePage<PageProps>().props;
    const profile = user?.profile;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [firstName, setFirstName] = useState(profile?.first_name ?? '');
    const [lastName, setLastName] = useState(profile?.last_name ?? '');
    const [phone, setPhone] = useState(user?.phone ?? '');
    const [language, setLanguage] = useState(user?.language ?? 'en');
    const [bio, setBio] = useState(profile?.bio ?? '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [removingAvatar, setRemovingAvatar] = useState(false);

    const avatarUrl = avatarPreview ?? profile?.avatar_url ?? null;

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (! file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const form = new FormData();
        form.append('first_name', firstName);
        form.append('last_name', lastName);
        form.append('phone', phone);
        form.append('language', language);
        form.append('bio', bio);
        if (avatarFile) {
            form.append('avatar', avatarFile);
        }

        router.patch('/account/settings/profile', form, {
            preserveScroll: true,
            onSuccess: () => {
                setErrors({});
                setAvatarFile(null);
                setAvatarPreview(null);
            },
            onError: (errs) => setErrors(errs),
            onFinish: () => setSaving(false),
        });
    }

    function handleRemoveAvatar() {
        if (! profile?.avatar_url) return;
        setRemovingAvatar(true);
        router.delete('/account/settings/profile/avatar', {
            preserveScroll: true,
            onFinish: () => setRemovingAvatar(false),
        });
    }

    return (
        <>
            <Head title="Profile settings" />

            <section className="bg-stitch-surface-container-lowest rounded-xl p-8 shadow-[0_4px_20px_-2px_rgba(24,36,19,0.15)] border border-stitch-outline-variant/10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-headline-md text-stitch-primary mb-1">Profile Information</h1>
                        <p className="text-body-md text-stitch-on-surface-variant">
                            Update your personal details and how others see you.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center gap-gutter pb-8 border-b border-stitch-outline-variant/20">
                        <div className="relative size-32">
                            <img
                                className="w-full h-full rounded-full object-cover border-4 border-stitch-surface shadow-md"
                                src={avatarUrl ?? ''}
                                alt=""
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-stitch-primary text-stitch-on-primary p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                            >
                                <Camera className="size-4" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-label-md text-stitch-primary mb-1">Profile Picture</h3>
                            <p className="text-label-sm text-stitch-on-surface-variant max-w-xs">
                                JPG, GIF or PNG. Max size of 800K.
                            </p>
                            <div className="mt-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-stitch-primary text-stitch-on-primary rounded-lg text-label-md hover:opacity-90 transition-opacity"
                                >
                                    Upload New
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    disabled={!profile?.avatar_url || removingAvatar}
                                    className="px-4 py-2 border border-stitch-secondary text-stitch-secondary rounded-lg text-label-md hover:bg-stitch-secondary/5 transition-colors disabled:opacity-50"
                                >
                                    {removingAvatar ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                            <InputError message={errors.avatar} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <InputError message={errors.first_name} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            <InputError message={errors.last_name} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="py-2 text-body-md text-stitch-on-surface-variant">
                                {user?.email ?? ''}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <InputError message={errors.phone} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="language">Preferred Language</Label>
                            <select
                                id="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full border-0 border-b border-stitch-outline-variant focus:border-stitch-primary focus:ring-0 bg-transparent py-2 text-body-md"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                                ))}
                            </select>
                            <InputError message={errors.language} />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                rows={3}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                            <InputError message={errors.bio} />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </section>
        </>
    );
}
