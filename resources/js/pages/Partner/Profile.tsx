import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Partner/Header';
import Sidebar from '@/pages/Partner/Sidebar';
import { Head } from '@inertiajs/react';
import { Building, Lock, Save, User } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockProfile = {
    // Personal Info
    name: 'Maria Santos',
    email: 'maria.santos@redcross.org',
    phone: '09171234567',

    // Agency Info
    agencyName: 'Philippine Red Cross',
    agencyType: 'Non-Profit Organization',
    address: '123 Humanitarian Street, Makati City',
    description: 'Humanitarian organization providing emergency assistance, disaster relief, and preparedness education.',
    website: 'https://redcross.org.ph',
    contactPerson: 'Maria Santos',
    registrationNumber: 'NGO-2020-001',
};

export default function Profile() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profile, setProfile] = useState(mockProfile);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    const handleProfileUpdate = () => {
        alert('Profile updated successfully!');
    };

    const handlePasswordChange = () => {
        if (passwords.new !== passwords.confirm) {
            alert('New passwords do not match!');
            return;
        }
        alert('Password changed successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
    };

    return (
        <>
            <Head title="Profile Settings" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="partner.profile" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="partner.profile" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Partner Agency" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                            <p className="text-gray-600">Manage your account and agency information</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {/* Account Settings */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Account Settings
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            />
                                        </div>
                                        <Button onClick={handleProfileUpdate} className="w-full gap-2">
                                            <Save className="h-4 w-4" />
                                            Update Profile
                                        </Button>
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
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="current">Current Password</Label>
                                            <Input
                                                id="current"
                                                type="password"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="new">New Password</Label>
                                            <Input
                                                id="new"
                                                type="password"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="confirm">Confirm New Password</Label>
                                            <Input
                                                id="confirm"
                                                type="password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            />
                                        </div>
                                        <Button onClick={handlePasswordChange} variant="outline" className="w-full gap-2">
                                            <Lock className="h-4 w-4" />
                                            Change Password
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Agency Information */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            Agency Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="agencyName">Agency Name</Label>
                                            <Input
                                                id="agencyName"
                                                value={profile.agencyName}
                                                onChange={(e) => setProfile({ ...profile, agencyName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="agencyType">Agency Type</Label>
                                            <Input
                                                id="agencyType"
                                                value={profile.agencyType}
                                                onChange={(e) => setProfile({ ...profile, agencyType: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="registrationNumber">Registration Number</Label>
                                            <Input
                                                id="registrationNumber"
                                                value={profile.registrationNumber}
                                                onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="address">Address</Label>
                                            <Textarea
                                                id="address"
                                                value={profile.address}
                                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={profile.description}
                                                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="website">Website</Label>
                                            <Input
                                                id="website"
                                                value={profile.website}
                                                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contactPerson">Contact Person</Label>
                                            <Input
                                                id="contactPerson"
                                                value={profile.contactPerson}
                                                onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
                                            />
                                        </div>
                                        <Button onClick={handleProfileUpdate} className="w-full gap-2">
                                            <Save className="h-4 w-4" />
                                            Update Agency Info
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
