/* ============================================================
   TELAS — Meus Palpites (grupos) + Palpites Especiais
   ============================================================ */

const STAR_PLAYERS = [
  "Kylian Mbappé","Vinícius Júnior","Erling Haaland","Jude Bellingham","Lionel Messi",
  "Lamine Yamal","Harry Kane","Rodrygo","Pedri","Florian Wirtz","Bukayo Saka",
  "Phil Foden","Rafael Leão","Julián Álvarez","Federico Valverde","Cristiano Ronaldo",
];

/* ---------- Linha de jogo ---------- */
function MatchRow({ match, score, onScore }) {
  const locked = match.status === "locked";
  const soon = match.status === "soon";

  const inputCls = `w-12 h-11 text-center text-lg font-cond font-bold rounded-lg border outline-none transition
    ${locked
      ? "bg-bg/40 border-edge/60 text-mute2 cursor-not-allowed"
      : "bg-bg/70 border-edge text-cream focus:border-grass focus:ring-2 focus:ring-grass/25"}`;

  return (
    <div className={`flex items-center gap-3 py-3 ${locked ? "opacity-70" : ""}`}>
      <div className="w-12 shrink-0 text-center">
        <div className="font-cond font-bold text-cream text-sm leading-none">{match.dateLabel.split(" ")[0]}</div>
        <div className="font-cond text-mute2 text-[10px] tracking-widest">{match.dateLabel.split(" ")[1]}</div>
      </div>

      <div className="flex-1 flex items-center justify-end min-w-0 gap-2">
        <span className="font-cond font-semibold text-cream text-sm truncate text-right hidden xs:block sm:block">{match.home}</span>
        <TeamBadge name={match.home} showName={false} />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <input type="number" min="0" max="20" disabled={locked}
          value={score?.h ?? ""} onChange={e => onScore("h", e.target.value)}
          placeholder={locked ? "–" : "0"} className={inputCls} />
        <span className="text-mute2 font-cond text-sm">×</span>
        <input type="number" min="0" max="20" disabled={locked}
          value={score?.a ?? ""} onChange={e => onScore("a", e.target.value)}
          placeholder={locked ? "–" : "0"} className={inputCls} />
      </div>

      <div className="flex-1 flex items-center min-w-0 gap-2">
        <TeamBadge name={match.away} showName={false} />
        <span className="font-cond font-semibold text-cream text-sm truncate">{match.away}</span>
      </div>

      <div className="w-24 shrink-0 flex justify-end">
        {locked && <Badge tone="locked" icon="lock">Encerrada</Badge>}
        {soon && <Badge tone="amber" icon="clock">{match.statusLabel}</Badge>}
        {match.status === "open" && <span className="text-mute2"><Icon name="chevronRight" size={16} /></span>}
      </div>
    </div>
  );
}

/* ---------- Seletor de classificados de um grupo ---------- */
function GroupRanks({ group, ranks, setRank }) {
  const r = ranks[group.id] || {};
  const opts = (exclude) => group.teams.filter(t => t !== exclude).map(t =>
    <option key={t} value={t}>{TEAMS[t]} · {t}</option>);

  return (
    <div className="mt-4 pt-4 border-t border-edge/60 grid sm:grid-cols-2 gap-3">
      {[["first","1º lugar","gold"],["second","2º lugar","green"]].map(([key, label, tone]) => (
        <div key={key} className="bg-bg/40 rounded-xl border border-edge p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cond font-semibold text-sm flex items-center gap-1.5">
              <span className={tone === "gold" ? "text-gold" : "text-grass-400"}><Icon name={tone==="gold"?"crown":"medal"} size={15} /></span>
              {label}
            </span>
            <PointPill pts={10} tone={tone} />
          </div>
          <Select value={r[key] || ""} placeholder="Quem se classifica?"
            onChange={e => setRank(group.id, key, e.target.value)}>
            {opts(key === "first" ? r.second : r.first)}
          </Select>
        </div>
      ))}
    </div>
  );
}

