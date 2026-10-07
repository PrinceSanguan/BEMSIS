'use client';

// Small stand-in for Inertia's useForm so the ported forms keep their shape:
//   const { data, setData, errors, processing, submit, reset } = useForm({ email: '', password: '' });
//   submit(() => login(data.email, data.password), { onSuccess: (result) => router.push(result.redirect) });

import type { ActionResult, FormErrors } from '@/lib/types';
import { useCallback, useState } from 'react';

interface SubmitOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (errors: FormErrors) => void;
    onFinish?: () => void;
}

export function useForm<TData extends Record<string, unknown>>(initial: TData) {
    const [defaults, setDefaults] = useState(initial);
    const [data, setDataState] = useState(initial);
    const [errors, setErrors] = useState<FormErrors>({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    /** setData('email', value) or setData({ ...data, email: value }) or setData((d) => ({ ...d })) */
    const setData = useCallback(<K extends keyof TData>(keyOrData: K | TData | ((current: TData) => TData), value?: TData[K]) => {
        if (typeof keyOrData === 'function') setDataState(keyOrData as (current: TData) => TData);
        else if (typeof keyOrData === 'object') setDataState(keyOrData as TData);
        else setDataState((current) => ({ ...current, [keyOrData]: value }));
    }, []);

    const reset = useCallback(
        (...fields: (keyof TData)[]) => {
            if (fields.length === 0) setDataState(defaults);
            else setDataState((current) => ({ ...current, ...Object.fromEntries(fields.map((f) => [f, defaults[f]])) }));
        },
        [defaults],
    );

    const clearErrors = useCallback((...fields: string[]) => {
        if (fields.length === 0) setErrors({});
        else setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !fields.includes(key))));
    }, []);

    const setError = useCallback((field: string, message: string) => setErrors((current) => ({ ...current, [field]: message })), []);

    /** Runs an action (sync or async) and stores its validation errors. */
    const submit = useCallback(async <T>(action: () => ActionResult<T> | Promise<ActionResult<T>>, options: SubmitOptions<T> = {}) => {
        setProcessing(true);
        setErrors({});
        try {
            const result = await action();
            if (result.ok) {
                setRecentlySuccessful(true);
                setTimeout(() => setRecentlySuccessful(false), 2000);
                options.onSuccess?.(result.data);
            } else {
                setErrors(result.errors);
                options.onError?.(result.errors);
            }
            return result;
        } finally {
            setProcessing(false);
            options.onFinish?.();
        }
    }, []);

    return {
        data,
        setData,
        errors,
        setError,
        clearErrors,
        processing,
        recentlySuccessful,
        reset,
        submit,
        /** Changes what reset() goes back to. */
        setDefaults: (values?: TData) => setDefaults(values ?? data),
    };
}
