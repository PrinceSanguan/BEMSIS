import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function HeroLanding() {
    return (
        <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center bg-white text-black dark:bg-black dark:text-white">
            {/* Sparkles Background */}
            <div className="absolute inset-0 h-full w-full">
                <SparklesCore
                    id="tsparticlesfullpage"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="h-full w-full"
                    particleColor="#16A34A"
                />
            </div>
            <div className="absolute inset-y-0 left-0 h-full w-px bg-white/80 dark:bg-black/80">
                <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-green-600 to-transparent" />
            </div>
            <div className="absolute inset-y-0 right-0 h-full w-px bg-white/80 dark:bg-black/80">
                <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-green-600 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px w-full bg-white/80 dark:bg-black/80">
                <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-green-600 to-transparent" />
            </div>
            <div className="px-4 py-10 md:py-20">
                <h1 className="relative z-20 mx-auto max-w-4xl text-center text-2xl font-bold text-black md:text-4xl lg:text-7xl dark:text-white">
                    {'Barangay Event Management System with Integrated SMS and QR Code Technology'.split(' ').map((word, index) => (
                        <motion.span
                            key={index}
                            initial={{ opacity: 0, filter: 'blur(4px)', y: 10 }}
                            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: index * 0.1,
                                ease: 'easeInOut',
                            }}
                            className="mr-2 inline-block"
                        >
                            {word}
                        </motion.span>
                    ))}
                </h1>
                <motion.p
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        duration: 0.3,
                        delay: 0.8,
                    }}
                    className="relative z-20 mt-8 flex flex-wrap items-center justify-center gap-4 text-green-800 dark:text-green-200"
                >
                    Streamline your barangay events with our comprehensive management system. Send SMS notifications and generate QR codes for
                    seamless event coordination.
                </motion.p>
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        duration: 0.3,
                        delay: 1,
                    }}
                    className="relative z-20 mt-8 flex flex-wrap items-center justify-center gap-4"
                >
                    <Button
                        size="lg"
                        className="w-48 transform rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-700"
                        asChild
                    >
                        <Link href={route('auth.login')}>Login</Link>
                    </Button>
                    <Button
                        size="lg"
                        className="w-48 transform rounded-lg border border-green-600 px-6 py-3 font-medium text-green-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-600 hover:text-white"
                        asChild
                    >
                        <Link href={route('auth.register')}>Register</Link>
                    </Button>
                </motion.div>
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.3,
                        delay: 1.2,
                    }}
                    className="relative z-20 mt-20 rounded-3xl border border-green-600 bg-white p-4 shadow-md dark:border-green-600 dark:bg-black"
                >
                    <div className="w-full overflow-hidden rounded-xl border border-green-600">
                        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-black dark:to-green-900">
                            <div className="p-8 text-center">
                                <img
                                    src="/assets/images/landing.png"
                                    alt="Event Management Dashboard"
                                    className="mx-auto mb-4 h-32 w-auto object-contain"
                                />
                                <h3 className="mb-2 text-2xl font-bold text-black dark:text-white">Event Management Dashboard</h3>
                                <p className="text-green-800 dark:text-green-200">SMS • QR Codes • Real-time Updates</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
