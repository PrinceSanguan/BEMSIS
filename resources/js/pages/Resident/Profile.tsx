import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head } from '@inertiajs/react';
import { Lock, MapPin, Save, User } from 'lucide-react';
import { useState } from 'react';

// Mock data
const PUROKS = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6', 'Purok 7', 'Purok 8', 'Purok 9', 'Purok 10'];

const mockProfile = {
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@email.com',
    phone: '09171234567',
    purok: 'Purok 1',
    address: '123 Main Street, Barangay Sample',
    emergencyContact: 'Maria Dela Cruz',
    emergencyPhone: '09187654321',
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
                    <Header userName="Juan Dela Cruz" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                            <p className="text-gray-600">Manage your account information</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {/* Personal Information */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Personal Information
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
                                        <div>
                                            <Label htmlFor="purok">Purok</Label>
                                            <Select
                                                value={profile.purok.toLowerCase().replace(' ', '_')}
                                                onValueChange={(value) => {
                                                    const purokName =
                                                        PUROKS.find((p) => p.toLowerCase().replace(' ', '_') === value) || profile.purok;
                                                    setProfile({ ...profile, purok: purokName });
                                                }}
                                            >
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
                                        </div>
                                        <div>
                                            <Label htmlFor="address">Address</Label>
                                            <Input
                                                id="address"
                                                value={profile.address}
                                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                            />
                                        </div>
                                        <Button onClick={handleProfileUpdate} className="w-full gap-2">
                                            <Save className="h-4 w-4" />
                                            Update Profile
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Security & Emergency Contact */}
                            <div className="space-y-6">
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

                                {/* Emergency Contact */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5" />
                                            Emergency Contact
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                                            <Input
                                                id="emergencyContact"
                                                value={profile.emergencyContact}
                                                onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                                            <Input
                                                id="emergencyPhone"
                                                value={profile.emergencyPhone}
                                                onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                                            />
                                        </div>
                                        <Button onClick={handleProfileUpdate} variant="outline" className="w-full gap-2">
                                            <Save className="h-4 w-4" />
                                            Update Emergency Contact
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
