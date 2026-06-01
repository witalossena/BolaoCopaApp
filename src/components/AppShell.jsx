import { useState } from 'react';
import { Icon } from './Icon';
import { Logo } from './ui/Logo';

export const NAV_ITEMS = [
  { id: "palpites",   label: "Meus Palpites",     icon: "list" },
  { id: "especiais",  label: "Palpites Especiais", icon: "star" },
  { id: "matamata",   label: "Mata-Mata",          icon: "bracket" },
  { id: "ranking",    label: "Ranking Geral",      icon: "trophy" },
  { id: "desempenho", label: "Meu Desempenho",     icon: "dashboard" },
  { id: "regras",     label: "Regras",             icon: "target" },
];

function NavButton({ item, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-cond font-semibold text-[15px] tracking-wide transition-all
        ${active
          ? "bg-grass-dim text-grass-400 border border-grass/30"
          : "text-mute hover:text-cream hover:bg-surface2 border border-transparent"}`}>
      <Icon name={item.icon} size={19} />
      <span className="flex-1 text-left">{item.label}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-grass-400" />}
    </button>
  );
}

export function AppShell({ user, view, setView, onLogout, children }) {
  const [drawer, setDrawer] = useState(false);
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
          <NavButton
            item={{ id: "admin", label: "Painel Admin", icon: "settings" }}
            active={view === "admin"}
            onClick={() => { setView("admin"); setDrawer(false); }} />
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
          <aside className="relative w-72 max-w-[80%] bg-surface border-r border-edge pop">
            {SidebarContent}
          </aside>
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
