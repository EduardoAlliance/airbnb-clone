import { Head, router, usePage } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';

export default function EmailTwoFactorChallenge() {
    const { errors: pageErrors } = usePage().props;
    const [code, setCode] = useState('');
    const [processing, setProcessing] = useState(false);
    const [resending, setResending] = useState(false);
    const serverErrors = (pageErrors as Record<string, string>) ?? {};

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/account/two-factor-challenge', { code }, {
            onFinish: () => setProcessing(false),
            onError: () => setCode(''),
        });
    }

    function handleResend() {
        setResending(true);
        router.post('/account/two-factor-challenge/resend', {}, {
            onFinish: () => setResending(false),
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Two-factor authentication" />

            <div className="space-y-6">
                <p className="text-label-md text-stitch-on-surface-variant text-center">
                    Enter the verification code sent to your email.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center space-y-3 text-center">
                        <div className="flex w-full items-center justify-center">
                            <InputOTP
                                name="code"
                                maxLength={OTP_MAX_LENGTH}
                                value={code}
                                onChange={(value) => setCode(value)}
                                disabled={processing}
                                pattern={REGEXP_ONLY_DIGITS}
                                autoFocus
                            >
                                <InputOTPGroup>
                                    {Array.from({ length: OTP_MAX_LENGTH }, (_, index) => (
                                        <InputOTPSlot key={index} index={index} />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <InputError message={serverErrors.code} />
                    </div>

                    <Button type="submit" className="w-full" disabled={processing || code.length !== OTP_MAX_LENGTH}>
                        {processing ? 'Verifying...' : 'Continue'}
                    </Button>
                </form>

                <div className="text-center text-sm text-stitch-on-surface-variant">
                    Didn&apos;t receive the code?{' '}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="cursor-pointer text-stitch-primary underline underline-offset-4 hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                        {resending ? 'Sending...' : 'Resend'}
                    </button>
                </div>
            </div>
        </>
    );
}

EmailTwoFactorChallenge.layout = {
    title: 'Verify your login',
    description: 'Enter the verification code sent to your email.',
};
