import { cn } from '@/lib/utils';

interface CivicHubLogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

export default function CivicHubLogo({ size = 'md', showText = false, className }: CivicHubLogoProps) {
    const dims = { sm: 32, md: 64, lg: 96 }[size];
    const iconSize = Math.round(dims * 0.6);
    const textClass = { sm: 'text-base', md: 'text-2xl', lg: 'text-3xl' }[size];

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div
                style={{ width: dims, height: dims }}
                className="flex shrink-0 items-center justify-center rounded-xl bg-indigo-600"
            >
                <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: iconSize, height: iconSize }}
                >
                    {/* Pediment */}
                    <path d="M2 10L12 2L22 10Z" fill="white" />
                    {/* Entablature */}
                    <rect x="3" y="10" width="18" height="1.5" fill="white" />
                    {/* Columns */}
                    <rect x="4" y="11.5" width="2" height="6" fill="white" />
                    <rect x="9" y="11.5" width="2" height="6" fill="white" />
                    <rect x="13" y="11.5" width="2" height="6" fill="white" />
                    <rect x="18" y="11.5" width="2" height="6" fill="white" />
                    {/* Base */}
                    <rect x="3" y="17.5" width="18" height="1" fill="white" />
                    {/* Steps */}
                    <rect x="2" y="18.5" width="20" height="1.25" fill="white" />
                    <rect x="1" y="19.75" width="22" height="1.25" fill="white" />
                </svg>
            </div>
            {showText && (
                <span className={cn('font-bold tracking-tight text-gray-900 dark:text-white', textClass)}>CivicHub</span>
            )}
        </div>
    );
}
