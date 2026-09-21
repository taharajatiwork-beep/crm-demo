export default function Input({
  label,
  error,
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  helperText,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-dark-100">
          {label}
          {required && <span className="text-danger mr-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 pointer-events-none">
            <Icon size={16} />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            w-full px-3 py-2 text-sm text-white placeholder-dark-400
            bg-dark-700 border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-accent/50
            ${Icon ? 'pr-10' : ''}
            ${error
              ? 'border-danger focus:ring-danger/30'
              : 'border-dark-500 hover:border-dark-400 focus:border-accent'
            }
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-danger mt-0.5">{error}</p>
      )}

      {!error && helperText && (
        <p className="text-xs text-dark-300 mt-0.5">{helperText}</p>
      )}
    </div>
  );
}
