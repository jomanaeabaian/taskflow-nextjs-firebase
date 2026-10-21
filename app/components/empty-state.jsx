export function EmptyState({ icon: Icon, title, description, children, className = "" }) {
  return (
    <div className={`flex flex-col items-center rounded-xl border border-dashed border-[#dbdee5] px-4 py-12 text-center ${className}`}>
      {Icon && (
        <span className="grid size-12 place-items-center rounded-full bg-[#e7eeff] text-[#19285f]">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      )}
      <p className="mt-4 text-base font-semibold leading-6 text-slate-900">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-gray-600">{description}</p>}
      {children}
    </div>
  );
}
