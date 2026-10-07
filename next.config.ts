import type { NextConfig } from 'next';

const ROLE_AREAS = ['captain', 'secretary', 'partner', 'resident'];

const nextConfig: NextConfig = {
    images: {
        // Images are small files in /public (or demo uploads held in the browser),
        // so skip the image optimizer and keep Vercel's free-tier quota untouched.
        unoptimized: true,
    },
    async redirects() {
        return [
            ...ROLE_AREAS.map((role) => ({ source: `/${role}`, destination: `/${role}/dashboard`, permanent: false })),
            { source: '/resident/certificates/view', destination: '/resident/certificates', permanent: false },
        ];
    },
};

export default nextConfig;
