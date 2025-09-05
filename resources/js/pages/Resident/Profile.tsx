import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail, Phone, Save, User } from 'lucide-react';
import { useState } from 'react';

interface UserData {
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
}

interface Props {
    user: UserData;
}

interface PageProps extends Props {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Profile({ user }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile update form
    const {
        data: profileData,
        setData: setProfileData,
        put: updateProfile,
        processing: profileProcessing,
        errors: profileErrors,
        reset: resetProfile,
    } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
    });

    // Password change form
    const {
        data: passwordData,
        setData: setPasswordData,
        post: changePassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile(route('resident.profile.update'), {
            onSuccess: () => {
                // Profile updated successfully
            },
        });
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        changePassword(route('resident.profile.password'), {
            onSuccess: () => {
                resetPassword();
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            },
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending':
            case 'declined':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^639\d{9}$/;
        return phoneRegex.test(phone);
    };

    return (
        <>
            <Head title="My Profile" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="resident.profile" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="resident.profile" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName={user.name} onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="mx-auto max-w-4xl space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                                <p className="text-gray-600">Manage your account information and security settings.</p>
                            </div>

                            {/* Flash Messages */}
                            {flash?.success && (
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                                </Alert>
                            )}

                            {flash?.error && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">{flash.error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Profile Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Profile Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                                            {/* Full Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name">
                                                    Full Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData('name', e.target.value)}
                                                    className={profileErrors.name ? 'border-red-300' : ''}
                                                    required
                                                />
                                                {profileErrors.name && <p className="text-sm text-red-500">{profileErrors.name}</p>}
                                            </div>

                                            {/* Email Address */}
                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Email Address <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData('email', e.target.value)}
                                                    className={profileErrors.email ? 'border-red-300' : ''}
                                                    required
                                                />
                                                {profileErrors.email && <p className="text-sm text-red-500">{profileErrors.email}</p>}
                                            </div>

                                            {/* Phone Number */}
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="639XXXXXXXXX"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData('phone', e.target.value)}
                                                    className={profileErrors.phone ? 'border-red-300' : ''}
                                                    required
                                                />
                                                {!validatePhone(profileData.phone) && profileData.phone.length > 0 && (
                                                    <p className="text-sm text-amber-600">Phone number should start with 639 and be 12 digits long</p>
                                                )}
                                                {profileErrors.phone && <p className="text-sm text-red-500">{profileErrors.phone}</p>}
                                            </div>

                                            {/* Account Status */}
                                            <div className="space-y-2">
                                                <Label>Account Status</Label>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusColor(user.status)}>
                                                        {getStatusIcon(user.status)}
                                                        <span className="ml-1">{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
                                                    </Badge>
                                                </div>
                                            </div>

                                            <Button type="submit" disabled={profileProcessing} className="w-full gap-2">
                                                <Save className="h-4 w-4" />
                                                {profileProcessing ? 'Updating...' : 'Update Profile'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* Security Settings */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lock className="h-5 w-5" />
                                            Security Settings
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            {/* Current Password */}
                                            <div className="space-y-2">
                                                <Label htmlFor="current_password">
                                                    Current Password <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="current_password"
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        value={passwordData.current_password}
                                                        onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                        className={passwordErrors.current_password ? 'border-red-300 pr-10' : 'pr-10'}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {passwordErrors.current_password && (
                                                    <p className="text-sm text-red-500">{passwordErrors.current_password}</p>
                                                )}
                                            </div>

                                            {/* New Password */}
                                            <div className="space-y-2">
                                                <Label htmlFor="new_password">
                                                    New Password <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="new_password"
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={passwordData.password}
                                                        onChange={(e) => setPasswordData('password', e.target.value)}
                                                        className={passwordErrors.password ? 'border-red-300 pr-10' : 'pr-10'}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {passwordData.password.length > 0 && passwordData.password.length < 6 && (
                                                    <p className="text-sm text-amber-600">Password must be at least 6 characters long</p>
                                                )}
                                                {passwordErrors.password && <p className="text-sm text-red-500">{passwordErrors.password}</p>}
                                            </div>

                                            {/* Confirm New Password */}
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm_password">
                                                    Confirm New Password <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirm_password"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={passwordData.password_confirmation}
                                                        onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                        className={passwordErrors.password_confirmation ? 'border-red-300 pr-10' : 'pr-10'}
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
                                                {passwordData.password !== passwordData.password_confirmation &&
                                                    passwordData.password_confirmation.length > 0 && (
                                                        <p className="text-sm text-red-500">Passwords do not match</p>
                                                    )}
                                                {passwordErrors.password_confirmation && (
                                                    <p className="text-sm text-red-500">{passwordErrors.password_confirmation}</p>
                                                )}
                                            </div>

                                            <Button type="submit" disabled={passwordProcessing} className="w-full gap-2">
                                                <Lock className="h-4 w-4" />
                                                {passwordProcessing ? 'Changing Password...' : 'Change Password'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Account Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                            <Mail className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Email</p>
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                            <Phone className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Phone</p>
                                                <p className="text-sm text-gray-600">{user.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                            <User className="h-5 w-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Role</p>
                                                <p className="text-sm text-gray-600 capitalize">{user.role.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
