import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'جستجو...' }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-800 border border-dark-600 rounded-lg pr-10 pl-4 py-2.5 text-sm text-white placeholder-dark-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
      />
    </div>
  );
}
