import { Icon } from '../Icon';

export function Badge({ children, tone = "neutral", icon }) {
  const tones = {
    neutral: "bg-surface2 text-mute border-edge",
    green:   "bg-grass-dim text-grass-400 border-grass/40",
    gold:    "bg-gold-dim text-gold border-gold/40",
    amber:   "bg-[#3a2f12] text-gold-400 border-gold/40",
    red:     "bg-danger/15 text-danger border-danger/40",
    locked:  "bg-surface2 text-mute2 border-edge",
    live:    "bg-danger/15 text-danger border-danger/40",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-cond font-semibold tracking-wide rounded-full border px-2.5 py-1 ${tones[tone]}`}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
