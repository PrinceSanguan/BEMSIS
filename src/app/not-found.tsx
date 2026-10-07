import BemsisLogo from '@/components/bemsis-logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
                <div className="mb-4 flex justify-center">
                    <BemsisLogo size="md" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
                <p className="mt-2 text-gray-600">
                    The page you are looking for doesn&apos;t exist. If it was created in another browser, or the demo data was reset, it isn&apos;t
                    available here.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                        <Link href="/">Go home</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/login">Login</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
