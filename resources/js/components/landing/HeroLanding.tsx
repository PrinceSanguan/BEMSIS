import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function HeroLanding() {
    return (
        <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
            {/* Sparkles Background */}
            <div className="absolute inset-0 h-full w-full">
                <SparklesCore
                    id="tsparticlesfullpage"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="h-full w-full"
                    particleColor="#3B82F6"
                />
            </div>
            <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
                <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
            </div>
            <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
                <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
                <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            </div>
            <div className="px-4 py-10 md:py-20">
                <h1 className="relative z-20 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
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
                    className="relative z-20 mt-8 flex flex-wrap items-center justify-center gap-4"
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
                        variant="default"
                        size="lg"
                        className="w-48 transform rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:-translate-y-0.5"
                        asChild
                    >
                        <Link href={route('auth.login')}>Login</Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-48 transform rounded-lg px-6 py-3 font-medium transition-all duration-300 hover:-translate-y-0.5"
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
                    className="relative z-20 mt-20 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                            <div className="p-8 text-center">
                                <div className="mb-4 text-6xl">📱</div>
                                <h3 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-200">Event Management Dashboard</h3>
                                <p className="text-gray-600 dark:text-gray-400">SMS • QR Codes • Real-time Updates</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
