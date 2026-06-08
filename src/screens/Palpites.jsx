import { useState, useRef } from 'react';
import { GROUPS, GROUP_ORDER, TOTAL_MATCHES, LOCKED_MATCHES } from '../data';
import { predictionService } from '../services/api';
import { Icon } from '../components/Icon';
import { TeamBadge } from '../components/ui/TeamBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PointPill } from '../components/ui/PointPill';
import { PageTitle } from '../components/ui/PageTitle';
import { Select } from '../components/ui/Select';
import { TEAMS } from '../data';

function MatchRow({ match, score, onScore, matchStatuses = {}, matchIdMap = {} }) {
  const apiStatus = matchStatuses[match.id];
  const effectiveStatus = apiStatus || match.status;
  const locked = effectiveStatus === "locked";
  const soon = !locked && effectiveStatus === "soon";
  const homeRef = useRef();
  const awayRef = useRef();

  const submitIfComplete = () => {
    const matchGuid = matchIdMap[match.id];
    if (!matchGuid) return;
    let h = homeRef.current?.value;
    let a = awayRef.current?.value;
    const hFilled = h !== "" && h != null;
    const aFilled = a !== "" && a != null;
    if (!hFilled && !aFilled) return;
    if (hFilled && !aFilled) { a = "0"; onScore("a", "0"); }
    if (aFilled && !hFilled) { h = "0"; onScore("h", "0"); }
    predictionService.submitMatchPrediction(matchGuid, parseInt(h, 10), parseInt(a, 10))
      .catch(console.error);
  };

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

      <div className="shrink-0 sm:flex-1 flex items-center justify-end gap-2">
        <span className="font-cond font-semibold text-cream text-sm truncate text-right hidden sm:block">{match.home}</span>
        <TeamBadge name={match.home} showName={false} />
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <input ref={homeRef} type="number" min="0" max="20" disabled={locked}
          value={score?.h ?? ""} onChange={e => onScore("h", e.target.value)} onBlur={submitIfComplete}
          placeholder={locked ? "–" : "0"} className={inputCls} />
        <span className="text-mute2 font-cond text-sm">×</span>
        <input ref={awayRef} type="number" min="0" max="20" disabled={locked}
          value={score?.a ?? ""} onChange={e => onScore("a", e.target.value)} onBlur={submitIfComplete}
          placeholder={locked ? "–" : "0"} className={inputCls} />
      </div>

      <div className="shrink-0 sm:flex-1 flex items-center gap-2">
        <TeamBadge name={match.away} showName={false} />
        <span className="font-cond font-semibold text-cream text-sm truncate hidden sm:block">{match.away}</span>
      </div>

      <div className="shrink-0 flex justify-end w-6 sm:w-28">
        {locked && (() => {
          const hasH = score?.h !== "" && score?.h != null;
          const hasA = score?.a !== "" && score?.a != null;
          const incomplete = (hasH || hasA) && !(hasH && hasA);
          return incomplete ? (
            <>
              <span className="sm:hidden text-gold"><Icon name="alert" size={14} /></span>
              <span className="hidden sm:block"><Badge tone="amber" icon="alert">Incompleto</Badge></span>
            </>
          ) : (
            <>
              <span className="sm:hidden text-mute2"><Icon name="lock" size={14} /></span>
              <span className="hidden sm:block"><Badge tone="locked" icon="lock">Encerrada</Badge></span>
            </>
          );
        })()}
        {soon && (
          <>
            <span className="sm:hidden text-gold"><Icon name="clock" size={14} /></span>
            <span className="hidden sm:block"><Badge tone="amber" icon="clock">{match.statusLabel}</Badge></span>
          </>
        )}
        {!locked && !soon && <span className="text-mute2"><Icon name="chevronRight" size={16} /></span>}
      </div>
    </div>
  );
}

