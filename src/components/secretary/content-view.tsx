'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { route } from '@/lib/routes';
import { Award, BookOpen, Calendar, FileText, Info, Settings, Shield, Users } from 'lucide-react';
import Link from 'next/link';

const contentSections = [
    {
        title: 'User Management Guidelines',
        icon: Users,
        description: 'Best practices for reviewing and managing user registrations',
        content: [
            'Review user information carefully before approval',
            'Verify purok assignments for residents',
            'Check for duplicate registrations',
            'Ensure partner agencies provide valid credentials',
        ],
    },
    {
        title: 'Event Management Process',
        icon: Calendar,
        description: 'Step-by-step guide for creating and managing events',
        content: [
            'Events require captain approval before publication',
            'Specify target purok or select all residents',
            'Enable certificates for training/educational events',
            'Assign QR codes before event starts',
        ],
    },
    {
        title: 'Attendance Tracking',
        icon: Award,
        description: 'How to manage attendance and certificates',
        content: [
            'Scan QR codes during events to record attendance',
            'Generate attendance reports after events',
            'Assign certificates only to verified attendees',
            'Monitor attendance rates for improvement',
        ],
    },
    {
        title: 'System Responsibilities',
        icon: Shield,
        description: 'Key responsibilities as a Secretary',
        content: [
            'Approve or decline user registrations promptly',
            'Create community events with proper targeting',
            'Manage QR code assignments and scanning',
            'Review resident feedback and suggestions',
        ],
    },
];

const quickActions = [
    {
        title: 'View Pending Users',
        description: 'Review users waiting for approval',
        icon: Users,
        link: route('secretary.users'),
        color: 'bg-orange-50 border-orange-200 text-orange-800',
    },
    {
        title: 'Create New Event',
        description: 'Organize community activities',
        icon: Calendar,
        link: route('secretary.events'),
        color: 'bg-blue-50 border-blue-200 text-blue-800',
    },
    {
        title: 'Check Attendance',
        description: 'Monitor event participation',
        icon: Award,
        link: route('secretary.attendance'),
        color: 'bg-green-50 border-green-200 text-green-800',
    },
];

export default function SecretaryContentView() {
    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Content & Guidelines</h1>
                <p className="mt-2 text-gray-600">Resources and guidelines for secretary operations</p>
            </div>

            {/* Welcome Info */}
            <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    Welcome to the Secretary Dashboard! Here you&apos;ll find guidelines and best practices for managing community events and user
                    registrations.
                </AlertDescription>
            </Alert>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {quickActions.map((action, index) => {
                            const IconComponent = action.icon;
                            return (
                                <Link
                                    key={index}
                                    href={action.link}
                                    className={`rounded-lg border p-4 transition-colors hover:shadow-md ${action.color}`}
                                >
                                    <div className="mb-2 flex items-center gap-3">
                                        <IconComponent className="h-5 w-5" />
                                        <h3 className="font-semibold">{action.title}</h3>
                                    </div>
                                    <p className="text-sm opacity-80">{action.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Content Guidelines */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {contentSections.map((section, index) => {
                    const IconComponent = section.icon;
                    return (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IconComponent className="h-5 w-5" />
                                    {section.title}
                                </CardTitle>
                                <p className="text-sm text-gray-600">{section.description}</p>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {section.content.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                                            <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* System Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        System Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="mb-3 font-semibold text-gray-900">Role Permissions</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Approve/decline user registrations</li>
                                <li>• Create events (requires captain approval)</li>
                                <li>• Manage event attendance and QR codes</li>
                                <li>• Assign certificates to attendees</li>
                                <li>• Review resident feedback</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-3 font-semibold text-gray-900">Important Notes</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• All events require captain approval</li>
                                <li>• QR codes should be assigned before events</li>
                                <li>• Certificates only for verified attendees</li>
                                <li>• Regular monitoring of pending users</li>
                                <li>• Feedback review helps improve services</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Need Help?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>
                            If you encounter any issues or need assistance with your secretary duties, please contact the system administrator or
                            refer to the user manual.
                        </p>
                        <p className="font-medium text-gray-900">
                            Remember: Your role is crucial in maintaining smooth community operations and ensuring residents have access to quality
                            events and services.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
