'use client';

import BemsisLogo from '@/components/bemsis-logo';
import { FlashAlerts } from '@/components/shared/flash-alerts';
import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';
import { quickLogin } from '@/lib/demo/actions';
import { flash } from '@/lib/demo/flash';
import { useHydrated } from '@/lib/demo/store';
import { route } from '@/lib/routes';
import type { Role } from '@/lib/types';
import { Building2, ClipboardList, Handshake, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const HEADLINE = 'BEMSIS — Community Event Management with SMS Notifications and QR Code Technology';

const QUICK_ROLES: { role: Role; label: string; icon: typeof Building2 }[] = [
    { role: 'captain', label: 'Captain', icon: Building2 },
    { role: 'secretary', label: 'Secretary', icon: ClipboardList },
    { role: 'partner_agency', label: 'Partner', icon: Handshake },
    { role: 'resident', label: 'Resident', icon: UserRound },
];

export default function HeroLanding() {
    const router = useRouter();
    const hydrated = useHydrated();

    const enterAs = (role: Role) => {
        const result = quickLogin(role);
        if (result.ok) router.push(result.data.redirect);
        else flash('error', result.errors.auth);
    };

    return (
        <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center bg-white text-black">
            <div className="absolute inset-0 bg-white/30"></div>

            {/* Sparkles Background */}
            <div className="absolute inset-0 h-full w-full">
                <SparklesCore
                    id="tsparticlesfullpage"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="h-full w-full"
                    particleColor="#4F46E5"
                />
            </div>

            {/* Border Effects */}
            <div className="absolute inset-y-0 left-0 h-full w-px bg-white/80">
                <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-indigo-600 to-transparent" />
            </div>
            <div className="absolute inset-y-0 right-0 h-full w-px bg-white/80">
                <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-indigo-600 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px w-full bg-white/80">
                <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-indigo-600 to-transparent" />
            </div>

            <div className="relative z-20 px-4 py-10 md:py-20">
                <FlashAlerts className="mx-auto mb-6 max-w-xl" />

                {/* Logo and Title Section */}
                <div className="mb-8 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        className="mb-6"
                    >
                        <BemsisLogo size="lg" showText={true} />
                    </motion.div>

                    <h1 className="relative z-20 mx-auto max-w-4xl text-center text-2xl font-bold text-black md:text-4xl lg:text-7xl">
                        {HEADLINE.split(' ').map((word, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, filter: 'blur(4px)', y: 10 }}
                                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.1 + 0.3,
                                    ease: 'easeInOut',
                                }}
                                className="mr-2 inline-block"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.2 }}
                    className="relative z-20 mx-auto mt-8 max-w-3xl text-center text-indigo-800"
                >
                    Streamline your community events with BEMSIS, the Barangay Event Management &amp; Information System. Send SMS notifications and
                    generate QR codes for seamless event coordination.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.4 }}
                    className="relative z-20 mt-8 flex flex-wrap items-center justify-center gap-4"
                >
                    <Button
                        size="lg"
                        className="w-48 transform rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
                        asChild
                    >
                        <Link href={route('auth.login')}>Login</Link>
                    </Button>
                    <Button
                        size="lg"
                        className="w-48 transform rounded-lg border-2 border-indigo-600 bg-white px-6 py-3 font-medium text-indigo-600 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600 hover:text-white hover:shadow-xl"
                        asChild
                    >
                        <Link href={route('auth.register')}>Register</Link>
                    </Button>
                </motion.div>

                {/* Portfolio demo: jump straight into any role */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1.6 }}
                    className="relative z-20 mx-auto mt-8 max-w-2xl rounded-2xl border border-indigo-100 bg-white/90 p-4 text-center shadow-sm backdrop-blur"
                >
                    <p className="text-sm font-medium text-gray-700">Live demo — explore any role instantly, no sign-up needed</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {QUICK_ROLES.map(({ role, label, icon: Icon }) => (
                            <Button
                                key={role}
                                variant="outline"
                                disabled={!hydrated}
                                onClick={() => enterAs(role)}
                                className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Button>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 1.2 }}
                    className="relative z-20 mt-20 rounded-3xl border border-indigo-500 bg-white p-4 shadow-md"
                >
                    <div className="w-full overflow-hidden rounded-xl border border-indigo-500">
                        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
                            <div className="p-8 text-center">
                                <Image
                                    src="/assets/images/landing.png"
                                    alt="Event Management Dashboard"
                                    width={636}
                                    height={392}
                                    priority
                                    className="mx-auto mb-4 h-32 w-auto object-contain"
                                />
                                <h3 className="mb-2 text-2xl font-bold text-black">Event Management Dashboard</h3>
                                <p className="text-indigo-800">SMS • QR Codes • Real-time Updates</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
