/* ============================================================
   UI — componentes compartilhados + estrutura do app
   ============================================================ */

/* ---------- Marca ---------- */
function Logo({ size = "md", onClick }) {
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

/* ---------- Badge da seleção (chip com código) ---------- */
function TeamBadge({ name, size = "md", showName = true, dim = false }) {
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
      {showName && <span className={`font-cond font-semibold truncate ${dim ? "text-mute" : "text-cream"} ${size==="lg"?"text-base":"text-sm"}`}>{name}</span>}
    </span>
  );
}

/* ---------- Card ---------- */
function Card({ children, className = "", pad = true, accent }) {
  return (
    <div className={`relative rounded-2xl bg-surface/80 border border-edge shadow-card ${pad ? "p-5" : ""} ${className}`}>
      {accent && <span className="absolute left-5 right-5 top-0 h-px bg-gradient-to-r from-transparent via-grass/40 to-transparent" />}
      {children}
    </div>
  );
}

/* ---------- Botão ---------- */
function Button({ children, onClick, variant = "primary", size = "md", className = "", icon, iconRight, type = "button", disabled }) {
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
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {icon && <Icon name={icon} size={size === "lg" ? 20 : 17} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 20 : 17} />}
    </button>
  );
}

/* ---------- Pílula de pontos ---------- */
function PointPill({ pts, tone = "gold", className = "" }) {
  const tones = {
    gold: "bg-gold-dim text-gold border-gold/30",
    green: "bg-grass-dim text-grass-400 border-grass/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 font-cond font-bold rounded-full border px-2.5 py-0.5 text-sm ${tones[tone]} ${className}`}>
      {pts} <span className="opacity-70 font-semibold">pts</span>
    </span>
  );
}

/* ---------- Badge genérica ---------- */
function Badge({ children, tone = "neutral", icon }) {
  const tones = {
    neutral: "bg-surface2 text-mute border-edge",
    green:   "bg-grass-dim text-grass-400 border-grass/40",
    gold:    "bg-gold-dim text-gold border-gold/40",
    amber:   "bg-[#3a2f12] text-gold-400 border-gold/40",
    red:     "bg-danger/15 text-danger border-danger/40",
    locked:  "bg-surface2 text-mute2 border-edge",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-cond font-semibold tracking-wide rounded-full border px-2.5 py-1 ${tones[tone]}`}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}

/* ---------- Título de página (extrudado) ---------- */
function PageTitle({ children, kicker, tone }) {
  return (
    <div className="mb-7">
      {kicker && <div className="font-cond text-grass-400 font-semibold tracking-[.22em] uppercase text-xs mb-2">{kicker}</div>}
      <h1 className={`title-3d ${tone || ""} text-4xl sm:text-5xl leading-[1.05]`}>{children}</h1>
    </div>
  );
}

function SectionLabel({ children, icon }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-grass-400"><Icon name={icon} size={18} /></span>}
      <h2 className="font-display text-grass-400 text-lg sm:text-xl">{children}</h2>
    </div>
  );
}

/* ---------- Campo de formulário ---------- */
function Field({ label, icon, type = "text", value, onChange, placeholder, hint }) {
  return (
    <label className="block">
      {label && <span className="block font-cond font-semibold text-mute text-sm mb-1.5 tracking-wide">{label}</span>}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute2"><Icon name={icon} size={18} /></span>}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full bg-bg/70 border border-edge focus:border-grass rounded-xl py-3 ${icon ? "pl-11 pr-4" : "px-4"} text-cream placeholder-mute2 outline-none focus:ring-2 focus:ring-grass/25 transition`} />
      </div>
      {hint && <span className="block text-xs text-mute2 mt-1.5">{hint}</span>}
    </label>
  );
}

/* ---------- Select estilizado ---------- */
function Select({ value, onChange, children, placeholder, className = "", disabled }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={onChange} disabled={disabled}
        className={`w-full appearance-none bg-bg/70 border border-edge focus:border-grass rounded-xl py-2.5 pl-3.5 pr-9 text-sm font-cond font-semibold text-cream outline-none focus:ring-2 focus:ring-grass/25 transition disabled:opacity-50 ${!value ? "text-mute2" : ""} ${className}`}>
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mute"><Icon name="chevronDown" size={16} /></span>
    </div>
  );
}

