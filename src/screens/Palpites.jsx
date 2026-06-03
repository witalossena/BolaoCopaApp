import { useState } from 'react';
import { GROUPS, GROUP_ORDER, TOTAL_MATCHES, LOCKED_MATCHES } from '../data';
import { Icon } from '../components/Icon';
import { TeamBadge } from '../components/ui/TeamBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PointPill } from '../components/ui/PointPill';
import { PageTitle } from '../components/ui/PageTitle';
import { Select } from '../components/ui/Select';
import { TEAMS } from '../data';

function MatchRow({ match, score, onScore, matchStatuses = {} }) {
  const apiStatus = matchStatuses[match.id];
  const effectiveStatus = apiStatus || match.status;
  const locked = effectiveStatus === "locked";
  const soon = !locked && effectiveStatus === "soon";

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
        <span className="font-cond font-semibold text-cream text-sm truncate text-right hidden sm:block">{match.home}</span>
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
        <span className="font-cond font-semibold text-cream text-sm truncate hidden sm:block">{match.away}</span>
      </div>

      <div className="shrink-0 flex justify-end sm:w-24">
        {locked && <Badge tone="locked" icon="lock">Encerrada</Badge>}
        {soon && <Badge tone="amber" icon="clock">{match.statusLabel}</Badge>}
        {match.status === "open" && <span className="text-mute2"><Icon name="chevronRight" size={16} /></span>}
      </div>
    </div>
  );
}

function GroupRanks({ group, ranks, setRank }) {
  const r = ranks[group.id] || {};
  const opts = (exclude) => group.teams
    .filter(t => t !== exclude)
    .map(t => <option key={t} value={t}>{TEAMS[t]} · {t}</option>);

  return (
    <div className="mt-4 pt-4 border-t border-edge/60 grid sm:grid-cols-2 gap-3">
      {[["first", "1º lugar", "gold"], ["second", "2º lugar", "green"]].map(([key, label, tone]) => (
        <div key={key} className="bg-bg/40 rounded-xl border border-edge p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cond font-semibold text-sm flex items-center gap-1.5">
              <span className={tone === "gold" ? "text-gold" : "text-grass-400"}>
                <Icon name={tone === "gold" ? "crown" : "medal"} size={15} />
              </span>
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

export function Palpites({ scores, setScore, ranks, setRank, matchStatuses = {} }) {
  const [active, setActive] = useState("A");
  const group = GROUPS.find(g => g.id === active);
  const idx = GROUP_ORDER.indexOf(active);

  const filledScores = Object.values(scores).filter(s => s && s.h !== "" && s.h != null && s.a !== "" && s.a != null).length;
  const filledRanks = GROUP_ORDER.filter(g => ranks[g]?.first && ranks[g]?.second).length;

  return (
    <div>
      <PageTitle kicker="Fase de grupos">Meus Palpites</PageTitle>

      <div className="grid sm:grid-cols-3 gap-3 mb-6 -mt-2">
        <Card pad={false} className="p-4 flex items-center gap-3">
          <span className="text-grass-400"><Icon name="ball" size={22} /></span>
          <div>
            <div className="font-display text-2xl text-cream leading-none">
              {filledScores}<span className="text-mute2 text-base">/{TOTAL_MATCHES}</span>
            </div>
            <div className="font-cond text-mute text-xs tracking-wide mt-1">PLACARES PREENCHIDOS</div>
          </div>
        </Card>
        <Card pad={false} className="p-4 flex items-center gap-3">
          <span className="text-gold"><Icon name="medal" size={22} /></span>
          <div>
            <div className="font-display text-2xl text-cream leading-none">
              {filledRanks}<span className="text-mute2 text-base">/12</span>
            </div>
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

      <div className="flex flex-wrap gap-1.5 mb-5">
        {GROUP_ORDER.map(g => {
          const done = ranks[g]?.first && ranks[g]?.second;
          return (
            <button key={g} onClick={() => setActive(g)}
              className={`w-10 h-10 rounded-xl font-cond font-bold text-sm border transition-all relative
                ${active === g
                  ? "bg-grass text-bg border-grass"
                  : "bg-surface2 text-mute border-edge hover:text-cream hover:border-edge2"}`}>
              {g}
              {done && active !== g && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-grass-400 border-2 border-bg" />
              )}
            </button>
          );
        })}
      </div>

      <Card accent key={active} className="fade-in">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl text-grass-400">Grupo {group.id}</span>
            <span className="font-cond text-mute2 text-sm">{group.teams.length} seleções · 6 jogos</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActive(GROUP_ORDER[(idx + 11) % 12])}
              className="w-9 h-9 grid place-items-center rounded-lg bg-surface2 border border-edge text-mute hover:text-cream hover:border-edge2 transition">
              <Icon name="chevronLeft" size={18} />
            </button>
            <button onClick={() => setActive(GROUP_ORDER[(idx + 1) % 12])}
              className="w-9 h-9 grid place-items-center rounded-lg bg-surface2 border border-edge text-mute hover:text-cream hover:border-edge2 transition">
              <Icon name="chevronRight" size={18} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-edge/40 mt-2">
          {group.matches.map(m => (
            <MatchRow key={m.id} match={m} score={scores[m.id]}
              onScore={(side, val) => setScore(m.id, side, val)} matchStatuses={matchStatuses} />
          ))}
        </div>

        <GroupRanks group={group} ranks={ranks} setRank={setRank} />
      </Card>

      <div className="flex items-center justify-between mt-5 gap-3 flex-wrap">
        <p className="text-mute2 text-sm flex items-center gap-2">
          <Icon name="checkCircle" size={16} className="text-grass-400" />
          Seus palpites são salvos automaticamente.
        </p>
        <Button variant="secondary" iconRight="arrowRight"
          onClick={() => setActive(GROUP_ORDER[(idx + 1) % 12])}>
          Próximo grupo
        </Button>
      </div>
    </div>
  );
}
