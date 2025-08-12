import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { route } from 'ziggy-js';

const PUROKS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6', 'Purok 7', 'Purok 8', 'Purok 9', 'Purok 10'];

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: '',
        purok: '',
    });

    const [showPurok, setShowPurok] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('auth.register.store'));
    };

    const handleRoleChange = (value: string) => {
        setData('role', value);
        setShowPurok(value === 'resident');
        if (value !== 'resident') {
            setData('purok', '');
        }
    };

    return (
        <>
            <Head title="Register" />
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
                <Card className="w-full max-w-md rounded-2xl shadow-xl">
                    <CardContent className="p-8">
                        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Create Account</h1>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="09XXXXXXXXX"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                                {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-3">
                                <Label>Role</Label>
                                <RadioGroup value={data.role} onValueChange={handleRoleChange}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="resident" id="resident" />
                                        <Label htmlFor="resident">Resident</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="partner_agency" id="partner_agency" />
                                        <Label htmlFor="partner_agency">Partner Agency</Label>
                                    </div>
                                </RadioGroup>
                                {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                            </div>

                            {/* Purok Selection (only for residents) */}
                            {showPurok && (
                                <div className="space-y-2">
                                    <Label htmlFor="purok">Purok</Label>
                                    <Select value={data.purok} onValueChange={(value) => setData('purok', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your purok" />
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
                            <Button type="submit" className="mt-6 w-full" disabled={processing}>
                                {processing ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <p className="mt-4 text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <a href={route('auth.login')} className="text-blue-500 hover:underline">
                                Login
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
