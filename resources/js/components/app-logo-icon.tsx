import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* Pediment */}
            <path d="M2 10L12 2L22 10Z" />
            {/* Entablature */}
            <rect x="3" y="10" width="18" height="1.5" />
            {/* Columns */}
            <rect x="4" y="11.5" width="2" height="6" />
            <rect x="9" y="11.5" width="2" height="6" />
            <rect x="13" y="11.5" width="2" height="6" />
            <rect x="18" y="11.5" width="2" height="6" />
            {/* Base */}
            <rect x="3" y="17.5" width="18" height="1" />
            {/* Steps */}
            <rect x="2" y="18.5" width="20" height="1.25" />
            <rect x="1" y="19.75" width="22" height="1.25" />
        </svg>
    );
}
