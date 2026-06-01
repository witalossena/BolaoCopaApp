import { TEAMS, TEAM_TINT } from '../../data';

export function TeamBadge({ name, size = "md", showName = true, dim = false }) {
  const code = TEAMS[name] || "?";
  const tint = TEAM_TINT[code] || "#3f9e57";
  const box = size === "lg" ? "w-9 h-9 text-[13px]" : size === "sm" ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-[11px]";
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span
        className={`${box} shrink-0 rounded-md grid place-items-center font-cond font-bold tracking-wide border`}
        style={{ background: `${tint}1f`, borderColor: `${tint}55`, color: tint }}>
        {code}
      </span>
      {showName && (
        <span className={`font-cond font-semibold truncate ${dim ? "text-mute" : "text-cream"} ${size === "lg" ? "text-base" : "text-sm"}`}>
          {name}
        </span>
      )}
    </span>
  );
}
