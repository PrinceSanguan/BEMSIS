'use client';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createAnnouncement, deleteAnnouncement, updateAnnouncement } from '@/lib/demo/actions';
import { useDb } from '@/lib/demo/store';
import type { FormErrors, Purok } from '@/lib/types';
import { useForm } from '@/lib/use-form';
import { secretaryAnnouncementsProps, type SecretaryAnnouncement } from '@/lib/views/secretary-operations';
import { Bell, Edit, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type AnnouncementFormData = {
    title: string;
    content: string;
    target_puroks: number[];
    target_all_puroks: boolean;
};

const emptyForm: AnnouncementFormData = {
    title: '',
    content: '',
    target_puroks: [],
    target_all_puroks: false,
};

const AnnouncementForm = ({
    onSubmit,
    formData,
    setFormData,
    errors,
    puroks,
    editingAnnouncement,
    processing,
    onCancel,
}: {
    onSubmit: (e: React.FormEvent) => void;
    formData: AnnouncementFormData;
    setFormData: (update: (prev: AnnouncementFormData) => AnnouncementFormData) => void;
    errors: FormErrors;
    puroks: Purok[];
    editingAnnouncement: SecretaryAnnouncement | null;
    processing: boolean;
    onCancel: () => void;
}) => {
    const handlePurokToggle = (purokId: number) => {
        if (formData.target_all_puroks) return;

        setFormData((prev) => {
            const newTargetPuroks = prev.target_puroks.includes(purokId)
                ? prev.target_puroks.filter((id) => id !== purokId)
                : [...prev.target_puroks, purokId];

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
                        <Checkbox
                            id="target_all_puroks"
                            checked={formData.target_all_puroks}
                            onCheckedChange={(checked) => handleAllPuroksToggle(checked === true)}
                        />
                        <Label htmlFor="target_all_puroks">All Puroks</Label>
                    </div>

                    {!formData.target_all_puroks && (
                        <div>
                            <p className="mb-2 text-sm text-gray-600">Select specific puroks:</p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {puroks.map((purok) => (
                                    <div key={purok.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`purok_${purok.id}`}
                                            checked={formData.target_puroks.includes(purok.id)}
                                            onCheckedChange={() => handlePurokToggle(purok.id)}
                                        />
                                        <Label htmlFor={`purok_${purok.id}`}>{purok.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {errors.target_puroks && <p className="mt-1 text-sm text-red-500">{errors.target_puroks}</p>}
            </div>

            <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {editingAnnouncement ? 'Update' : 'Create'} Announcement
                </Button>
            </div>
        </form>
    );
};

export default function SecretaryAnnouncementsView() {
    const db = useDb();
    const { announcements, puroks } = useMemo(() => secretaryAnnouncementsProps(db), [db]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<SecretaryAnnouncement | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const { data: formData, setData: setFormData, errors, clearErrors, processing, submit } = useForm<AnnouncementFormData>(emptyForm);

    const resetForm = () => {
        setFormData(emptyForm);
        clearErrors();
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        resetForm();
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingAnnouncement(null);
        resetForm();
    };

    const handleCreateAnnouncement = (e: React.FormEvent) => {
        e.preventDefault();
        submit(() => createAnnouncement(formData), { onSuccess: closeCreateModal });
    };

    const handleEditAnnouncement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAnnouncement) return;

        submit(() => updateAnnouncement(editingAnnouncement.id, formData), { onSuccess: closeEditModal });
    };

    const openEditModal = (announcement: SecretaryAnnouncement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            target_puroks: announcement.target_puroks || [],
            target_all_puroks: announcement.target_all_puroks,
        });
        clearErrors();
        setIsEditModalOpen(true);
    };

    const getTargetDisplay = (announcement: SecretaryAnnouncement) => {
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
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
                    <p className="mt-2 text-gray-600">Manage community announcements</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={(open) => (open ? setIsCreateModalOpen(true) : closeCreateModal())}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl" aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Create New Announcement</DialogTitle>
                        </DialogHeader>
                        <AnnouncementForm
                            onSubmit={handleCreateAnnouncement}
                            formData={formData}
                            setFormData={setFormData}
                            errors={errors}
                            puroks={puroks}
                            editingAnnouncement={null}
                            processing={processing}
                            onCancel={closeCreateModal}
                        />
                    </DialogContent>
                </Dialog>
            </div>

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
                            <CardHeader className="flex flex-col space-y-3 pb-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                                <div className="flex-1">
                                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm text-gray-500">
                                            by {announcement.created_by} • {announcement.created_at}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <Button size="sm" variant="outline" onClick={() => openEditModal(announcement)} aria-label="Edit announcement">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setDeletingId(announcement.id)}
                                        className="text-red-600 hover:text-red-700"
                                        aria-label="Delete announcement"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-3 whitespace-pre-wrap text-gray-700">{announcement.content}</p>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <Dialog open={isEditModalOpen} onOpenChange={(open) => (open ? setIsEditModalOpen(true) : closeEditModal())}>
                <DialogContent className="max-w-2xl" aria-describedby={undefined}>
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
                        processing={processing}
                        onCancel={closeEditModal}
                    />
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deletingId !== null}
                onOpenChange={(open) => !open && setDeletingId(null)}
                title="Delete announcement?"
                description="Are you sure you want to delete this announcement?"
                confirmLabel="Delete"
                destructive
                onConfirm={() => {
                    if (deletingId !== null) deleteAnnouncement(deletingId);
                }}
            />
        </div>
    );
}
