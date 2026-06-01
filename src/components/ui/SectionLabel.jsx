import { Icon } from '../Icon';

export function SectionLabel({ children, icon }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-grass-400"><Icon name={icon} size={18} /></span>}
      <h2 className="font-display text-grass-400 text-lg sm:text-xl">{children}</h2>
    </div>
  );
}