/* ---------- Tela: Meus Palpites ---------- */
function Palpites({ scores, setScore, ranks, setRank }) {
  const [active, setActive] = React.useState("A");
  const group = GROUPS.find(g => g.id === active);
  const idx = GROUP_ORDER.indexOf(active);

  // progresso
  const filledScores = Object.values(scores).filter(s => s && s.h !== "" && s.h != null && s.a !== "" && s.a != null).length;
  const filledRanks = GROUP_ORDER.filter(g => ranks[g]?.first && ranks[g]?.second).length;

  return (
    <div>
      <PageTitle kicker="Fase de grupos">Meus Palpites</PageTitle>

      {/* Resumo de progresso */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6 -mt-2">
        <Card pad={false} className="p-4 flex items-center gap-3">
          <span className="text-grass-400"><Icon name="ball" size={22} /></span>
          <div>
            <div className="font-display text-2xl text-cream leading-none">{filledScores}<span className="text-mute2 text-base">/{TOTAL_MATCHES}</span></div>
            <div className="font-cond text-mute text-xs tracking-wide mt-1">PLACARES PREENCHIDOS</div>
          </div>
        </Card>
        <Card pad={false} className="p-4 flex items-center gap-3">
          <span className="text-gold"><Icon name="medal" size={22} /></span>
          <div>
            <div className="font-display text-2xl text-cream leading-none">{filledRanks}<span className="text-mute2 text-base">/12</span></div>
            <div className="font-cond text-mute text-xs tracking-wide mt-1">GRUPOS CLASSIFICADOS</div>
          </div>
        </Card>
        <Card pad={false} className="p-4 flex items-center gap-3">
          <span className="text-mute2"><Icon name="lock" size={22} /></span>
          <div>
            <div className="font-display text-2xl text-cream leading-none">{LOCKED_MATCHES}</div>
            <div className="font-cond text-mute text-xs tracking-wide mt-1">APOSTAS JÁ ENCERRADAS</div>
          </div>
        </Card>
      </div>

      {/* Pílulas de grupo */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {GROUP_ORDER.map(g => {
          const done = ranks[g]?.first && ranks[g]?.second;
          return (
            <button key={g} onClick={() => setActive(g)}
              className={`w-10 h-10 rounded-xl font-cond font-bold text-sm border transition-all relative
                ${active === g ? "bg-grass text-bg border-grass" : "bg-surface2 text-mute border-edge hover:text-cream hover:border-edge2"}`}>
              {g}
              {done && active !== g && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-grass-400 border-2 border-bg" />}
            </button>
          );
        })}
      </div>

      {/* Card do grupo */}
      <Card accent key={active} className="fade-in">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl text-grass-400">Grupo {group.id}</span>
            <span className="font-cond text-mute2 text-sm">{group.teams.length} seleções · 6 jogos</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActive(GROUP_ORDER[(idx + 11) % 12])} className="w-9 h-9 grid place-items-center rounded-lg bg-surface2 border border-edge text-mute hover:text-cream hover:border-edge2 transition"><Icon name="chevronLeft" size={18} /></button>
            <button onClick={() => setActive(GROUP_ORDER[(idx + 1) % 12])} className="w-9 h-9 grid place-items-center rounded-lg bg-surface2 border border-edge text-mute hover:text-cream hover:border-edge2 transition"><Icon name="chevronRight" size={18} /></button>
          </div>
        </div>

        <div className="divide-y divide-edge/40 mt-2">
          {group.matches.map(m => (
            <MatchRow key={m.id} match={m} score={scores[m.id]}
              onScore={(side, val) => setScore(m.id, side, val)} />
          ))}
        </div>

        <GroupRanks group={group} ranks={ranks} setRank={setRank} />
      </Card>

      <div className="flex items-center justify-between mt-5 gap-3 flex-wrap">
        <p className="text-mute2 text-sm flex items-center gap-2"><Icon name="checkCircle" size={16} className="text-grass-400" /> Seus palpites são salvos automaticamente.</p>
        <Button variant="secondary" iconRight="arrowRight" onClick={() => setActive(GROUP_ORDER[(idx + 1) % 12])}>Próximo grupo</Button>
      </div>
    </div>
  );
}

/* ---------- Tela: Palpites Especiais ---------- */
function SpecialCard({ field, value, onChange }) {
  return (
    <Card pad={false} className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-cond font-bold text-cream text-base flex items-center gap-2">
            <span className="text-gold"><Icon name={field.kind === "team" ? "shield" : "star"} size={16} /></span>
            {field.label}
          </h3>
          <p className="text-mute2 text-xs mt-0.5">{field.hint}</p>
        </div>
        <PointPill pts={field.pts} tone="gold" />
      </div>
      {field.kind === "team" ? (
        <Select value={value || ""} placeholder="Escolha a seleção" onChange={e => onChange(e.target.value)}>
          {ALL_TEAMS.map(t => <option key={t} value={t}>{TEAMS[t]} · {t}</option>)}
        </Select>
      ) : (
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute2"><Icon name="user" size={16} /></span>
          <input list="star-players" value={value || ""} onChange={e => onChange(e.target.value)}
            placeholder="Nome do jogador"
            className="w-full bg-bg/70 border border-edge focus:border-grass rounded-xl py-2.5 pl-10 pr-3 text-sm font-cond font-semibold text-cream placeholder-mute2 outline-none focus:ring-2 focus:ring-grass/25 transition" />
        </div>
      )}
    </Card>
  );
}

function Especiais({ specials, setSpecial }) {
  const podium = SPECIAL_FIELDS.filter(f => f.kind === "team");
  const awards = SPECIAL_FIELDS.filter(f => f.kind === "player");
  const totalPot = SPECIAL_FIELDS.reduce((s, f) => s + f.pts, 0);
  const filled = SPECIAL_FIELDS.filter(f => specials[f.key]).length;

  return (
    <div>
      <datalist id="star-players">{STAR_PLAYERS.map(p => <option key={p} value={p} />)}</datalist>

      <PageTitle kicker="Pódio &amp; premiações">Palpites Especiais</PageTitle>

      <Card pad={false} className="p-4 mb-6 -mt-2 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <span className="text-gold"><Icon name="sparkles" size={24} /></span>
          <div>
            <div className="font-cond font-semibold text-cream">Estas são as apostas que mais valem pontos.</div>
            <div className="text-mute2 text-sm">{filled} de {SPECIAL_FIELDS.length} preenchidos</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl text-gold leading-none">{totalPot}</div>
          <div className="font-cond text-mute text-xs tracking-wide">PONTOS EM JOGO</div>
        </div>
      </Card>

      <SectionLabel icon="trophy">O pódio</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {podium.map(f => <SpecialCard key={f.key} field={f} value={specials[f.key]} onChange={v => setSpecial(f.key, v)} />)}
      </div>

      <SectionLabel icon="award">Premiações individuais</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4">
        {awards.map(f => <SpecialCard key={f.key} field={f} value={specials[f.key]} onChange={v => setSpecial(f.key, v)} />)}
      </div>

      <div className="mt-6 flex items-center gap-2 text-mute2 text-sm">
        <Icon name="checkCircle" size={16} className="text-grass-400" /> Palpites salvos automaticamente. Você pode alterar até o início da Copa.
      </div>
    </div>
  );
}

Object.assign(window, { Palpites, Especiais });
