'use client';

import { StoredImage } from '@/components/shared/stored-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { approveEvent, declineEvent } from '@/lib/demo/actions';
import { useDb } from '@/lib/demo/store';
import { captainEventsProps } from '@/lib/views/captain';
import { AlertCircle, Award, Calendar, CheckCircle, Clock, MapPin, User } from 'lucide-react';
import { useMemo } from 'react';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getRoleColor = (role: string | null) => {
    switch (role) {
        case 'secretary':
            return 'bg-blue-100 text-blue-800';
        case 'partner_agency':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getRoleLabel = (role: string | null) => {
    switch (role) {
        case 'secretary':
            return 'Secretary';
        case 'partner_agency':
            return 'Partner Agency';
        default:
            return role ?? 'Unknown';
    }
};

export default function CaptainEventsView() {
    const db = useDb();
    const { pendingEvents } = useMemo(() => captainEventsProps(db), [db]);

    const handleEventAction = (eventId: number, action: 'approve' | 'decline') => {
        if (action === 'approve') approveEvent(eventId);
        else declineEvent(eventId);
    };

    return (
        <div>
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Event Approvals</h1>
                <p className="text-sm text-gray-600 sm:text-base">Review and approve community event requests</p>
            </div>

            {/* Events List */}
            {pendingEvents.length === 0 ? (
                <Card className="shadow-sm">
                    <CardContent className="p-8 text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
                        <p className="mt-2 text-gray-600">There are no pending events to review at this time.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4 md:space-y-6">
                    {pendingEvents.map((event) => (
                        <Card key={event.id} className="shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1 space-y-2">
                                        <CardTitle className="text-lg sm:text-xl">{event.title}</CardTitle>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:gap-4 sm:text-sm">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span>{getRoleLabel(event.creator_role)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="hidden sm:inline">{formatDate(event.start_date)}</span>
                                                <span className="sm:hidden">
                                                    {new Date(event.start_date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            {event.purok && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span>{event.purok.name}</span>
                                                </div>
                                            )}
                                            {event.has_certificate && (
                                                <div className="flex items-center gap-1">
                                                    <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline">Has Certificate</span>
                                                    <span className="sm:hidden">Cert</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0">
                                        <Badge className={`px-2 py-1 text-xs font-medium sm:px-3 sm:text-sm ${getRoleColor(event.creator_role)}`}>
                                            {getRoleLabel(event.creator_role)}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Event Image */}
                                {event.image_path && (
                                    <div className="mb-4">
                                        <StoredImage
                                            path={event.image_path}
                                            alt={event.title}
                                            className="h-32 w-full rounded-lg border object-cover sm:h-48"
                                            fallback={<div className="h-32 w-full rounded-lg border bg-gray-100 sm:h-48" />}
                                        />
                                    </div>
                                )}

                                {/* Event Description */}
                                <p className="text-sm text-gray-700 sm:text-base">{event.description}</p>

                                {/* Event Details Grid */}
                                <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2 sm:gap-3 sm:text-sm lg:grid-cols-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="truncate">{formatDate(event.start_date)}</span>
                                    </div>

                                    {event.end_date && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="truncate">Ends: {formatDate(event.end_date)}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="truncate">{event.creator?.name ?? 'Unknown'}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="truncate">{event.purok ? event.purok.name : 'All Residents'}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:gap-3">
                                    <Button
                                        onClick={() => handleEventAction(event.id, 'approve')}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
                                        size="sm"
                                    >
                                        <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="text-xs sm:text-sm">Approve Event</span>
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        onClick={() => handleEventAction(event.id, 'decline')}
                                        className="w-full sm:w-auto"
                                        size="sm"
                                    >
                                        <AlertCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="text-xs sm:text-sm">Decline Event</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
