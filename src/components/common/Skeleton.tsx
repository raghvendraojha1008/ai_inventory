import React from 'react';

export const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
);

export const CardSkeleton = () => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 mb-3 shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <div className="space-y-2 w-1/2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
            <Skeleton className="h-4 w-1/3" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
        </div>
    </div>
);

export const RowSkeleton = () => (
    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3 w-2/3">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
        <Skeleton className="h-5 w-16" />
    </div>
);

export const LoadingStack = ({ type = 'card', count = 4 }: { type?: 'card' | 'row', count?: number }) => (
    <div className="w-full animate-in fade-in duration-500">
        {Array.from({ length: count }).map((_, i) => (
            type === 'card' ? <CardSkeleton key={i} /> : <RowSkeleton key={i} />
        ))}
    </div>
);