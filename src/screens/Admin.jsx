import { useState } from 'react';
import { TOTAL_MATCHES } from '../data';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageTitle } from '../components/ui/PageTitle';

function AdminTile({ icon, value, label, tone }) {
  const c = tone === "gold" ? "text-gold" : tone === "amber" ? "text-gold-400" : tone === "red" ? "text-danger" : "text-grass-400";
  return (
    <Card className="flex items-center gap-4">
      <span className={`w-11 h-11 rounded-xl grid place-items-center bg-surface2 border border-edge ${c}`}>
        <Icon name={icon} size={22} />
      </span>
      <div>
        <div className="font-display text-3xl text-cream leading-none">{value}</div>
        <div className="font-cond text-mute text-xs tracking-wide mt-1.5">{label}</div>
      </div>
    </Card>
  );
}

export function Admin({ allUsers, togglePaid }) {
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(null);

  const total = allUsers.length;
  const paid = allUsers.filter(u => u.paid).length;
  const pending = total - paid;

  const run = (key, label) => {
    setBusy(key);
    setTimeout(() => {
      setBusy(null);
      setToast(label);
      setTimeout(() => setToast(null), 2600);
    }, 1100);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Badge tone="red" icon="shield">Acesso restrito</Badge>
      </div>
      <PageTitle kicker="Controle do bolão">Painel Admin</PageTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 -mt-2">
        <AdminTile icon="users"  value={total}         label="USUÁRIOS CADASTRADOS" />
        <AdminTile icon="wallet" value={paid}          label="INSCRIÇÕES PAGAS"      tone="gold" />
        <AdminTile icon="alert"  value={pending}       label="PAGAMENTOS PENDENTES"  tone="amber" />
        <AdminTile icon="ball"   value={TOTAL_MATCHES} label="JOGOS NO BANCO" />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Button variant="secondary" size="lg" icon="refresh" disabled={!!busy}
          onClick={() => run("res", "Resultados reais atualizados.")}>
          {busy === "res" ? "Atualizando..." : "Atualizar Resultados Reais"}
        </Button>
        <Button variant="primary" size="lg" icon="calculator" disabled={!!busy}
          onClick={() => run("calc", "Pontuações recalculadas para todos.")}>
          {busy === "calc" ? "Calculando..." : "Calcular Pontuações"}
        </Button>
      </div>

      <Card pad={false} className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-edge flex items-center justify-between">
          <h2 className="font-display text-lg text-cream">Participantes</h2>
          <span className="font-cond text-mute2 text-sm">{total} no total</span>
        </div>
        <div className="grid grid-cols-[1fr_72px_110px_88px] sm:grid-cols-[1fr_100px_130px_100px] px-5 py-2.5 border-b border-edge bg-surface2/40">
          {["Participante", "Total", "Status", "Ação"].map((h, i) => (
            <span key={h} className={`font-cond font-semibold text-mute2 text-xs tracking-widest uppercase ${i === 1 ? "text-right" : ""}`}>
              {h}
            </span>
          ))}
        </div>
        {allUsers.map(u => (
          <div key={u.handle || u.user}
            className="grid grid-cols-[1fr_72px_110px_88px] sm:grid-cols-[1fr_100px_130px_100px] items-center px-5 py-3 border-b border-edge/40 last:border-0 hover:bg-surface2/30 transition">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 shrink-0 rounded-full bg-surface2 border border-edge grid place-items-center font-display text-xs text-cream">
                {u.name[0]}
              </span>
              <div className="min-w-0">
                <div className="font-cond font-bold text-cream truncate text-sm">{u.name}</div>
                <div className="text-mute2 text-xs truncate">{u.handle || u.user}</div>
              </div>
            </div>
            <span className="text-right font-cond font-bold text-cream text-sm">{u.groupPts + u.awardPts}</span>
            <div>
              {u.paid
                ? <Badge tone="green" icon="check">Pago</Badge>
                : <Badge tone="amber" icon="clock">Pendente</Badge>}
            </div>
            <button onClick={() => togglePaid(u)}
              className="font-cond text-xs font-semibold text-mute hover:text-grass-400 transition text-left">
              {u.paid ? "Marcar pend." : "Marcar pago"}
            </button>
          </div>
        ))}
      </Card>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface border border-grass/40 text-cream rounded-full px-5 py-3 shadow-card flex items-center gap-2.5 pop">
          <Icon name="checkCircle" size={18} className="text-grass-400" />
          <span className="font-cond font-semibold text-sm">{toast}</span>
        </div>
      )}
    </div>
  );
}
