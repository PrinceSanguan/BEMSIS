'use client';

import { Button } from '@/components/ui/button';
import type { Paginated } from '@/lib/types';

/** Laravel-style pager for a paginated list (hidden when everything fits on one page). */
export function PaginationControls({ data, onPage }: { data: Paginated<unknown>; onPage: (page: number) => void }) {
    if (data.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <Button variant="outline" onClick={() => onPage(data.current_page - 1)} disabled={data.current_page === 1}>
                    Previous
                </Button>
                <Button variant="outline" onClick={() => onPage(data.current_page + 1)} disabled={data.current_page === data.last_page}>
                    Next
                </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{data.from}</span> to <span className="font-medium">{data.to}</span> of{' '}
                        <span className="font-medium">{data.total}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPage(data.current_page - 1)}
                            disabled={data.current_page === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2"
                        >
                            Previous
                        </Button>
                        {Array.from({ length: data.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === data.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onPage(page)}
                                aria-current={page === data.current_page ? 'page' : undefined}
                                className="relative inline-flex items-center px-4 py-2"
                            >
                                {page}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPage(data.current_page + 1)}
                            disabled={data.current_page === data.last_page}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2"
                        >
                            Next
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
