import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Head, router } from '@inertiajs/react';
import { Bell, CheckCircle, Edit, Plus, Trash2, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface Purok {
    id: number;
    name: string;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    target_puroks: number[] | null;
    target_all_puroks: boolean;
    created_by: string;
    created_at: string;
}

interface Props {
    announcements: Announcement[];
    puroks: Purok[];
    flash?: {
        success?: string;
        error?: string;
    };
}

// Move AnnouncementForm outside the main component
const AnnouncementForm = ({
    onSubmit,
    formData,
    setFormData,
    errors,
    puroks,
    editingAnnouncement,
    onCancel,
}: {
    onSubmit: (e: React.FormEvent) => void;
    formData: {
        title: string;
        content: string;
        target_puroks: number[];
        target_all_puroks: boolean;
    };
    setFormData: React.Dispatch<
        React.SetStateAction<{
            title: string;
            content: string;
            target_puroks: number[];
            target_all_puroks: boolean;
        }>
    >;
    errors: any;
    puroks: Purok[];
    editingAnnouncement: Announcement | null;
    onCancel: () => void;
}) => {
    const handlePurokToggle = (purokId: number) => {
        if (formData.target_all_puroks) return;

        setFormData((prev) => {
            const newTargetPuroks = prev.target_puroks.includes(purokId)
                ? prev.target_puroks.filter((id) => id !== purokId)
                : [...prev.target_puroks, purokId];

            // Limit to 3 puroks maximum
            if (newTargetPuroks.length > 3) {
                return prev;
            }

            return { ...prev, target_puroks: newTargetPuroks };
        });
    };

    const handleAllPuroksToggle = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            target_all_puroks: checked,
            target_puroks: checked ? [] : prev.target_puroks,
        }));
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter announcement title"
                    className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter announcement content"
                    rows={4}
                    className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
            </div>

            <div>
                <Label>Target Audience</Label>
                <div className="mt-2 space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="target_all_puroks" checked={formData.target_all_puroks} onCheckedChange={handleAllPuroksToggle} />
                        <Label htmlFor="target_all_puroks">All Puroks</Label>
                    </div>

                    {!formData.target_all_puroks && (
                        <div>
                            <p className="mb-2 text-sm text-gray-600">Select specific puroks (up to 3):</p>
                            <div className="grid grid-cols-2 gap-2">
                                {puroks.map((purok) => (
                                    <div key={purok.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`purok_${purok.id}`}
                                            checked={formData.target_puroks.includes(purok.id)}
                                            onCheckedChange={() => handlePurokToggle(purok.id)}
                                            disabled={!formData.target_puroks.includes(purok.id) && formData.target_puroks.length >= 3}
                                        />
                                        <Label htmlFor={`purok_${purok.id}`}>{purok.name}</Label>
                                    </div>
                                ))}
                            </div>
                            {formData.target_puroks.length >= 3 && <p className="mt-1 text-sm text-amber-600">Maximum of 3 puroks can be selected</p>}
                        </div>
                    )}
                </div>
                {errors.target_puroks && <p className="mt-1 text-sm text-red-500">{errors.target_puroks}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">{editingAnnouncement ? 'Update' : 'Create'} Announcement</Button>
            </div>
        </form>
    );
};

export default function Announcements({ announcements, puroks, flash }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        target_puroks: [] as number[],
        target_all_puroks: false,
    });
    const [errors, setErrors] = useState<any>({});

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            target_puroks: [],
            target_all_puroks: false,
        });
        setErrors({});
    };

    const handleCreateAnnouncement = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/secretary/announcements', formData, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetForm();
            },
            onError: (errors) => setErrors(errors),
        });
    };

    const handleEditAnnouncement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAnnouncement) return;

        router.put(`/secretary/announcements/${editingAnnouncement.id}`, formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingAnnouncement(null);
                resetForm();
            },
            onError: (errors) => setErrors(errors),
        });
    };

    const handleDeleteAnnouncement = (id: number) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            router.delete(`/secretary/announcements/${id}`);
        }
    };

    const openEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            target_puroks: announcement.target_puroks || [],
            target_all_puroks: announcement.target_all_puroks,
        });
        setIsEditModalOpen(true);
    };

    const getTargetDisplay = (announcement: Announcement) => {
        if (announcement.target_all_puroks) {
            return <Badge variant="secondary">All Puroks</Badge>;
        }

        if (announcement.target_puroks && announcement.target_puroks.length > 0) {
            const targetPurokNames = puroks.filter((purok) => announcement.target_puroks?.includes(purok.id)).map((purok) => purok.name);

            return (
                <div className="flex flex-wrap gap-1">
                    {targetPurokNames.map((name) => (
                        <Badge key={name} variant="outline">
                            {name}
                        </Badge>
                    ))}
                </div>
            );
        }

        return <Badge variant="destructive">No Target</Badge>;
    };

    return (
        <>
            <Head title="Announcements - Secretary" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="secretary.announcements" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="secretary.announcements" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="mx-auto max-w-7xl space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
                                    <p className="mt-2 text-gray-600">Manage community announcements</p>
                                </div>
                                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => setIsCreateModalOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Announcement
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Create New Announcement</DialogTitle>
                                        </DialogHeader>
                                        <AnnouncementForm
                                            onSubmit={handleCreateAnnouncement}
                                            formData={formData}
                                            setFormData={setFormData}
                                            errors={errors}
                                            puroks={puroks}
                                            editingAnnouncement={editingAnnouncement}
                                            onCancel={() => {
                                                setIsCreateModalOpen(false);
                                                resetForm();
                                            }}
                                        />
                                    </DialogContent>
                                </Dialog>
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
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">{flash.error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Announcements Grid */}
                            <div className="grid gap-6">
                                {announcements.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <Bell className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-medium text-gray-900">No announcements yet</h3>
                                            <p className="mb-4 text-gray-500">Get started by creating your first announcement.</p>
                                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Announcement
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    announcements.map((announcement) => (
                                        <Card key={announcement.id}>
                                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-sm text-gray-500">
                                                            by {announcement.created_by} • {announcement.created_at}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => openEditModal(announcement)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="mb-3 whitespace-pre-wrap text-gray-700">{announcement.content}</p>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500">Target: </span>
                                                        {getTargetDisplay(announcement)}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>

                            {/* Edit Modal */}
                            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Edit Announcement</DialogTitle>
                                    </DialogHeader>
                                    <AnnouncementForm
                                        onSubmit={handleEditAnnouncement}
                                        formData={formData}
                                        setFormData={setFormData}
                                        errors={errors}
                                        puroks={puroks}
                                        editingAnnouncement={editingAnnouncement}
                                        onCancel={() => {
                                            setIsEditModalOpen(false);
                                            setEditingAnnouncement(null);
                                            resetForm();
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
