import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Building2, Eye, EyeOff, FileText, Upload, UserPlus } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface Purok {
    id: number;
    name: string;
}

interface PageProps {
    [key: string]: any;
    puroks: Purok[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Register() {
    const { flash, puroks } = usePage<PageProps>().props;
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });

    const validatePassword = (password: string) => {
        const validation = {
            length: password.length >= 8 && password.length <= 12,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password),
        };
        setPasswordValidation(validation);
        return validation;
    };
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registrationType, setRegistrationType] = useState<'resident' | 'partner_agency' | ''>('');

    const { data, setData, post, processing, errors, reset } = useForm({
        // Common fields
        email: '',
        password: '',
        password_confirmation: '',
        role: '',

        // Resident fields
        first_name: '',
        middle_name: '',
        last_name: '',
        extension: '',
        place_of_birth: '',
        date_of_birth: '',
        age: '',
        sex: '',
        civil_status: '',
        citizenship: '',
        occupation: '',
        special_notes: '',
        purok_id: '',
        phone: '',
        valid_id: null as File | null,

        // Partner Agency fields
        agency_name: '',
        representative_first_name: '',
        representative_last_name: '',
        agency_address: '',
        agency_phone: '',
        agency_valid_id: null as File | null,
    });

    // Auto-calculate age when date of birth changes
    useEffect(() => {
        if (data.date_of_birth) {
            const birthDate = new Date(data.date_of_birth);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            setData('age', age.toString());
        }
    }, [data.date_of_birth]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('auth.register.store'));
    };

    const handleRegistrationTypeChange = (value: string) => {
        setData('role', value);
        setRegistrationType(value as 'resident' | 'partner_agency');
        reset();
        setData('role', value);
    };

    const handleBackToSelection = () => {
        setRegistrationType('');
        reset();
    };

    // Simple phone number formatter for display only
    const formatPhoneDisplay = (phone: string) => {
        if (!phone) return '';
        if (phone.length >= 12) {
            return `+${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
        }
        return phone;
    };

    return (
        <>
            <Head title="Create Account" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <Card className="w-full max-w-4xl rounded-2xl border-0 shadow-xl">
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
                            <Alert className="mb-6 border-green-200 bg-green-50">
                                <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                            </Alert>
                        )}

                        {flash?.error && (
                            <Alert className="mb-6 border-red-200 bg-red-50">
                                <AlertDescription className="text-red-800">{flash.error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Registration Type Selection */}
                            {!registrationType ? (
                                <div className="space-y-4">
                                    <Label className="text-lg font-semibold text-gray-800">
                                        Select Registration Type <span className="text-red-500">*</span>
                                    </Label>
                                    <RadioGroup value={data.role} onValueChange={handleRegistrationTypeChange}>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="relative">
                                                <RadioGroupItem value="resident" id="resident" className="peer sr-only" />
                                                <Label
                                                    htmlFor="resident"
                                                    className="flex cursor-pointer items-center space-x-4 rounded-lg border-2 border-gray-200 p-4 transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:bg-gray-50"
                                                >
                                                    <UserPlus className="h-8 w-8 text-blue-600" />
                                                    <div>
                                                        <div className="font-semibold text-gray-800">Resident</div>
                                                        <div className="text-sm text-gray-500">Community member registration</div>
                                                    </div>
                                                </Label>
                                            </div>
                                            <div className="relative">
                                                <RadioGroupItem value="partner_agency" id="partner_agency" className="peer sr-only" />
                                                <Label
                                                    htmlFor="partner_agency"
                                                    className="flex cursor-pointer items-center space-x-4 rounded-lg border-2 border-gray-200 p-4 transition-all peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:bg-gray-50"
                                                >
                                                    <Building2 className="h-8 w-8 text-green-600" />
                                                    <div>
                                                        <div className="font-semibold text-gray-800">Partner Agency</div>
                                                        <div className="text-sm text-gray-500">External organization partner</div>
                                                    </div>
                                                </Label>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                    {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center space-x-3">
                                        {registrationType === 'resident' ? (
                                            <UserPlus className="h-6 w-6 text-blue-600" />
                                        ) : (
                                            <Building2 className="h-6 w-6 text-green-600" />
                                        )}
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-800">
                                                {registrationType === 'resident' ? 'Resident Registration' : 'Partner Agency Registration'}
                                            </h2>
                                        </div>
                                    </div>
                                    <Button type="button" variant="outline" onClick={handleBackToSelection}>
                                        ← Back
                                    </Button>
                                </div>
                            )}

                            {/* Resident Registration Form */}
                            {registrationType === 'resident' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>

                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <Label htmlFor="first_name">First Name *</Label>
                                            <Input
                                                id="first_name"
                                                value={data.first_name}
                                                onChange={(e) => setData('first_name', e.target.value)}
                                                className={errors.first_name ? 'border-red-300' : ''}
                                            />
                                            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="middle_name">Middle Name</Label>
                                            <Input
                                                id="middle_name"
                                                value={data.middle_name}
                                                onChange={(e) => setData('middle_name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="last_name">Last Name *</Label>
                                            <Input
                                                id="last_name"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                className={errors.last_name ? 'border-red-300' : ''}
                                            />
                                            {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="extension">Extension</Label>
                                            <Select value={data.extension} onValueChange={(value) => setData('extension', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="Jr.">Jr.</SelectItem>
                                                    <SelectItem value="Sr.">Sr.</SelectItem>
                                                    <SelectItem value="II">II</SelectItem>
                                                    <SelectItem value="III">III</SelectItem>
                                                    <SelectItem value="IV">IV</SelectItem>
                                                    <SelectItem value="V">V</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Birth Information */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <Label htmlFor="place_of_birth">Place of Birth *</Label>
                                            <Input
                                                id="place_of_birth"
                                                value={data.place_of_birth}
                                                onChange={(e) => setData('place_of_birth', e.target.value)}
                                                className={errors.place_of_birth ? 'border-red-300' : ''}
                                            />
                                            {errors.place_of_birth && <p className="text-sm text-red-500">{errors.place_of_birth}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="date_of_birth">Date of Birth *</Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                                className={errors.date_of_birth ? 'border-red-300' : ''}
                                            />
                                            {errors.date_of_birth && <p className="text-sm text-red-500">{errors.date_of_birth}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="age">Age *</Label>
                                            <Input id="age" type="number" value={data.age} readOnly className="bg-gray-50" />
                                            {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                                        </div>
                                    </div>

                                    {/* Personal Details */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <Label htmlFor="sex">Sex *</Label>
                                            <Select value={data.sex} onValueChange={(value) => setData('sex', value)}>
                                                <SelectTrigger className={errors.sex ? 'border-red-300' : ''}>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.sex && <p className="text-sm text-red-500">{errors.sex}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="civil_status">Civil Status *</Label>
                                            <Select value={data.civil_status} onValueChange={(value) => setData('civil_status', value)}>
                                                <SelectTrigger className={errors.civil_status ? 'border-red-300' : ''}>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Single">Single</SelectItem>
                                                    <SelectItem value="Married">Married</SelectItem>
                                                    <SelectItem value="Widowed">Widowed</SelectItem>
                                                    <SelectItem value="Separated">Separated</SelectItem>
                                                    <SelectItem value="Divorced">Divorced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.civil_status && <p className="text-sm text-red-500">{errors.civil_status}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="citizenship">Citizenship *</Label>
                                            <Input
                                                id="citizenship"
                                                value={data.citizenship}
                                                onChange={(e) => setData('citizenship', e.target.value)}
                                                className={errors.citizenship ? 'border-red-300' : ''}
                                            />
                                            {errors.citizenship && <p className="text-sm text-red-500">{errors.citizenship}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="occupation">Occupation *</Label>
                                            <Input
                                                id="occupation"
                                                value={data.occupation}
                                                onChange={(e) => setData('occupation', e.target.value)}
                                                className={errors.occupation ? 'border-red-300' : ''}
                                            />
                                            {errors.occupation && <p className="text-sm text-red-500">{errors.occupation}</p>}
                                        </div>
                                    </div>

                                    {/* Special Notes */}
                                    <div>
                                        <Label htmlFor="special_notes">Special Notes</Label>
                                        <p className="mb-2 text-sm text-gray-500">
                                            Indicate if: Labor/Employed, Unemployed, PWD, Solo Parent, OSY, OSC, and/or IP
                                        </p>
                                        <Textarea
                                            id="special_notes"
                                            value={data.special_notes}
                                            onChange={(e) => setData('special_notes', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    {/* Location and Contact */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="purok_id">Purok *</Label>
                                            <Select value={data.purok_id} onValueChange={(value) => setData('purok_id', value)}>
                                                <SelectTrigger className={errors.purok_id ? 'border-red-300' : ''}>
                                                    <SelectValue placeholder="Choose your purok" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {puroks
                                                        .filter((purok) => purok.name.match(/Purok [1-7]/))
                                                        .map((purok) => (
                                                            <SelectItem key={purok.id} value={purok.id.toString()}>
                                                                {purok.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.purok_id && <p className="text-sm text-red-500">{errors.purok_id}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number * (Globe/TM only)</Label>
                                            <Input
                                                id="phone"
                                                placeholder="639123456789"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className={errors.phone ? 'border-red-300' : ''}
                                            />
                                            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                        </div>
                                    </div>

                                    {/* Valid ID Upload */}
                                    <div>
                                        <Label htmlFor="valid_id">Valid ID * (Max 5MB)</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="valid_id"
                                                type="file"
                                                accept=".jpeg,.jpg,.png,.pdf"
                                                onChange={(e) => setData('valid_id', e.target.files?.[0] || null)}
                                                className={errors.valid_id ? 'border-red-300' : ''}
                                            />
                                            <Upload className="h-5 w-5 text-gray-400" />
                                        </div>
                                        {errors.valid_id && <p className="text-sm text-red-500">{errors.valid_id}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Partner Agency Registration Form */}
                            {registrationType === 'partner_agency' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-800">Agency Information</h3>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="agency_name">Agency Name *</Label>
                                            <Input
                                                id="agency_name"
                                                value={data.agency_name}
                                                onChange={(e) => setData('agency_name', e.target.value)}
                                                className={errors.agency_name ? 'border-red-300' : ''}
                                            />
                                            {errors.agency_name && <p className="text-sm text-red-500">{errors.agency_name}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="agency_phone">Phone Number * (Globe/TM only)</Label>
                                            <Input
                                                id="agency_phone"
                                                placeholder="639123456789"
                                                value={data.agency_phone}
                                                onChange={(e) => setData('agency_phone', e.target.value)}
                                                className={errors.agency_phone ? 'border-red-300' : ''}
                                            />
                                            {errors.agency_phone && <p className="text-sm text-red-500">{errors.agency_phone}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="representative_first_name">Representative First Name *</Label>
                                            <Input
                                                id="representative_first_name"
                                                value={data.representative_first_name}
                                                onChange={(e) => setData('representative_first_name', e.target.value)}
                                                className={errors.representative_first_name ? 'border-red-300' : ''}
                                            />
                                            {errors.representative_first_name && (
                                                <p className="text-sm text-red-500">{errors.representative_first_name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="representative_last_name">Representative Last Name *</Label>
                                            <Input
                                                id="representative_last_name"
                                                value={data.representative_last_name}
                                                onChange={(e) => setData('representative_last_name', e.target.value)}
                                                className={errors.representative_last_name ? 'border-red-300' : ''}
                                            />
                                            {errors.representative_last_name && (
                                                <p className="text-sm text-red-500">{errors.representative_last_name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="agency_address">Agency Address (Optional)</Label>
                                        <Textarea
                                            id="agency_address"
                                            value={data.agency_address}
                                            onChange={(e) => setData('agency_address', e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="agency_valid_id">Valid ID/Endorsement * (Max 5MB)</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="agency_valid_id"
                                                type="file"
                                                accept=".jpeg,.jpg,.png,.pdf"
                                                onChange={(e) => setData('agency_valid_id', e.target.files?.[0] || null)}
                                                className={errors.agency_valid_id ? 'border-red-300' : ''}
                                            />
                                            <FileText className="h-5 w-5 text-gray-400" />
                                        </div>
                                        {errors.agency_valid_id && <p className="text-sm text-red-500">{errors.agency_valid_id}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Account Credentials */}
                            {registrationType && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-800">Account Credentials</h3>

                                    <div>
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className={errors.email ? 'border-red-300' : ''}
                                        />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>

                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <h4 className="mb-2 font-semibold text-blue-800">Password Requirements:</h4>
                                        <ul className="space-y-1 text-sm">
                                            <li
                                                className={`flex items-center gap-2 ${passwordValidation.length ? 'text-green-600' : 'text-blue-700'}`}
                                            >
                                                <span className={`text-xs ${passwordValidation.length ? '✓' : '•'}`}>
                                                    {passwordValidation.length ? '✓' : '•'}
                                                </span>
                                                8-12 characters long
                                            </li>
                                            <li
                                                className={`flex items-center gap-2 ${passwordValidation.uppercase ? 'text-green-600' : 'text-blue-700'}`}
                                            >
                                                <span className={`text-xs ${passwordValidation.uppercase ? '✓' : '•'}`}>
                                                    {passwordValidation.uppercase ? '✓' : '•'}
                                                </span>
                                                At least 1 uppercase letter (A-Z)
                                            </li>
                                            <li
                                                className={`flex items-center gap-2 ${passwordValidation.lowercase ? 'text-green-600' : 'text-blue-700'}`}
                                            >
                                                <span className={`text-xs ${passwordValidation.lowercase ? '✓' : '•'}`}>
                                                    {passwordValidation.lowercase ? '✓' : '•'}
                                                </span>
                                                At least 1 lowercase letter (a-z)
                                            </li>
                                            <li
                                                className={`flex items-center gap-2 ${passwordValidation.number ? 'text-green-600' : 'text-blue-700'}`}
                                            >
                                                <span className={`text-xs ${passwordValidation.number ? '✓' : '•'}`}>
                                                    {passwordValidation.number ? '✓' : '•'}
                                                </span>
                                                At least 1 number (0-9)
                                            </li>
                                            <li
                                                className={`flex items-center gap-2 ${passwordValidation.special ? 'text-green-600' : 'text-blue-700'}`}
                                            >
                                                <span className={`text-xs ${passwordValidation.special ? '✓' : '•'}`}>
                                                    {passwordValidation.special ? '✓' : '•'}
                                                </span>
                                                At least 1 special character (!@#$%^&*)
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="password">Password *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setData('password', value);
                                                        validatePassword(value);
                                                    }}
                                                    className={errors.password ? 'border-red-300 pr-10' : 'pr-10'}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password_confirmation"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    className={errors.password_confirmation ? 'border-red-300 pr-10' : 'pr-10'}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                                        </div>
                                    </div>

                                    <Button type="submit" className="h-12 w-full bg-blue-600 text-lg hover:bg-blue-700" disabled={processing}>
                                        {processing ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                </div>
                            )}
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <a href={route('auth.login')} className="text-blue-500 hover:underline">
                                Sign in
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
