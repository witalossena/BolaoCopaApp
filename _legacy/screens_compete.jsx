/* ============================================================
   TELAS — Ranking, Meu Desempenho, Mata-Mata, Admin
   ============================================================ */

/* ---------------- RANKING ---------------- */
function Ranking({ ranking, currentUser }) {
  const medal = ["#e3b23c", "#c9c9c9", "#cd7f4a"];
  return (
    <div>
      <PageTitle kicker="Classificação geral">Ranking Geral</PageTitle>
      <p className="text-mute -mt-3 mb-7">Todos os participantes do bolão, em uma única tabela. Pontos de grupos + pódio &amp; premiações.</p>

      <Card pad={false} className="overflow-hidden">
        <div className="grid grid-cols-[44px_1fr_64px_64px_72px] sm:grid-cols-[56px_1fr_90px_90px_96px] items-center px-4 sm:px-5 py-3 border-b border-edge bg-surface2/60">
          {["#","Participante","Grupos","Prêmios","Total"].map((h, i) => (
            <span key={h} className={`font-cond font-semibold text-mute2 text-xs tracking-widest uppercase ${i >= 2 ? "text-right" : ""}`}>{h}</span>
          ))}
        </div>

        {ranking.map((u, i) => {
          const me = u.handle === currentUser.handle;
          return (
            <div key={u.handle || u.user}
              className={`grid grid-cols-[44px_1fr_64px_64px_72px] sm:grid-cols-[56px_1fr_90px_90px_96px] items-center px-4 sm:px-5 py-3.5 border-b border-edge/40 last:border-0 transition
                ${me ? "bg-grass-dim/40" : "hover:bg-surface2/40"}`}>
              <div className="flex items-center">
                {i < 3 ? (
                  <span style={{ color: medal[i] }}><Icon name="trophy" size={20} /></span>
                ) : (
                  <span className="font-display text-mute text-base pl-1">{i + 1}</span>
                )}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 shrink-0 rounded-full bg-surface2 border border-edge grid place-items-center font-display text-sm text-cream">
                  {u.name[0]}
                </span>
                <div className="min-w-0">
                  <div className="font-cond font-bold text-cream truncate flex items-center gap-2">
                    {u.name}
                    {me && <span className="text-[10px] font-semibold tracking-wide bg-grass text-bg rounded-full px-1.5 py-0.5">VOCÊ</span>}
                  </div>
                  <div className="text-mute2 text-xs truncate">{u.handle || u.user}</div>
                </div>
              </div>
              <span className="text-right font-cond font-semibold text-mute text-sm">{u.groupPts}</span>
              <span className="text-right font-cond font-semibold text-gold text-sm">{u.awardPts}</span>
              <span className="text-right font-display text-grass-400 text-lg">{u.groupPts + u.awardPts}</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ---------------- MEU DESEMPENHO ---------------- */
function Ring({ value, label }) {
  const r = 42, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1f3a29" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#34c75e" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset .8s ease" }} />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <div className="font-display text-3xl text-cream leading-none">{value}<span className="text-grass-400 text-lg">%</span></div>
        <div className="font-cond text-mute2 text-[10px] tracking-widest mt-1">{label}</div>
      </div>
    </div>
  );
}

function BigStat({ icon, value, suffix, label, tone = "grass" }) {
  const c = tone === "gold" ? "text-gold" : "text-grass-400";
  return (
    <Card className="flex flex-col gap-3">
      <span className={c}><Icon name={icon} size={24} /></span>
      <div>
        <div className="font-display text-4xl text-cream leading-none">{value}<span className={`${c} text-2xl`}>{suffix}</span></div>
        <div className="font-cond text-mute text-sm tracking-wide mt-2">{label}</div>
      </div>
    </Card>
  );
}

function Desempenho({ user, ranking, setView }) {
  const pos = ranking.findIndex(u => u.handle === user.handle) + 1;
  const total = user.groupPts + user.awardPts;
  const ahead = pos > 1 ? (ranking[pos - 2].groupPts + ranking[pos - 2].awardPts) - total : 0;

  return (
    <div>
      <PageTitle kicker={`Olá, ${user.name.split(" ")[0]}`}>Meu Desempenho</PageTitle>

      {!user.paid && (
        <Card className="mb-6 -mt-2 border-gold/40 bg-gold-dim/30 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gold-400"><Icon name="alert" size={22} /></span>
            <div>
              <div className="font-cond font-bold text-gold-400">Pagamento pendente</div>
              <div className="text-mute text-sm">Confirme sua inscrição para validar os pontos no ranking oficial.</div>
            </div>
          </div>
          <Button variant="gold" size="sm" icon="wallet">Pagar inscrição · R$ 30</Button>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <BigStat icon="zap" value={total} label="Pontos totais acumulados" />
        <BigStat icon="trophy" value={`${pos}º`} label={`Posição entre ${ranking.length} participantes`} tone="gold" />
        <Card className="flex items-center justify-center">
          <Ring value={user.exactRate} label="PLACARES EXATOS" />
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card accent>
          <SectionLabel icon="trendingUp">De onde vêm seus pontos</SectionLabel>
          {[
            ["Fase de grupos", user.groupPts, "#34c75e"],
            ["Pódio & premiações", user.awardPts, "#e3b23c"],
          ].map(([l, v, col]) => (
            <div key={l} className="mb-4 last:mb-0">
              <div className="flex justify-between font-cond text-sm mb-1.5">
                <span className="text-cream">{l}</span>
                <span className="font-bold" style={{ color: col }}>{v} pts</span>
              </div>
              <div className="h-2.5 rounded-full bg-bg/70 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${total ? (v / total) * 100 : 0}%`, background: col, transition: "width .8s ease" }} />
              </div>
            </div>
          ))}
        </Card>

        <Card accent>
          <SectionLabel icon="target">Resumo</SectionLabel>
          <div className="space-y-3">
            {[
              ["Placares exatos acertados", `${user.exact}`, "ball"],
              ["Distância para o líder", pos === 1 ? "Você lidera! 🏆" : `${ahead} pts`, "arrowUpRight"],
              ["Inscrição", user.paid ? "Confirmada" : "Pendente", "wallet"],
            ].map(([l, v, ic]) => (
              <div key={l} className="flex items-center justify-between py-2 border-b border-edge/50 last:border-0">
                <span className="flex items-center gap-2.5 text-mute text-sm"><Icon name={ic} size={16} className="text-mute2" />{l}</span>
                <span className="font-cond font-bold text-cream">{v}</span>
              </div>
            ))}
          </div>
          <Button variant="secondary" className="w-full mt-5" iconRight="arrowRight" onClick={() => setView("ranking")}>Ver ranking completo</Button>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- MATA-MATA (bracket interativo) ---------------- */
const R16_SEEDS = [
  "Brasil","Suíça","Argentina","Holanda","Espanha","Croácia","França","Japão",
  "Inglaterra","Senegal","Portugal","México","Alemanha","Uruguai","Bélgica","Marrocos",
];
const ROUND_NAMES = ["Oitavas", "Quartas", "Semifinal", "Final"];

function BracketSlot({ name, picked, onClick, dim }) {
  return (
    <button onClick={onClick} disabled={!name}
      className={`w-full flex items-center gap-2 px-2.5 h-9 rounded-md border text-left transition
        ${!name ? "border-dashed border-edge/60 text-mute2 cursor-default"
          : picked ? "bg-grass-dim border-grass/50"
          : "bg-bg/50 border-edge hover:border-grass/50 hover:bg-surface2"}`}>
      {name
        ? <TeamBadge name={name} size="sm" dim={dim && !picked} />
        : <span className="font-cond text-xs text-mute2">a definir</span>}
    </button>
  );
}

function MataMata() {
  const [winners, setWinners] = React.useState({});
  const ROUNDS = 4; // 16 -> 8 -> 4 -> 2 -> 1

  const getTeams = (round, m) => {
    if (round === 0) return [R16_SEEDS[m * 2], R16_SEEDS[m * 2 + 1]];
    return [winners[`${round - 1}-${m * 2}`], winners[`${round - 1}-${m * 2 + 1}`]];
  };

  const pick = (round, m, team) => {
    if (!team) return;
    setWinners(prev => {
      const next = { ...prev };
      next[`${round}-${m}`] = team;
      // limpar caminho descendente
      let r = round, idx = m;
      while (r < ROUNDS - 1) {
        idx = Math.floor(idx / 2); r += 1;
        delete next[`${r}-${idx}`];
      }
      return next;
    });
  };

  const matchesIn = (round) => 8 / Math.pow(2, round);
  const champion = winners[`${ROUNDS - 1}-0`];

  return (
    <div>
      <PageTitle kicker="Fase eliminatória">Mata-Mata</PageTitle>
      <p className="text-mute -mt-3 mb-5">Clique na seleção que você acha que vence cada confronto — ela avança para a próxima chave. Cada acerto vale <b className="text-grass-400">10 pts</b>.</p>

      {champion && (
        <Card className="mb-6 border-gold/40 bg-gold-dim/30 flex items-center gap-4 pop">
          <span className="text-gold"><Icon name="crown" size={28} /></span>
          <div>
            <div className="font-cond text-mute text-xs tracking-widest uppercase">Seu campeão</div>
            <div className="font-display text-2xl text-gold-400">{champion}</div>
          </div>
          <button onClick={() => setWinners({})} className="ml-auto font-cond text-sm text-mute hover:text-cream flex items-center gap-1.5"><Icon name="refresh" size={15} />Recomeçar</button>
        </Card>
      )}

      <Card pad={false} className="p-4 sm:p-6 overflow-x-auto">
        <div className="flex gap-4 sm:gap-6 min-w-[760px]">
          {Array.from({ length: ROUNDS }).map((_, round) => (
            <div key={round} className="flex-1 flex flex-col">
              <div className="font-cond font-semibold text-grass-400 text-xs tracking-widest uppercase text-center mb-3">{ROUND_NAMES[round]}</div>
              <div className="flex-1 flex flex-col justify-around gap-3">
                {Array.from({ length: matchesIn(round) }).map((__, m) => {
                  const [t1, t2] = getTeams(round, m);
                  const w = winners[`${round}-${m}`];
                  return (
                    <div key={m} className="bg-surface2/50 border border-edge rounded-lg p-1.5 space-y-1">
                      <BracketSlot name={t1} picked={w === t1} dim={!!w} onClick={() => pick(round, m, t1)} />
                      <BracketSlot name={t2} picked={w === t2} dim={!!w} onClick={() => pick(round, m, t2)} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Coluna do troféu */}
          <div className="flex flex-col items-center justify-center w-20 shrink-0">
            <div className="font-cond font-semibold text-gold text-xs tracking-widest uppercase mb-3">Taça</div>
            <div className={`w-16 h-16 rounded-full grid place-items-center border-2 transition ${champion ? "border-gold bg-gold-dim text-gold pop" : "border-edge text-mute2"}`}>
              <Icon name="trophy" size={30} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- ADMIN ---------------- */
function AdminTile({ icon, value, label, tone }) {
  const c = tone === "gold" ? "text-gold" : tone === "amber" ? "text-gold-400" : tone === "red" ? "text-danger" : "text-grass-400";
  return (
    <Card className="flex items-center gap-4">
      <span className={`w-11 h-11 rounded-xl grid place-items-center bg-surface2 border border-edge ${c}`}><Icon name={icon} size={22} /></span>
      <div>
        <div className="font-display text-3xl text-cream leading-none">{value}</div>
        <div className="font-cond text-mute text-xs tracking-wide mt-1.5">{label}</div>
      </div>
    </Card>
  );
}

function Admin({ allUsers, togglePaid }) {
  const [toast, setToast] = React.useState(null);
  const [busy, setBusy] = React.useState(null);

  const total = allUsers.length;
  const paid = allUsers.filter(u => u.paid).length;
  const pending = total - paid;

  const run = (key, label) => {
    setBusy(key);
    setTimeout(() => { setBusy(null); setToast(label); setTimeout(() => setToast(null), 2600); }, 1100);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Badge tone="red" icon="shield">Acesso restrito</Badge>
      </div>
      <PageTitle kicker="Controle do bolão">Painel Admin</PageTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 -mt-2">
        <AdminTile icon="users" value={total} label="USUÁRIOS CADASTRADOS" />
        <AdminTile icon="wallet" value={paid} label="INSCRIÇÕES PAGAS" tone="gold" />
        <AdminTile icon="alert" value={pending} label="PAGAMENTOS PENDENTES" tone="amber" />
        <AdminTile icon="ball" value={TOTAL_MATCHES} label="JOGOS NO BANCO" />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <Button variant="secondary" size="lg" icon="refresh" disabled={busy} onClick={() => run("res", "Resultados reais atualizados.")}>
          {busy === "res" ? "Atualizando..." : "Atualizar Resultados Reais"}
        </Button>
        <Button variant="primary" size="lg" icon="calculator" disabled={busy} onClick={() => run("calc", "Pontuações recalculadas para todos.")}>
          {busy === "calc" ? "Calculando..." : "Calcular Pontuações"}
        </Button>
      </div>

      <Card pad={false} className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-edge flex items-center justify-between">
          <h2 className="font-display text-lg text-cream">Participantes</h2>
          <span className="font-cond text-mute2 text-sm">{total} no total</span>
        </div>
        <div className="grid grid-cols-[1fr_72px_110px_88px] sm:grid-cols-[1fr_100px_130px_100px] px-5 py-2.5 border-b border-edge bg-surface2/40">
          {["Participante","Total","Status","Ação"].map((h, i) => (
            <span key={h} className={`font-cond font-semibold text-mute2 text-xs tracking-widest uppercase ${i===1?"text-right":""}`}>{h}</span>
          ))}
        </div>
        {allUsers.map(u => (
          <div key={u.handle || u.user} className="grid grid-cols-[1fr_72px_110px_88px] sm:grid-cols-[1fr_100px_130px_100px] items-center px-5 py-3 border-b border-edge/40 last:border-0 hover:bg-surface2/30 transition">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 shrink-0 rounded-full bg-surface2 border border-edge grid place-items-center font-display text-xs text-cream">{u.name[0]}</span>
              <div className="min-w-0">
                <div className="font-cond font-bold text-cream truncate text-sm">{u.name}</div>
                <div className="text-mute2 text-xs truncate">{u.handle || u.user}</div>
              </div>
            </div>
            <span className="text-right font-cond font-bold text-cream text-sm">{u.groupPts + u.awardPts}</span>
            <div>{u.paid ? <Badge tone="green" icon="check">Pago</Badge> : <Badge tone="amber" icon="clock">Pendente</Badge>}</div>
            <button onClick={() => togglePaid(u)} className="font-cond text-xs font-semibold text-mute hover:text-grass-400 transition text-left">
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

Object.assign(window, { Ranking, Desempenho, MataMata, Admin });
