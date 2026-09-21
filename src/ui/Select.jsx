import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'انتخاب کنید...',
  error,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-dark-100">{label}</label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-3 py-2 text-sm
            bg-dark-700 border rounded-lg cursor-pointer
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-accent/50
            ${error
              ? 'border-danger focus:ring-danger/30'
              : 'border-dark-500 hover:border-dark-400 focus:border-accent'
            }
          `}
        >
          <span className={selectedOption ? 'text-white' : 'text-dark-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-dark-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 py-1 bg-dark-700 border border-dark-500 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-sm
                  transition-colors cursor-pointer
                  ${value === opt.value
                    ? 'text-accent bg-accent/10'
                    : 'text-dark-100 hover:bg-dark-600'
                  }
                `}
              >
                {opt.label}
                {value === opt.value && <Check size={14} className="text-accent" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger mt-0.5">{error}</p>
      )}
    </div>
  );
}
