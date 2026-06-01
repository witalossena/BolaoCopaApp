import { Icon } from '../Icon';

export function Button({ children, onClick, variant = "primary", size = "md", className = "", icon, iconRight, type = "button", disabled }) {
  const base = "inline-flex items-center justify-center gap-2 font-cond font-semibold tracking-wide rounded-full transition-all duration-150 select-none disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "text-sm px-4 py-2", md: "text-[15px] px-5 py-2.5", lg: "text-base px-7 py-3.5" };
  const variants = {
    primary:   "bg-grass text-bg hover:bg-grass-400 active:scale-[.98] shadow-[0_8px_24px_-10px_rgba(52,199,94,.7)]",
    gold:      "bg-gold text-bg hover:bg-gold-400 active:scale-[.98] shadow-[0_8px_24px_-12px_rgba(227,178,60,.7)]",
    secondary: "bg-surface2 text-cream border border-edge hover:border-edge2 hover:bg-edge/40 active:scale-[.98]",
    ghost:     "text-mute hover:text-cream hover:bg-surface2",
    danger:    "bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {icon && <Icon name={icon} size={size === "lg" ? 20 : 17} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 20 : 17} />}
    </button>
  );
}
