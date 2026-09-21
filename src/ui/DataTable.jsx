import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import EmptyState from './EmptyState';
import { LoadingSkeleton } from './LoadingSpinner';

export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  emptyText = 'موردی یافت نشد',
  loading = false,
  className = '',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'string') {
      const cmp = aVal.localeCompare(bVal, 'fa');
      return sortDir === 'asc' ? cmp : -cmp;
    }
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown size={13} className="text-dark-400" />;
    return sortDir === 'asc'
      ? <ArrowUp size={13} className="text-accent" />
      : <ArrowDown size={13} className="text-accent" />;
  };

  if (loading) {
    return (
      <div className={`bg-dark-800 border border-dark-600 rounded-xl overflow-hidden ${className}`}>
        <div className="p-4">
          <LoadingSkeleton rows={5} />
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={`bg-dark-800 border border-dark-600 rounded-xl overflow-hidden ${className}`}>
        <EmptyState title={emptyText} />
      </div>
    );
  }

  return (
    <div className={`bg-dark-800 border border-dark-600 rounded-xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-600">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    px-4 py-3 text-right text-xs font-medium text-dark-200 uppercase tracking-wider
                    ${col.sortable ? 'cursor-pointer hover:text-white select-none' : ''}
                  `}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {sortedData.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                onClick={() => onRowClick?.(row)}
                className={`
                  transition-colors
                  ${onRowClick ? 'cursor-pointer hover:bg-dark-700/50' : ''}
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-dark-100 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
