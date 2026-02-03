export default function EmptyState({ icon, title, description, action }) {
    return (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            {icon && (
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    {icon}
                </div>
            )}
            <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
