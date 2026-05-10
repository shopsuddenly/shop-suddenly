"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Mail } from "lucide-react";

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const success = searchParams.get('success') === 'true';
    const error = searchParams.get('error');

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {success ? (
                    <div className="bg-card border border-border rounded-lg p-8">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h1 className="font-serif text-2xl text-foreground mb-4">
                            You've Been Unsubscribed
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            You will no longer receive promotional emails from Suddenly.
                            You can resubscribe anytime from your profile settings.
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                ) : error ? (
                    <div className="bg-card border border-border rounded-lg p-8">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="font-serif text-2xl text-foreground mb-4">
                            Unsubscribe Failed
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            {error === 'missing_email' && 'Email address is missing from the request.'}
                            {error === 'invalid_token' && 'Invalid unsubscribe link. Please use the link from your email.'}
                            {error === 'user_not_found' && 'Email address not found in our system.'}
                            {error === 'server_error' && 'An error occurred. Please try again later.'}
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                        >
                            Contact Support
                        </Link>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-lg p-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="font-serif text-2xl text-foreground mb-4">
                            Email Preferences
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            To manage your email preferences, please use the unsubscribe link
                            in any of our promotional emails, or update your settings in your profile.
                        </p>
                        <Link
                            href="/profile"
                            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                        >
                            Go to Profile
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        }>
            <UnsubscribeContent />
        </Suspense>
    );
}
