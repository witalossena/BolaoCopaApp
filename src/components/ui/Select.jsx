import { Icon } from '../Icon';

export function Select({ value, onChange, children, placeholder, className = "", disabled }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={onChange} disabled={disabled}
        className={`w-full appearance-none bg-bg/70 border border-edge focus:border-grass rounded-xl py-2.5 pl-3.5 pr-9 text-sm font-cond font-semibold text-cream outline-none focus:ring-2 focus:ring-grass/25 transition disabled:opacity-50 ${!value ? "text-mute2" : ""} ${className}`}>
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mute">
        <Icon name="chevronDown" size={16} />
      </span>
    </div>
  );
}
