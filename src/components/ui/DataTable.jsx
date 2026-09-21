import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import EmptyState from './EmptyState';

/**
 * DataTable — reusable sorted/paginated table with mobile card fallback.
 *
 * Props:
 *   columns: Array<{
 *     key: string,           // field name in row object
 *     label: string,         // Persian header
 *     sortable?: boolean,
 *     align?: 'start' | 'center' | 'end',
 *     render?: (row, value) => ReactNode,   // custom cell renderer
 *     className?: string,    // extra classes on the cell div
 *   }>
 *   data:        Array<Record<string, any>>
 *   rowKey:      (row) => any          — unique key extractor
 *   pageSize?:   number                — rows per page (default 10)
 *   emptyTitle?: string
 *   emptyDesc?:  string
 *   emptyIcon?:  Component
 *   onRowClick?: (row) => void
 *   mobileRender?: (row) => ReactNode  — custom card for mobile
 *   className?:  string
 */

const PAGE_SIZES = [5, 10, 20, 50];

export default function DataTable({
  columns,
  data,
  rowKey,
  pageSize: initialPageSize = 10,
  emptyTitle = 'داده‌ای یافت نشد',
  emptyDesc = '',
  emptyIcon,
  onRowClick,
  mobileRender,
  className = '',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  /* ---------- sorting ---------- */
  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv), 'fa');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  /* ---------- pagination ---------- */
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  // Reset page when data changes
  const resetPage = () => setPage(0);

  const handleSort = (key, sortable) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const alignClass = (a) => {
    if (a === 'center') return 'text-center justify-center';
    if (a === 'end') return 'text-left justify-start'; // RTL: start = left visually
    return 'text-right justify-end'; // RTL: end = left visually (default is right-aligned for Persian)
  };

  /* ---------- empty ---------- */
  if (!data.length) {
    return (
      <div className={`bg-dark-800 border border-dark-600 rounded-xl ${className}`}>
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDesc} />
      </div>
    );
  }

  return (
    <div className={`bg-dark-800 border border-dark-600 rounded-xl overflow-hidden ${className}`}>
      {/* ---- Desktop Table ---- */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="grid gap-4 px-5 py-3 bg-dark-700 border-b border-dark-600 text-dark-300 text-xs font-medium"
          style={{ gridTemplateColumns: columns.map(() => '1fr').join(' ') }}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              className={`flex items-center gap-1 ${alignClass(col.align)} ${col.sortable ? 'cursor-pointer hover:text-white select-none transition-colors' : ''}`}
              onClick={() => handleSort(col.key, col.sortable)}
            >
              <span>{col.label}</span>
              {col.sortable && (
                <span className="text-dark-400">
                  {sortKey === col.key ? (
                    sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronsUpDown className="w-3 h-3" />
                  )}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        {paged.map((row, idx) => (
          <div
            key={rowKey(row)}
            className={`grid gap-4 px-5 py-4 border-b border-dark-600/50 items-center transition-colors ${onRowClick ? 'cursor-pointer hover:bg-dark-700/70' : 'hover:bg-dark-700/50'} ${idx % 2 === 1 ? 'bg-dark-750/30' : ''}`}
            style={{ gridTemplateColumns: columns.map(() => '1fr').join(' ') }}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {columns.map((col) => (
              <div key={col.key} className={`min-w-0 ${alignClass(col.align)} ${col.className || ''}`}>
                {col.render ? col.render(row, row[col.key]) : (
                  <span className="text-sm text-dark-100 truncate">{row[col.key] ?? '—'}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ---- Mobile Cards ---- */}
      <div className="md:hidden divide-y divide-dark-600/50">
        {paged.map((row) => (
          <div key={rowKey(row)} className="p-4" onClick={onRowClick ? () => onRowClick(row) : undefined}>
            {mobileRender ? (
              mobileRender(row)
            ) : (
              <div className="space-y-1.5">
                {columns.slice(0, 3).map((col) => (
                  <div key={col.key} className="flex justify-between text-xs">
                    <span className="text-dark-300">{col.label}</span>
                    <span className="text-dark-100 text-left max-w-[60%] truncate">
                      {col.render ? col.render(row, row[col.key]) : row[col.key] ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ---- Empty filtered ---- */}
      {paged.length === 0 && data.length > 0 && (
        <div className="py-12 text-center text-dark-300 text-sm">
          نتیجه‌ای یافت نشد
        </div>
      )}

      {/* ---- Pagination ---- */}
      {sorted.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-dark-600 bg-dark-700/40">
          <div className="flex items-center gap-3">
            <span className="text-dark-300 text-xs">
              {sorted.length} نتیجه
            </span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              className="bg-dark-800 border border-dark-600 rounded-md px-2 py-1 text-xs text-dark-200 focus:outline-none focus:border-accent"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s} در صفحه</option>
              ))}
            </select>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-2 py-1 text-xs rounded-md bg-dark-700 border border-dark-600 text-dark-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                قبلی
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 text-xs rounded-md transition-colors ${
                      page === pageNum
                        ? 'bg-accent text-white'
                        : 'text-dark-200 hover:bg-dark-600'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-2 py-1 text-xs rounded-md bg-dark-700 border border-dark-600 text-dark-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                بعدی
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
