'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SecretaryEventRow } from '@/lib/views/secretary';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface EventsCalendarProps {
    events: SecretaryEventRow[];
    currentDate: Date;
    onCurrentDateChange: (date: Date) => void;
    now: Date;
    onSelectEvent: (eventId: number) => void;
}

/** Month grid of the Secretary events page (the calendar half of the old Events.tsx). */
export function EventsCalendar({ events, currentDate, onCurrentDateChange, now, onSelectEvent }: EventsCalendarProps) {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();

    const daysInMonth = lastDayOfMonth.getDate();
    const daysFromPrevMonth = firstDayOfWeek;
    const totalCalendarCells = Math.ceil((daysInMonth + daysFromPrevMonth) / 7) * 7;

    // Group events by date
    const eventsByDate = useMemo(() => {
        const grouped: { [key: string]: SecretaryEventRow[] } = {};
        events.forEach((event) => {
            const eventDate = new Date(event.start_date);
            const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(event);
        });
        return grouped;
    }, [events]);

    const getEventsForDate = (date: Date) => {
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        return eventsByDate[dateKey] || [];
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        // Day 1 so that e.g. Jan 31 + 1 month does not skip February.
        newDate.setDate(1);
        newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
        onCurrentDateChange(newDate);
    };

    const goToToday = () => {
        onCurrentDateChange(new Date());
    };

    const renderCalendarCells = () => {
        const cells = [];
        const prevMonth = new Date(currentYear, currentMonth - 1, 0);

        // Previous month days
        for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i);
            const dayEvents = getEventsForDate(date);

            cells.push(
                <div key={`prev-${i}`} className="min-h-12 border border-gray-200 bg-gray-50 p-1 opacity-40 sm:min-h-16 sm:p-2 lg:min-h-24">
                    <div className="text-sm text-gray-500">{date.getDate()}</div>
                    {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                                <div
                                    key={event.id}
                                    className="cursor-pointer truncate rounded bg-gray-200 px-1 py-0.5 text-xs text-gray-600"
                                    onClick={() => onSelectEvent(event.id)}
                                >
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>}
                        </div>
                    )}
                </div>,
            );
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayEvents = getEventsForDate(date);
            const isToday = now.toDateString() === date.toDateString();

            cells.push(
                <div
                    key={day}
                    className={`min-h-12 border border-gray-200 bg-white p-1 sm:min-h-16 sm:p-2 lg:min-h-24 ${isToday ? 'border-blue-300 bg-blue-50' : ''}`}
                >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>{day}</div>
                    {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                                <div
                                    key={event.id}
                                    className={`cursor-pointer truncate rounded px-1 py-0.5 text-xs font-medium ${
                                        event.status === 'approved'
                                            ? 'bg-green-100 text-green-700'
                                            : event.status === 'declined'
                                              ? 'bg-red-100 text-red-700'
                                              : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                    onClick={() => onSelectEvent(event.id)}
                                    title={event.title}
                                >
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 2 && (
                                <div className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">+{dayEvents.length - 2} more</div>
                            )}
                        </div>
                    )}
                </div>,
            );
        }

        // Next month days
        const remainingCells = totalCalendarCells - daysInMonth - daysFromPrevMonth;
        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(currentYear, currentMonth + 1, day);
            const dayEvents = getEventsForDate(date);

            cells.push(
                <div key={`next-${day}`} className="min-h-12 border border-gray-200 bg-gray-50 p-1 opacity-40 sm:min-h-16 sm:p-2 lg:min-h-24">
                    <div className="text-sm text-gray-500">{day}</div>
                    {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                                <div
                                    key={event.id}
                                    className="cursor-pointer truncate rounded bg-gray-200 px-1 py-0.5 text-xs text-gray-600"
                                    onClick={() => onSelectEvent(event.id)}
                                >
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>}
                        </div>
                    )}
                </div>,
            );
        }

        return cells;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">
                            {monthNames[currentMonth]} {currentYear}
                        </CardTitle>
                        <CardDescription>View events in calendar format</CardDescription>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                        <Button variant="outline" size="sm" onClick={goToToday} className="w-full sm:w-auto">
                            Today
                        </Button>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateMonth('prev')}
                                className="flex-1 sm:flex-none"
                                aria-label="Previous month"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="ml-1 sm:hidden">Prev</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateMonth('next')}
                                className="flex-1 sm:flex-none"
                                aria-label="Next month"
                            >
                                <ChevronRight className="h-4 w-4" />
                                <span className="ml-1 sm:hidden">Next</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Calendar Header */}
                <div>
                    <div className="mb-2 grid grid-cols-7 gap-px">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-600">
                                <span className="hidden sm:inline">{day}</span>
                                <span className="sm:hidden">{day.slice(0, 1)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar Grid */}
                <div>
                    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-200">{renderCalendarCells()}</div>
                </div>
            </CardContent>
        </Card>
    );
}
