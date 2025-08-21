// Add these interfaces to your existing types/index.ts file or create it if it doesn't exist

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface Auth {
    user: User | null;
    lastActivity?: number;
    sessionLifetime?: number;
}

export interface SharedData {
    auth: Auth;
    name: string;
    quote?: {
        message: string;
        author: string;
    };
    ziggy: any;
    flash: {
        success?: string;
        error?: string;
        info?: string;
    };
}
