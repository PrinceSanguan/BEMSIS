import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function HeroLanding() {
    return (
        <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center bg-white text-black dark:bg-black dark:text-white">
            {/* Barangay Logo Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-60 dark:opacity-70">
                <img
                    src="/assets/images/Bemsis.jpg"
                    alt="Barangay Logo Background"
                    className="h-[600px] w-[600px] object-contain md:h-[800px] md:w-[800px] lg:h-[750px] lg:w-[1000px]"
                />
            </div>

            {/* Dark overlay for better text contrast */}
            <div className="absolute inset-0 bg-white/30 dark:bg-black/45"></div>

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

            {/* Border Effects */}
            <div className="absolute inset-y-0 left-0 h-full w-px bg-white/80 dark:bg-black/80">
                <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-green-600 to-transparent" />
            </div>
            <div className="absolute inset-y-0 right-0 h-full w-px bg-white/80 dark:bg-black/80">
                <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-green-600 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px w-full bg-white/80 dark:bg-black/80">
                <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-green-600 to-transparent" />
            </div>

            <div className="relative z-20 px-4 py-10 md:py-20">
                {/* Logo and Title Section */}
                <div className="mb-8 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        className="mb-6"
                    ></motion.div>

                    <h1 className="relative z-20 mx-auto max-w-4xl text-center text-2xl font-bold text-black md:text-4xl lg:text-7xl dark:text-white">
                        {'Barangay Event Management System with Integrated SMS and QR Code Technology'.split(' ').map((word, index) => (
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
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        duration: 0.3,
                        delay: 1.2,
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
                        delay: 1.4,
                    }}
                    className="relative z-20 mt-8 flex flex-wrap items-center justify-center gap-4"
                >
                    <Button
                        size="lg"
                        className="w-48 transform rounded-lg bg-green-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl"
                        asChild
                    >
                        <Link href={route('auth.login')}>Login</Link>
                    </Button>
                    <Button
                        size="lg"
                        className="w-48 transform rounded-lg border-2 border-green-600 bg-white px-6 py-3 font-medium text-green-600 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-600 hover:text-white hover:shadow-xl dark:bg-black"
                        asChild
                    >
                        <Link href={route('auth.register')}>Register</Link>
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
