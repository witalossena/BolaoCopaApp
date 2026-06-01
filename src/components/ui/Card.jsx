export function Card({ children, className = "", pad = true, accent }) {
  return (
    <div className={`relative rounded-2xl bg-surface/80 border border-edge shadow-card ${pad ? "p-5" : ""} ${className}`}>
      {accent && (
        <span className="absolute left-5 right-5 top-0 h-px bg-gradient-to-r from-transparent via-grass/40 to-transparent" />
      )}
      {children}
    </div>
  );
}
