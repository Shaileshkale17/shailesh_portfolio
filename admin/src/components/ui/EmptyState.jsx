/**
 * @param {{ icon?: React.ComponentType, title: string, description?: string, action?: React.ReactNode }} props
 */
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    {Icon && (
      <div className="grid h-12 w-12 place-items-center rounded-full bg-surface-raised text-text-secondary">
        <Icon size={22} />
      </div>
    )}
    <div>
      <p className="font-medium text-text">{title}</p>
      {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
    </div>
    {action}
  </div>
);

export default EmptyState;