const POSITIONS = [
  { key: "first",  label: "1º lugar", icon: "crown",  colorCls: "text-gold",       tone: "gold"   },
  { key: "second", label: "2º lugar", icon: "medal",  colorCls: "text-grass-400",  tone: "green"  },
  { key: "third",  label: "3º lugar", icon: "award",  colorCls: "text-orange-400", tone: "bronze" },
  { key: "fourth", label: "4º lugar", icon: "shield", colorCls: "text-mute2",      tone: "mute"   },
];

function GroupRanks({ group, ranks, setRank }) {
  const r = ranks[group.id] || {};

  const getOpts = (currentKey) => {
    const taken = POSITIONS
      .filter(p => p.key !== currentKey)
      .map(p => r[p.key])
      .filter(Boolean);
    return group.teams
      .filter(t => !taken.includes(t))
      .map(t => <option key={t} value={t}>{TEAMS[t]} · {t}</option>);
  };

  const handleChange = (key, val) => {
    setRank(group.id, key, val);
    const updated = { ...r, [key]: val };
    const { first, second, third, fourth } = updated;
    if (first && second) {
      predictionService.submitGroupRankPrediction(group.id, first, second, third, fourth).catch(console.error);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-edge/60 grid sm:grid-cols-2 gap-3">
      {POSITIONS.map(({ key, label, icon, colorCls, tone }) => (
        <div key={key} className="bg-bg/40 rounded-xl border border-edge p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cond font-semibold text-sm flex items-center gap-1.5">
              <span className={colorCls}>
                <Icon name={icon} size={15} />
              </span>
              {label}
            </span>
            <PointPill pts={20} tone={tone} />
          </div>
          <Select value={r[key] || ""} placeholder="Quem se classifica?"
            onChange={e => handleChange(key, e.target.value)}>
            {getOpts(key)}
          </Select>
        </div>
      ))}
    </div>
  );
}

function buildWhatsAppText(scores, ranks) {
  const lines = ["*Meus Palpites - Copa do Mundo 2026* ⚽\n"];

  for (const gId of GROUP_ORDER) {
    const group = GROUPS.find(g => g.id === gId);
    const groupLines = [];

    for (const m of group.matches) {
      const s = scores[m.id];
      if (s && s.h !== "" && s.h != null && s.a !== "" && s.a != null) {
        groupLines.push(`${m.home} ${s.h} × ${s.a} ${m.away}`);
      }
    }

    const r = ranks[gId];
    const hasRanks = r?.first || r?.second;

    if (groupLines.length > 0 || hasRanks) {
      lines.push(`*-- GRUPO ${gId} --*`);
      groupLines.forEach(l => lines.push(l));
      if (hasRanks) {
        lines.push(`1º ${r.first || "?"}  |  2º ${r.second || "?"}`);
        if (r.third || r.fourth) {
          lines.push(`3º ${r.third || "?"}  |  4º ${r.fourth || "?"}`);
        }
      }
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

export function Palpites({ scores, setScore, ranks, setRank, matchStatuses = {}, matchIdMap = {} }) {
  const [active, setActive] = useState("A");
  const group = GROUPS.find(g => g.id === active);
  const idx = GROUP_ORDER.indexOf(active);

  const handleShareWhatsApp = () => {
    const text = buildWhatsAppText(scores, ranks);
    if (!text || text === "🏆 *Meus Palpites - Copa do Mundo 2026*") return;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

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
              onScore={(side, val) => setScore(m.id, side, val)} matchStatuses={matchStatuses} matchIdMap={matchIdMap} />
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

      <div className="mt-4 flex justify-end">
        <button onClick={handleShareWhatsApp}
          className="flex items-center gap-2 px-4 h-10 rounded-xl font-cond font-semibold text-sm border border-edge bg-surface2 text-cream hover:border-[#25D366] hover:text-[#25D366] transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          Compartilhar palpites
        </button>
      </div>
    </div>
  );
}
