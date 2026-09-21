import { Filter } from 'lucide-react';

export default function FilterBar({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="flex items-center gap-1 bg-dark-800 border border-dark-600 rounded-lg p-1">
      <Filter className="w-3.5 h-3.5 text-dark-300 mr-1.5 ml-0.5" />
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
            activeFilter === f.id
              ? 'bg-accent text-white shadow-sm'
              : 'text-dark-200 hover:text-white hover:bg-dark-700'
          }`}
        >
          {f.label}
          {f.count !== undefined && (
            <span className={`mr-1 text-[10px] ${activeFilter === f.id ? 'text-white/70' : 'text-dark-400'}`}>
              ({f.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
