import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Partner/Header';
import Sidebar from '@/pages/Partner/Sidebar';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, MapPin, Plus, Users } from 'lucide-react';
import { useState } from 'react';

interface Purok {
    id: number;
    name: string;
}

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date?: string;
    status: 'pending' | 'approved' | 'declined';
    has_certificate: boolean;
    confirmed_attendees_count: number;
    purok?: Purok;
    created_at: string;
}

interface EventsProps {
    events: Event[];
    puroks: Purok[];
}

export default function Events({ events, puroks }: EventsProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        purok_id: '',
        has_certificate: false,
        target_all_residents: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Transform the data before submission
        const transformedData = {
            ...data,
            purok_id: data.purok_id === '' ? null : data.purok_id,
            target_all_residents: data.purok_id === '' || !data.purok_id,
        };

        // Use router.post with transformed data
        router.post(route('partner.events.create'), transformedData, {
            onSuccess: () => {
                reset();
                setIsCreateDialogOpen(false);
            },
            onError: (errors) => {
                console.log('Event creation errors:', errors);
            },
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Head title="Events Management" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="partner.events" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="partner.events" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Partner Agency" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
                                <p className="text-gray-600">Create and manage your event requests</p>
                            </div>

                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Event Request
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Create New Event</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Event Title</Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="Enter event title"
                                                className={errors.title ? 'border-red-500' : ''}
                                            />
                                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="start_date">Start Date</Label>
                                            <Input
                                                id="start_date"
                                                type="datetime-local"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                className={errors.start_date ? 'border-red-500' : ''}
                                            />
                                            {errors.start_date && <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="end_date">End Date (Optional)</Label>
                                            <Input
                                                id="end_date"
                                                type="datetime-local"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                                className={errors.end_date ? 'border-red-500' : ''}
                                            />
                                            {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="purok_id">Target Purok</Label>
                                            <Select value={data.purok_id} onValueChange={(value) => setData('purok_id', value)}>
                                                <SelectTrigger className={errors.purok_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a specific purok or leave blank for all residents" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {puroks.map((purok) => (
                                                        <SelectItem key={purok.id} value={purok.id.toString()}>
                                                            {purok.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.purok_id && <p className="mt-1 text-sm text-red-500">{errors.purok_id}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Event description and objectives"
                                                className={errors.description ? 'border-red-500' : ''}
                                            />
                                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="has_certificate"
                                                checked={data.has_certificate}
                                                onCheckedChange={(checked) => setData('has_certificate', !!checked)}
                                            />
                                            <Label htmlFor="has_certificate" className="text-sm">
                                                This event will have certificates
                                            </Label>
                                        </div>

                                        <Button type="submit" disabled={processing} className="w-full">
                                            {processing ? 'Creating...' : 'Create Event'}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid gap-4 md:gap-6">
                            {events.length > 0 ? (
                                events.map((event) => (
                                    <Card key={event.id} className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <CardTitle className="text-lg">{event.title}</CardTitle>
                                                <div className="flex gap-2">
                                                    <Badge className={getStatusColor(event.status)}>
                                                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                    </Badge>
                                                    {event.has_certificate && <Badge variant="outline">Certificate</Badge>}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <p className="text-gray-600">{event.description}</p>

                                            <div className="grid grid-cols-1 gap-4 text-sm text-gray-500 sm:grid-cols-2 lg:grid-cols-3">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(event.start_date).toLocaleDateString()}
                                                    {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString()}`}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.purok ? event.purok.name : 'All Residents'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {event.confirmed_attendees_count} confirmed
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-500">Created: {new Date(event.created_at).toLocaleDateString()}</div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card className="py-12 text-center">
                                    <CardContent>
                                        <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="mb-2 text-lg font-medium text-gray-900">No events yet</h3>
                                        <p className="mb-4 text-gray-500">Start by creating your first event for the community.</p>
                                        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Create First Event
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
