import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, CheckCircle, ChevronLeft, ChevronRight, MessageSquare, Search, User, XCircle } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Event {
    id: number;
    title: string;
    start_date: string;
    end_date?: string;
    description: string;
}

interface Feedback {
    id: number;
    event_id: number;
    user_id: number;
    comments: string;
    created_at: string;
    updated_at: string;
    event: Event;
    user: User;
}

interface PaginatedFeedback {
    data: Feedback[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    feedbacks: PaginatedFeedback;
    className?: string;
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Feedback({ feedbacks, className }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (search: string) => {
        router.get(
            route('secretary.feedback'),
            {
                search: search || undefined,
                page: undefined, // Reset to first page on search
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            route('secretary.feedback'),
            {
                page,
                search: searchTerm || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const truncateText = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <>
            <Head title="Feedback Review" />

            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="secretary.feedback" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="secretary.feedback" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${className || ''}`}>
                        <div className="mx-auto max-w-7xl space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Feedback Review</h1>
                                <p className="mt-2 text-gray-600">Review and manage feedback submitted by residents for events</p>
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

                            {/* Stats and Search */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                                <Card className="lg:col-span-1">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-600">Total Feedback</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-gray-900">{feedbacks.total}</div>
                                        <p className="text-xs text-gray-500">All time submissions</p>
                                    </CardContent>
                                </Card>

                                <Card className="lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Search className="h-5 w-5" />
                                            Search Feedback
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <Input
                                                    type="text"
                                                    placeholder="Search by event name, user name, or comments..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSearch(searchTerm);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <Button onClick={() => handleSearch(searchTerm)}>Search</Button>
                                            {searchTerm && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        handleSearch('');
                                                    }}
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Feedback List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        Feedback Submissions
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Showing {feedbacks.from || 0} to {feedbacks.to || 0} of {feedbacks.total} feedback submissions
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    {feedbacks.data.length > 0 ? (
                                        <div className="space-y-4">
                                            {feedbacks.data.map((feedback) => (
                                                <Card key={feedback.id} className="border border-gray-200 transition-shadow hover:shadow-md">
                                                    <CardContent className="p-6">
                                                        <div className="space-y-4">
                                                            {/* Header */}
                                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                                <div className="space-y-1">
                                                                    <h3 className="text-lg font-semibold text-gray-900">{feedback.event.title}</h3>
                                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="h-4 w-4" />
                                                                            <span>{formatDate(feedback.event.start_date)}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <User className="h-4 w-4" />
                                                                            <span>{feedback.user.name}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <Badge className="bg-blue-100 text-blue-800">{feedback.user.role}</Badge>
                                                                    <span className="text-xs text-gray-500">
                                                                        Submitted {formatDateTime(feedback.created_at)}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Event Description */}
                                                            {feedback.event.description && (
                                                                <div className="rounded-md bg-gray-50 p-3">
                                                                    <p className="mb-1 text-sm font-medium text-gray-700">Event Description:</p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {truncateText(feedback.event.description, 150)}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Feedback Content */}
                                                            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                                                                <div className="flex items-start gap-2">
                                                                    <MessageSquare className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                                                                    <div className="flex-1">
                                                                        <p className="mb-2 text-sm font-medium text-amber-800">
                                                                            Participant Feedback:
                                                                        </p>
                                                                        <p className="text-sm leading-relaxed text-amber-700">{feedback.comments}</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* User Contact Info */}
                                                            <div className="border-t pt-3">
                                                                <p className="text-xs text-gray-500">Contact: {feedback.user.email}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-medium text-gray-900">No Feedback Found</h3>
                                            <p className="text-gray-600">
                                                {searchTerm
                                                    ? 'No feedback matches your search criteria.'
                                                    : 'No feedback has been submitted yet. Check back later for participant responses.'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {feedbacks.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t pt-6">
                                            <div className="text-sm text-gray-600">
                                                Showing {feedbacks.from || 0} to {feedbacks.to || 0} of {feedbacks.total} results
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(feedbacks.current_page - 1)}
                                                    disabled={feedbacks.current_page === 1}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                    Previous
                                                </Button>

                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: Math.min(5, feedbacks.last_page) }, (_, i) => {
                                                        const page = i + 1;
                                                        return (
                                                            <Button
                                                                key={page}
                                                                variant={feedbacks.current_page === page ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => handlePageChange(page)}
                                                                className="h-8 w-10"
                                                            >
                                                                {page}
                                                            </Button>
                                                        );
                                                    })}

                                                    {feedbacks.last_page > 5 && (
                                                        <>
                                                            <span className="px-2 text-gray-500">...</span>
                                                            <Button
                                                                variant={feedbacks.current_page === feedbacks.last_page ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => handlePageChange(feedbacks.last_page)}
                                                                className="h-8 w-10"
                                                            >
                                                                {feedbacks.last_page}
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(feedbacks.current_page + 1)}
                                                    disabled={feedbacks.current_page === feedbacks.last_page}
                                                >
                                                    Next
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
