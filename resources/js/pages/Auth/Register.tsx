import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { route } from 'ziggy-js';

const PUROKS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6', 'Purok 7', 'Purok 8', 'Purok 9', 'Purok 10'];

interface PageProps {
    [key: string]: any; // This allows any additional properties
    flash?: {
        success?: string;
        error?: string;
    };
}
export default function Register() {
    const { flash } = usePage<PageProps>().props;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPurok, setShowPurok] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: '',
        purok: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Additional client-side validation
        if (data.password !== data.password_confirmation) {
            return;
        }

        post(route('auth.register.store'), {
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                console.log('Registration errors:', errors);
            },
        });
    };

    const handleRoleChange = (value: string) => {
        setData('role', value);
        setShowPurok(value === 'resident');
        if (value !== 'resident') {
            setData('purok', '');
        }
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^09\d{9}$/;
        return phoneRegex.test(phone);
    };

    const validatePassword = (password: string) => {
        return password.length >= 6;
    };

    const isFormValid = () => {
        return (
            data.name.trim() !== '' &&
            data.email.trim() !== '' &&
            validatePhone(data.phone) &&
            validatePassword(data.password) &&
            data.password === data.password_confirmation &&
            data.role !== '' &&
            (data.role !== 'resident' || data.purok !== '')
        );
    };

    return (
        <>
            <Head title="Create Account" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <Card className="w-full max-w-md rounded-2xl border-0 shadow-xl">
                    <CardContent className="p-8">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                                <UserPlus className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                            <p className="mt-2 text-gray-600">Join our community management system</p>
                        </div>

                        {/* Flash Messages */}
                        {flash?.success && (
                            <Alert className="mb-4 border-green-200 bg-green-50">
                                <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                            </Alert>
                        )}

                        {flash?.error && (
                            <Alert className="mb-4 border-red-200 bg-red-50">
                                <AlertDescription className="text-red-800">{flash.error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={errors.email ? 'border-red-300 focus:border-red-500' : ''}
                                    required
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                    Phone Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="09XXXXXXXXX"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className={errors.phone ? 'border-red-300 focus:border-red-500' : ''}
                                    required
                                />
                                {!validatePhone(data.phone) && data.phone.length > 0 && (
                                    <p className="text-sm text-amber-600">Phone number should start with 09 and be 11 digits long</p>
                                )}
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Password <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={errors.password ? 'border-red-300 pr-10 focus:border-red-500' : 'pr-10'}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {!validatePassword(data.password) && data.password.length > 0 && (
                                    <p className="text-sm text-amber-600">Password must be at least 6 characters long</p>
                                )}
                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                                    Confirm Password <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={errors.password_confirmation ? 'border-red-300 pr-10 focus:border-red-500' : 'pr-10'}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {data.password !== data.password_confirmation && data.password_confirmation.length > 0 && (
                                    <p className="text-sm text-red-500">Passwords do not match</p>
                                )}
                                {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700">
                                    Select Your Role <span className="text-red-500">*</span>
                                </Label>
                                <RadioGroup value={data.role} onValueChange={handleRoleChange} className="space-y-3">
                                    <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50">
                                        <RadioGroupItem value="resident" id="resident" />
                                        <Label htmlFor="resident" className="flex-1 cursor-pointer">
                                            <div>
                                                <div className="font-medium">Resident</div>
                                                <div className="text-sm text-gray-500">Community member with event access</div>
                                            </div>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50">
                                        <RadioGroupItem value="partner_agency" id="partner_agency" />
                                        <Label htmlFor="partner_agency" className="flex-1 cursor-pointer">
                                            <div>
                                                <div className="font-medium">Partner Agency</div>
                                                <div className="text-sm text-gray-500">External organization partner</div>
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                                {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                            </div>

                            {/* Purok Selection (only for residents) */}
                            {showPurok && (
                                <div className="space-y-2">
                                    <Label htmlFor="purok" className="text-sm font-medium text-gray-700">
                                        Select Your Purok <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.purok} onValueChange={(value) => setData('purok', value)}>
                                        <SelectTrigger className={errors.purok ? 'border-red-300 focus:border-red-500' : ''}>
                                            <SelectValue placeholder="Choose your purok" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PUROKS.map((purok) => (
                                                <SelectItem key={purok} value={purok.toLowerCase().replace(' ', '_')}>
                                                    {purok}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.purok && <p className="text-sm text-red-500">{errors.purok}</p>}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="mt-6 h-12 w-full bg-blue-600 text-lg font-medium hover:bg-blue-700"
                                disabled={processing || !isFormValid()}
                            >
                                {processing ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        {/* Additional Info */}
                        <div className="mt-6 rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Your account will require approval from the administrator before you can access the system.
                            </p>
                        </div>

                        {/* Login Link */}
                        <p className="mt-6 text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <a href={route('auth.login')} className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                Sign in here
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
