import { useState, useRef, useEffect } from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';

export default function FilterBar({
  filters = [],
  onFilterChange,
  onClear,
  className = '',
}) {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const barRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeFilters = filters.filter((f) => f.value !== undefined && f.value !== '' && f.value !== 'all');

  const handleFilterSelect = (filterId, optionValue) => {
    onFilterChange(filterId, optionValue);
    setDropdownOpen(null);
  };

  return (
    <div
      ref={barRef}
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      {/* Filter Dropdown Trigger */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(dropdownOpen === '_add' ? null : '_add')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-dark-200 bg-dark-700 border border-dark-500 rounded-lg hover:bg-dark-600 transition-colors cursor-pointer"
        >
          <Filter size={14} />
          فیلتر
          <ChevronDown size={12} />
        </button>

        {dropdownOpen === '_add' && (
          <div className="absolute top-full left-0 mt-1 py-1 bg-dark-700 border border-dark-500 rounded-lg shadow-xl z-50 min-w-[180px]">
            {filters.map((filter) => {
              const hasValue = filter.value !== undefined && filter.value !== '' && filter.value !== 'all';
              return (
                <button
                  key={filter.id}
                  onClick={() => setDropdownOpen(filter.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm
                    hover:bg-dark-600 transition-colors cursor-pointer
                    ${hasValue ? 'text-accent' : 'text-dark-100'}
                  `}
                >
                  {filter.label}
                  <ChevronDown size={12} className="rotate-[-90deg]" />
                </button>
              );
            })}
          </div>
        )}

        {/* Per-filter option dropdown */}
        {dropdownOpen && dropdownOpen !== '_add' && (
          <div className="absolute top-full left-0 mt-1 py-1 bg-dark-700 border border-dark-500 rounded-lg shadow-xl z-50 min-w-[160px]">
            <button
              onClick={() => handleFilterSelect(dropdownOpen, 'all')}
              className="w-full px-3 py-2 text-sm text-dark-200 hover:bg-dark-600 transition-colors cursor-pointer text-right"
            >
              همه
            </button>
            {filters
              .find((f) => f.id === dropdownOpen)
              ?.options?.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFilterSelect(dropdownOpen, opt.value)}
                  className={`
                    w-full px-3 py-2 text-sm hover:bg-dark-600 transition-colors cursor-pointer text-right
                    ${filters.find((f) => f.id === dropdownOpen)?.value === opt.value ? 'text-accent' : 'text-dark-100'}
                  `}
                >
                  {opt.label}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {activeFilters.map((filter) => {
        const selectedOpt = filter.options?.find((o) => o.value === filter.value);
        const label = selectedOpt ? selectedOpt.label : filter.value;

        return (
          <span
            key={filter.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-accent/15 text-accent border border-accent/25 rounded-full"
          >
            {filter.label}: {label}
            <button
              onClick={() => onFilterChange(filter.id, 'all')}
              className="p-0.5 rounded-full hover:bg-accent/20 transition-colors cursor-pointer"
              aria-label={`حذف فیلتر ${filter.label}`}
            >
              <X size={12} />
            </button>
          </span>
        );
      })}

      {/* Clear all */}
      {activeFilters.length > 0 && (
        <button
          onClick={onClear}
          className="text-xs text-dark-300 hover:text-danger transition-colors cursor-pointer"
        >
          حذف همه فیلترها
        </button>
      )}
    </div>
  );
}