/* ============================================================
   APP SHELL — sidebar + header
   ============================================================ */
const NAV_ITEMS = [
  { id: "palpites",   label: "Meus Palpites",   icon: "list" },
  { id: "especiais",  label: "Palpites Especiais", icon: "star" },
  { id: "matamata",   label: "Mata-Mata",       icon: "bracket" },
  { id: "ranking",    label: "Ranking Geral",   icon: "trophy" },
  { id: "desempenho", label: "Meu Desempenho",  icon: "dashboard" },
  { id: "regras",     label: "Regras",          icon: "target" },
];

function NavButton({ item, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-cond font-semibold text-[15px] tracking-wide transition-all
        ${active ? "bg-grass-dim text-grass-400 border border-grass/30" : "text-mute hover:text-cream hover:bg-surface2 border border-transparent"}`}>
      <Icon name={item.icon} size={19} />
      <span className="flex-1 text-left">{item.label}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-grass-400" />}
    </button>
  );
}

function AppShell({ user, view, setView, onLogout, children }) {
  const [drawer, setDrawer] = React.useState(false);
  const pending = user && !user.paid;

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-edge/70">
        <Logo onClick={() => { setView("palpites"); setDrawer(false); }} />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(it => (
          <NavButton key={it.id} item={it} active={view === it.id}
            onClick={() => { setView(it.id); setDrawer(false); }} />
        ))}
        <div className="pt-3 mt-3 border-t border-edge/60">
          <NavButton item={{ id:"admin", label:"Painel Admin", icon:"settings" }}
            active={view === "admin"} onClick={() => { setView("admin"); setDrawer(false); }} />
        </div>
      </nav>

      <div className="p-3 border-t border-edge/70">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-grass-dim border border-grass/30 grid place-items-center text-grass-400 font-display">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-cond font-semibold text-sm text-cream truncate">{user?.name}</div>
            <div className="text-xs text-mute2 truncate">{user?.handle}</div>
          </div>
          <button onClick={onLogout} className="text-mute2 hover:text-danger transition p-1.5" title="Sair">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-pitch">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-surface/60 border-r border-edge fixed inset-y-0 left-0 z-30">
        {SidebarContent}
      </aside>

      {/* Drawer mobile */}
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <aside className="relative w-72 max-w-[80%] bg-surface border-r border-edge pop">{SidebarContent}</aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-bg/85 backdrop-blur-md border-b border-edge">
          <div className="flex items-center gap-3 px-4 sm:px-7 py-3.5">
            <button className="lg:hidden text-mute hover:text-cream p-1" onClick={() => setDrawer(true)}>
              <Icon name="menu" size={22} />
            </button>
            <div className="lg:hidden"><Logo size="sm" /></div>

            <div className="hidden lg:block font-cond text-mute text-sm tracking-wide">
              {NAV_ITEMS.find(n => n.id === view)?.label || (view === "admin" ? "Painel Admin" : "")}
            </div>

            <div className="flex-1" />

            {pending && (
              <button onClick={() => setView("desempenho")}
                className="flex items-center gap-2 bg-[#3a2f12] border border-gold/40 text-gold-400 rounded-full pl-2.5 pr-3.5 py-1.5 text-xs font-cond font-semibold hover:bg-gold-dim transition">
                <Icon name="alert" size={15} />
                <span className="hidden sm:inline">Pagamento pendente</span>
                <span className="sm:hidden">Pendente</span>
              </button>
            )}
            <button onClick={() => setView("ranking")}
              className="flex items-center gap-2 bg-surface2 border border-edge rounded-full pl-2.5 pr-3.5 py-1.5 hover:border-edge2 transition">
              <Icon name="trophy" size={15} className="text-gold" />
              <span className="font-cond font-bold text-cream text-sm">{user?.totalPts ?? 0}</span>
              <span className="font-cond text-mute2 text-xs">pts</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-7 py-7 max-w-6xl w-full mx-auto fade-in" key={view}>
          {children}
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { Logo, TeamBadge, Card, Button, PointPill, Badge, PageTitle, SectionLabel, Field, Select, AppShell, NAV_ITEMS });
