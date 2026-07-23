import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="flex p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex p-4 border-b border-slate-100 dark:border-slate-800 items-center">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-4"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20 ml-auto"></div>
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}
