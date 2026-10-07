'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword, updateProfile } from '@/lib/demo/actions';
import { useCurrentUser } from '@/lib/demo/store';
import { useForm } from '@/lib/use-form';
import { partnerProfileProps } from '@/lib/views/partner';
import { CheckCircle, Eye, EyeOff, Lock, Mail, Phone, Save, User } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function PartnerProfileView() {
    const currentUser = useCurrentUser()!;
    const { user } = useMemo(() => partnerProfileProps(currentUser), [currentUser]);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile update form
    const {
        data: profileData,
        setData: setProfileData,
        submit: submitProfile,
        processing: profileProcessing,
        errors: profileErrors,
    } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
    });

    // Password change form
    const {
        data: passwordData,
        setData: setPasswordData,
        submit: submitPassword,
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
        submitProfile(() => updateProfile(profileData));
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        submitPassword(() => changePassword(passwordData), {
            onSuccess: () => {
                resetPassword();
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            approved: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            declined: 'bg-red-100 text-red-800',
        };
        return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="mt-2 text-gray-600">Manage your account information and security settings</p>
            </div>

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
                                    placeholder="09XXXXXXXXX"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData('phone', e.target.value)}
                                    className={profileErrors.phone ? 'border-red-300' : ''}
                                    required
                                />
                                {profileErrors.phone && <p className="text-sm text-red-500">{profileErrors.phone}</p>}
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" disabled={profileProcessing} className="w-full">
                                <Save className="mr-2 h-4 w-4" />
                                {profileProcessing ? 'Updating Profile...' : 'Update Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Change Password
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
                                {passwordErrors.current_password && <p className="text-sm text-red-500">{passwordErrors.current_password}</p>}
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    New Password <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
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
                                {passwordErrors.password && <p className="text-sm text-red-500">{passwordErrors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm New Password <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
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
                                {passwordErrors.password_confirmation && (
                                    <p className="text-sm text-red-500">{passwordErrors.password_confirmation}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" variant="outline" disabled={passwordProcessing} className="w-full">
                                <Lock className="mr-2 h-4 w-4" />
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
                    <div className="grid gap-4 md:grid-cols-4">
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
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                            <CheckCircle className="h-5 w-5 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Status</p>
                                <Badge className={getStatusBadge(user.status)}>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
