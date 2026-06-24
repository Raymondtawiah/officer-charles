import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />
            <PasskeyVerify />

            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
                <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
                    
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to continue to your dashboard
                        </p>
                    </div>

                    {/* Status */}
                    {status && (
                        <div className="mb-4 rounded-md bg-green-50 p-2 text-center text-sm text-green-600">
                            {status}
                        </div>
                    )}

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>

                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="text-sm"
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>

                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                    />

                                    <InputError message={errors.password} />
                                </div>

                                {/* Remember */}
                                <div className="flex items-center gap-2">
                                    <Checkbox id="remember" name="remember" />
                                    <Label htmlFor="remember">
                                        Keep me signed in
                                    </Label>
                                </div>

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    className="w-full py-2 text-base"
                                    disabled={processing}
                                >
                                    {processing && <Spinner />}
                                    Sign in
                                </Button>

                                {/* Signup */}
                                <p className="text-center text-sm text-muted-foreground">
                                    Don’t have an account?{' '}
                                    <TextLink href={register()}>
                                        Create one
                                    </TextLink>
                                </p>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in.',
};