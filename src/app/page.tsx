import HeroLanding from '@/components/landing/hero-landing';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: { absolute: 'BEMSIS — Barangay Event Management & Information System' },
};

export default function Welcome() {
    return (
        <div className="min-h-screen bg-white text-black">
            <HeroLanding />
        </div>
    );
}
