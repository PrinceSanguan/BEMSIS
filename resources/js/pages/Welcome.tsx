import HeroLanding from '@/components/landing/HeroLanding';
import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Barangay Event Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
                <HeroLanding />
            </div>
        </>
    );
}
