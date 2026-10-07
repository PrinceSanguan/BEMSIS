'use client';

import { useAssetUrl } from '@/lib/demo/files';

type StoredImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
    /** An "idb:<id>" upload reference or a /public path (what used to be `/storage/${path}`). */
    path: string | null | undefined;
    /** Shown while an upload loads or when it is missing. */
    fallback?: React.ReactNode;
};

/** <img> for demo uploads kept in IndexedDB (event posters, valid IDs). */
export function StoredImage({ path, fallback = null, alt = '', ...props }: StoredImageProps) {
    const url = useAssetUrl(path);
    if (!url) return <>{fallback}</>;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt} {...props} />;
}
