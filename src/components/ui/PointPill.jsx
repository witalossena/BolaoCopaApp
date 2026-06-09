export function PointPill({ pts, tone = "gold", className = "" }) {
  const tones = {
    gold:   "bg-gold-dim text-gold border-gold/30",
    green:  "bg-grass-dim text-grass-400 border-grass/30",
    bronze: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    mute:   "bg-surface2 text-mute2 border-edge",
  };
  return (
    <span className={`inline-flex items-center gap-1 font-cond font-bold rounded-full border px-2.5 py-0.5 text-sm ${tones[tone]} ${className}`}>
      {pts} <span className="opacity-70 font-semibold">pts</span>
    </span>
  );
}
