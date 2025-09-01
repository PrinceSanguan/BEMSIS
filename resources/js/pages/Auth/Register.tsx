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
        contact_number: '',
        valid_id: null as File | null,

        // Partner Agency fields
        agency_name: '',
        representative_first_name: '',
        representative_last_name: '',
        agency_address: '',
        agency_contact_number: '',
        agency_valid_id: null as File | null,
    });

    // Calculate age when date of birth changes
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

        if (data.password !== data.password_confirmation) {
            return;
        }

        // Use Inertia's built-in form submission
        post(route('auth.register.store'));
    };

    const handleRegistrationTypeChange = (value: string) => {
        setData('role', value);
        setRegistrationType(value as 'resident' | 'partner_agency');

        // Reset form data when switching types
        reset();
        setData('role', value);
    };

    const handleBackToSelection = () => {
        setRegistrationType('');
        reset();
    };

    const validatePassword = (password: string) => {
        const minLength = password.length >= 8 && password.length <= 12;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^\d{9}$/;
        return phoneRegex.test(phone);
    };

    const validateGlobeTMPhone = (phone: string) => {
        if (!phone || phone.length !== 9) return false;

        // Globe/TM valid prefixes (first 3 digits after 63)
        const globeTMPrefixes = [
            '905',
            '906',
            '915',
            '916',
            '917',
            '926',
            '927',
            '935',
            '936',
            '945',
            '952',
            '953',
            '954',
            '955',
            '956',
            '957',
            '958',
            '959',
            '965',
            '966',
            '967',
            '975',
            '976',
            '977',
            '978',
            '979',
            '995',
            '996',
            '997',
            '817',
        ];

        const prefix = phone.substring(0, 3);
        return globeTMPrefixes.includes(prefix);
    };

    const isResidentFormValid = () => {
        return (
            data.first_name.trim() !== '' &&
            data.last_name.trim() !== '' &&
            data.place_of_birth.trim() !== '' &&
            data.date_of_birth !== '' &&
            parseInt(data.age) >= 13 &&
            data.sex !== '' &&
            data.civil_status.trim() !== '' &&
            data.citizenship.trim() !== '' &&
            data.occupation.trim() !== '' &&
            data.purok_id !== '' &&
            data.email.trim() !== '' &&
            validatePhone(data.contact_number) &&
            validateGlobeTMPhone(data.contact_number) &&
            data.valid_id !== null &&
            validatePassword(data.password) &&
            data.password === data.password_confirmation
        );
    };

    const isAgencyFormValid = () => {
        return (
            data.agency_name.trim() !== '' &&
            data.representative_first_name.trim() !== '' &&
            data.representative_last_name.trim() !== '' &&
            data.email.trim() !== '' &&
            validatePhone(data.agency_contact_number) &&
            validateGlobeTMPhone(data.agency_contact_number) &&
            data.agency_valid_id !== null &&
            validatePassword(data.password) &&
            data.password === data.password_confirmation
        );
    };

    const isFormValid = () => {
        if (data.role === 'resident') {
            return isResidentFormValid();
        } else if (data.role === 'partner_agency') {
            return isAgencyFormValid();
        }
        return false;
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
                            {/* Registration Type Selection or Back Button */}
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
                                            <p className="text-sm text-gray-500">
                                                {registrationType === 'resident'
                                                    ? 'Complete your community member registration'
                                                    : 'Complete your organization registration'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleBackToSelection}
                                        className="flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                    >
                                        <span>← Back</span>
                                    </button>
                                </div>
                            )}

                            {/* Resident Registration Form */}
                            {registrationType === 'resident' && (
                                <div className="space-y-6">
                                    <div className="border-t pt-6">
                                        <h2 className="mb-4 text-xl font-semibold text-gray-800">Resident Information</h2>

                                        {/* Name Fields */}
                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="first_name">
                                                    First Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="first_name"
                                                    type="text"
                                                    placeholder="First name"
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value)}
                                                    className={errors.first_name ? 'border-red-300' : ''}
                                                />
                                                {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="middle_name">Middle Name</Label>
                                                <Input
                                                    id="middle_name"
                                                    type="text"
                                                    placeholder="Middle name"
                                                    value={data.middle_name}
                                                    onChange={(e) => setData('middle_name', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last_name">
                                                    Last Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="last_name"
                                                    type="text"
                                                    placeholder="Last name"
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                    className={errors.last_name ? 'border-red-300' : ''}
                                                />
                                                {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
                                            </div>
                                            <div className="space-y-2">
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
                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="place_of_birth">
                                                    Place of Birth <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="place_of_birth"
                                                    type="text"
                                                    placeholder="City, Province"
                                                    value={data.place_of_birth}
                                                    onChange={(e) => setData('place_of_birth', e.target.value)}
                                                    className={errors.place_of_birth ? 'border-red-300' : ''}
                                                />
                                                {errors.place_of_birth && <p className="text-sm text-red-500">{errors.place_of_birth}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="date_of_birth">
                                                    Date of Birth <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="date_of_birth"
                                                    type="date"
                                                    value={data.date_of_birth}
                                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                                    className={errors.date_of_birth ? 'border-red-300' : ''}
                                                />
                                                {errors.date_of_birth && <p className="text-sm text-red-500">{errors.date_of_birth}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="age">
                                                    Age <span className="text-red-500">*</span>
                                                </Label>
                                                <Input id="age" type="number" placeholder="Age" value={data.age} readOnly className="bg-gray-50" />
                                                {parseInt(data.age) < 13 && data.age !== '' && (
                                                    <p className="text-sm text-red-500">Must be at least 13 years old</p>
                                                )}
                                                {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                                            </div>
                                        </div>

                                        {/* Personal Information */}
                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="sex">
                                                    Sex <span className="text-red-500">*</span>
                                                </Label>
                                                <Select value={data.sex} onValueChange={(value) => setData('sex', value)}>
                                                    <SelectTrigger className={errors.sex ? 'border-red-300' : ''}>
                                                        <SelectValue placeholder="Select sex" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Male">Male</SelectItem>
                                                        <SelectItem value="Female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.sex && <p className="text-sm text-red-500">{errors.sex}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="civil_status">
                                                    Civil Status <span className="text-red-500">*</span>
                                                </Label>
                                                <Select value={data.civil_status} onValueChange={(value) => setData('civil_status', value)}>
                                                    <SelectTrigger className={errors.civil_status ? 'border-red-300' : ''}>
                                                        <SelectValue placeholder="Select status" />
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
                                            <div className="space-y-2">
                                                <Label htmlFor="citizenship">
                                                    Citizenship <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="citizenship"
                                                    type="text"
                                                    placeholder="e.g., Filipino"
                                                    value={data.citizenship}
                                                    onChange={(e) => setData('citizenship', e.target.value)}
                                                    className={errors.citizenship ? 'border-red-300' : ''}
                                                />
                                                {errors.citizenship && <p className="text-sm text-red-500">{errors.citizenship}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="occupation">
                                                    Occupation <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="occupation"
                                                    type="text"
                                                    placeholder="Your occupation"
                                                    value={data.occupation}
                                                    onChange={(e) => setData('occupation', e.target.value)}
                                                    className={errors.occupation ? 'border-red-300' : ''}
                                                />
                                                {errors.occupation && <p className="text-sm text-red-500">{errors.occupation}</p>}
                                            </div>
                                        </div>

                                        {/* Special Notes */}
                                        <div className="mb-4">
                                            <Label htmlFor="special_notes">Special Notes</Label>
                                            <p className="mb-2 text-sm text-gray-500">
                                                Indicate if: Labor/Employed, Unemployed, PWD, Solo Parent, Out of School Youth (OSY), Out of School
                                                Children (OSC), and/or IP
                                            </p>
                                            <Textarea
                                                id="special_notes"
                                                placeholder="Please specify any applicable categories..."
                                                value={data.special_notes}
                                                onChange={(e) => setData('special_notes', e.target.value)}
                                                rows={3}
                                            />
                                        </div>

                                        {/* Location and Contact */}
                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="purok_id">
                                                    Purok <span className="text-red-500">*</span>
                                                </Label>
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
                                            <div className="space-y-2">
                                                <Label htmlFor="contact_number">
                                                    Contact Number <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="contact_number"
                                                    type="text"
                                                    placeholder="+63 9XX XXX XXXX"
                                                    value={
                                                        data.contact_number && data.contact_number.length > 0
                                                            ? `+63 ${data.contact_number.length >= 3 ? data.contact_number.slice(0, 3) : data.contact_number}${data.contact_number.length >= 6 ? ' ' + data.contact_number.slice(3, 6) : data.contact_number.length > 3 ? ' ' + data.contact_number.slice(3) : ''}${data.contact_number.length >= 9 ? ' ' + data.contact_number.slice(6) : data.contact_number.length > 6 ? ' ' + data.contact_number.slice(6) : ''}`
                                                            : '+63 9'
                                                    }
                                                    onChange={(e) => {
                                                        // Extract only digits from input
                                                        const input = e.target.value.replace(/\D/g, '');

                                                        // Remove the "639" prefix if user somehow types it
                                                        let cleanInput = input;
                                                        if (input.startsWith('639')) {
                                                            cleanInput = input.substring(3);
                                                        }

                                                        // Always ensure it starts with 9 and limit to 9 digits total
                                                        if (cleanInput.length === 0) {
                                                            setData('contact_number', '');
                                                        } else if (cleanInput.startsWith('9') && cleanInput.length <= 9) {
                                                            setData('contact_number', cleanInput);
                                                        } else if (!cleanInput.startsWith('9') && cleanInput.length <= 8) {
                                                            // If user types digits without 9, prepend 9
                                                            setData('contact_number', '9' + cleanInput);
                                                        }
                                                    }}
                                                    className={errors.contact_number ? 'border-red-300' : ''}
                                                    maxLength={17}
                                                />
                                                <p className="text-xs text-gray-500">Enter 9 digits (e.g., 123456789)</p>
                                                {data.contact_number && !validatePhone(data.contact_number) && (
                                                    <p className="text-sm text-red-500">Please enter exactly 9 digits</p>
                                                )}
                                                {data.contact_number &&
                                                    validatePhone(data.contact_number) &&
                                                    !validateGlobeTMPhone(data.contact_number) && (
                                                        <p className="text-sm text-red-500">Only Globe and TM numbers are accepted</p>
                                                    )}
                                                {errors.contact_number && <p className="text-sm text-red-500">{errors.contact_number}</p>}
                                            </div>
                                        </div>

                                        {/* Valid ID Upload */}
                                        <div className="mb-4">
                                            <Label htmlFor="valid_id">
                                                Submit Valid ID <span className="text-red-500">*</span>
                                            </Label>
                                            <p className="mb-2 text-sm text-gray-500">
                                                Upload a government-issued ID (National ID, Voter's ID, Driver's License). Max 5MB.
                                            </p>
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
                                </div>
                            )}

                            {/* Partner Agency Registration Form */}
                            {registrationType === 'partner_agency' && (
                                <div className="space-y-6">
                                    <div className="border-t pt-6">
                                        <h2 className="mb-4 text-xl font-semibold text-gray-800">Partner Agency Information</h2>

                                        {/* Agency Information */}
                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="agency_name">
                                                    Agency Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="agency_name"
                                                    type="text"
                                                    placeholder="e.g., BFP, DICT, BJMP"
                                                    value={data.agency_name}
                                                    onChange={(e) => setData('agency_name', e.target.value)}
                                                    className={errors.agency_name ? 'border-red-300' : ''}
                                                />
                                                {errors.agency_name && <p className="text-sm text-red-500">{errors.agency_name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="agency_contact_number">
                                                    Agency Contact Number <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="agency_contact_number"
                                                    type="text"
                                                    placeholder="+63 9XX XXX XXXX"
                                                    value={
                                                        data.agency_contact_number && data.agency_contact_number.length > 0
                                                            ? `+63 ${data.agency_contact_number.length >= 3 ? data.agency_contact_number.slice(0, 3) : data.agency_contact_number}${data.agency_contact_number.length >= 6 ? ' ' + data.agency_contact_number.slice(3, 6) : data.agency_contact_number.length > 3 ? ' ' + data.agency_contact_number.slice(3) : ''}${data.agency_contact_number.length >= 9 ? ' ' + data.agency_contact_number.slice(6) : data.agency_contact_number.length > 6 ? ' ' + data.agency_contact_number.slice(6) : ''}`
                                                            : '+63 9'
                                                    }
                                                    onChange={(e) => {
                                                        // Extract only digits from input
                                                        const input = e.target.value.replace(/\D/g, '');

                                                        // Remove the "639" prefix if user somehow types it
                                                        let cleanInput = input;
                                                        if (input.startsWith('639')) {
                                                            cleanInput = input.substring(3);
                                                        }

                                                        // Always ensure it starts with 9 and limit to 9 digits total
                                                        if (cleanInput.length === 0) {
                                                            setData('agency_contact_number', '');
                                                        } else if (cleanInput.startsWith('9') && cleanInput.length <= 9) {
                                                            setData('agency_contact_number', cleanInput);
                                                        } else if (!cleanInput.startsWith('9') && cleanInput.length <= 8) {
                                                            // If user types digits without 9, prepend 9
                                                            setData('agency_contact_number', '9' + cleanInput);
                                                        }
                                                    }}
                                                    className={errors.agency_contact_number ? 'border-red-300' : ''}
                                                    maxLength={17}
                                                />
                                                <p className="text-xs text-gray-500">Enter 9 digits (e.g., 123456789)</p>
                                                {data.agency_contact_number && !validatePhone(data.agency_contact_number) && (
                                                    <p className="text-sm text-red-500">Please enter exactly 9 digits</p>
                                                )}
                                                {data.agency_contact_number &&
                                                    validatePhone(data.agency_contact_number) &&
                                                    !validateGlobeTMPhone(data.agency_contact_number) && (
                                                        <p className="text-sm text-red-500">Only Globe and TM numbers are accepted</p>
                                                    )}
                                                {errors.agency_contact_number && (
                                                    <p className="text-sm text-red-500">{errors.agency_contact_number}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Representative Information */}
                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="representative_first_name">
                                                    Representative First Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="representative_first_name"
                                                    type="text"
                                                    placeholder="First name"
                                                    value={data.representative_first_name}
                                                    onChange={(e) => setData('representative_first_name', e.target.value)}
                                                    className={errors.representative_first_name ? 'border-red-300' : ''}
                                                />
                                                {errors.representative_first_name && (
                                                    <p className="text-sm text-red-500">{errors.representative_first_name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="representative_last_name">
                                                    Representative Last Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="representative_last_name"
                                                    type="text"
                                                    placeholder="Last name"
                                                    value={data.representative_last_name}
                                                    onChange={(e) => setData('representative_last_name', e.target.value)}
                                                    className={errors.representative_last_name ? 'border-red-300' : ''}
                                                />
                                                {errors.representative_last_name && (
                                                    <p className="text-sm text-red-500">{errors.representative_last_name}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Agency Address */}
                                        <div className="mb-4">
                                            <Label htmlFor="agency_address">Agency Address (Optional)</Label>
                                            <Textarea
                                                id="agency_address"
                                                placeholder="Full agency address"
                                                value={data.agency_address}
                                                onChange={(e) => setData('agency_address', e.target.value)}
                                                rows={2}
                                            />
                                        </div>

                                        {/* Valid ID/Endorsement Upload */}
                                        <div className="mb-4">
                                            <Label htmlFor="agency_valid_id">
                                                Upload Valid ID or Official Agency Endorsement <span className="text-red-500">*</span>
                                            </Label>
                                            <p className="mb-2 text-sm text-gray-500">
                                                Upload representative's valid ID OR official agency endorsement/accreditation file. Max 5MB.
                                            </p>
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
                                </div>
                            )}

                            {/* Common Fields - Email and Password */}
                            {registrationType && (
                                <div className="space-y-6">
                                    <div className="border-t pt-6">
                                        <h2 className="mb-4 text-xl font-semibold text-gray-800">Account Credentials</h2>

                                        {/* Email */}
                                        <div className="mb-4">
                                            <Label htmlFor="email">
                                                Email Address <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your.email@example.com"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={errors.email ? 'border-red-300' : ''}
                                            />
                                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                        </div>

                                        {/* Password Policy Info */}
                                        <div className="mb-4 rounded-lg bg-blue-50 p-4">
                                            <h3 className="mb-2 font-semibold text-blue-800">Password Requirements:</h3>
                                            <ul className="space-y-1 text-sm text-blue-700">
                                                <li>• 8-12 characters long</li>
                                                <li>• At least 1 uppercase letter (A-Z)</li>
                                                <li>• At least 1 lowercase letter (a-z)</li>
                                                <li>• At least 1 number (0-9)</li>
                                                <li>• At least 1 special character (!@#$%^&*)</li>
                                            </ul>
                                        </div>

                                        {/* Password Fields */}
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="password">
                                                    Password <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Create a strong password"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
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
                                                {data.password && !validatePassword(data.password) && (
                                                    <p className="text-sm text-red-500">Password does not meet requirements</p>
                                                )}
                                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">
                                                    Confirm Password <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password_confirmation"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        placeholder="Confirm your password"
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
                                                {data.password_confirmation && data.password !== data.password_confirmation && (
                                                    <p className="text-sm text-red-500">Passwords do not match</p>
                                                )}
                                                {errors.password_confirmation && (
                                                    <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="h-12 w-full bg-blue-600 text-lg font-medium hover:bg-blue-700"
                                        disabled={processing || !isFormValid()}
                                    >
                                        {processing ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                </div>
                            )}
                        </form>

                        {/* Login Link */}
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
