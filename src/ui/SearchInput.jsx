import { Search, X } from 'lucide-react';

export default function SearchInput({
  value = '',
  onChange,
  placeholder = 'جستجو...',
  className = '',
  ...props
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Search icon (RTL: on the right) */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 pointer-events-none">
        <Search size={16} />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 pl-9 pr-10 text-sm text-white placeholder-dark-400
          bg-dark-700 border border-dark-500 rounded-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
          hover:border-dark-400
        `}
        {...props}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-dark-300 hover:text-white hover:bg-dark-600 transition-colors cursor-pointer"
          aria-label="پاک کردن جستجو"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
