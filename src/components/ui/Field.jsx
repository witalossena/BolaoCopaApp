import { Icon } from '../Icon';

export function Field({ label, icon, type = "text", value, onChange, placeholder, hint }) {
  return (
    <label className="block">
      {label && (
        <span className="block font-cond font-semibold text-mute text-sm mb-1.5 tracking-wide">{label}</span>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute2">
            <Icon name={icon} size={18} />
          </span>
        )}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full bg-bg/70 border border-edge focus:border-grass rounded-xl py-3 ${icon ? "pl-11 pr-4" : "px-4"} text-cream placeholder-mute2 outline-none focus:ring-2 focus:ring-grass/25 transition`}
        />
      </div>
      {hint && <span className="block text-xs text-mute2 mt-1.5">{hint}</span>}
    </label>
  );
}
