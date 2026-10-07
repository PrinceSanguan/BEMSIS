import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: '*', allow: '/', disallow: ['/captain', '/secretary', '/partner', '/resident/', '/devices', '/device/'] },
    };
}
