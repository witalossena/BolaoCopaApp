import { Icon } from '../Icon';

export function Logo({ size = "md", onClick }) {
  const s = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  const ic = size === "lg" ? 30 : size === "sm" ? 20 : 24;
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 group">
      <span className="text-gold group-hover:text-gold-400 transition-colors">
        <Icon name="trophy" size={ic} strokeWidth={2.2} />
      </span>
      <span className={`logo-3d ${s} tracking-wide`}>BOLÃO <span className="text-gold">2026</span></span>
    </button>
  );
}
