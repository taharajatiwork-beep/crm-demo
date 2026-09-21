export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
      {Icon && (
        <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center">
          <Icon className="w-7 h-7 text-dark-400" />
        </div>
      )}
      <div>
        <h3 className="text-white text-sm font-medium">{title}</h3>
        {description && (
          <p className="text-dark-300 text-xs mt-1 max-w-xs">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
