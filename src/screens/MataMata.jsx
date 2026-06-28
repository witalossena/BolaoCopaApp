import { useState, useRef } from 'react';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { PageTitle } from '../components/ui/PageTitle';
import { TeamBadge } from '../components/ui/TeamBadge';
import { predictionService } from '../services/api';

const PHASES = [
  { key: 'r32',   label: '16avos',   prefix: 'ko_r32_',  total: 16 },
  { key: 'r16',   label: 'Oitavas',  prefix: 'ko_r16_',  total: 8  },
  { key: 'qf',    label: 'Quartas',  prefix: 'ko_qf_',   total: 4  },
  { key: 'sf',    label: 'Semifinal',prefix: 'ko_sf_',   total: 2  },
  { key: 'final', label: 'Final',    prefix: 'ko_final', total: 1  },
];

function externalIdToKey(externalId) {
  if (!externalId) return null;
  const r32 = externalId.match(/^ko_r32_(\d+)$/);
  if (r32) return `0-${r32[1]}`;
  const r16 = externalId.match(/^ko_r16_(\d+)$/);
  if (r16) return `1-${r16[1]}`;
  const qf = externalId.match(/^ko_qf_(\d+)$/);
  if (qf) return `2-${qf[1]}`;
  const sf = externalId.match(/^ko_sf_(\d+)$/);
  if (sf) return `3-${sf[1]}`;
  if (externalId === 'ko_final') return '4-0';
  return null;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }) +
    ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
}

function KnockoutMatchRow({ match, score, winner, onScore, onWinner, resolution, onResolution, locked }) {
  const homeRef = useRef();
  const awayRef = useRef();
  const [dirty, setDirty] = useState(false);
  const isLocked = match.status === 'locked' || match.status === 'live';
  const home = match.homeTeam;
  const away = match.awayTeam;
  const hasHome = home && home !== 'A definir';
  const hasAway = away && away !== 'A definir';
  const canPick = hasHome && hasAway && !isLocked;

  const hNum = score?.h !== '' && score?.h != null ? parseInt(score.h, 10) : null;
  const aNum = score?.a !== '' && score?.a != null ? parseInt(score.a, 10) : null;
  const isTied = hNum != null && aNum != null && hNum === aNum;
  const needsResolution = isTied;

  const submit = (w, h, a, res) => {
    if (!match.id) return;
    const hv = h !== '' && h != null ? parseInt(h, 10) : null;
    const av = a !== '' && a != null ? parseInt(a, 10) : null;
    predictionService.submitKnockoutPrediction(match.id, w, hv, av, res ?? null)
      .catch(err => console.error('[MataMata] submit failed:', err));
  };

  const handleSave = () => {
    if (!canPick) return;
    const h = homeRef.current?.value;
    const a = awayRef.current?.value;
    if ((h === '' || h == null) && (a === '' || a == null)) return;
    const hFinal = h !== '' && h != null ? h : '0';
    const aFinal = a !== '' && a != null ? a : '0';
    if (h === '' || h == null) onScore('h', '0');
    if (a === '' || a == null) onScore('a', '0');
    const hv = parseInt(hFinal, 10);
    const av = parseInt(aFinal, 10);
    let resolvedWinner = winner;
    let res = resolution ?? 'Normal';
    if (hv > av) { resolvedWinner = home; res = 'Normal'; }
    else if (av > hv) { resolvedWinner = away; res = 'Normal'; }
    // tied: need resolution before saving
    if (hv === av && !resolution) return;
    if (!resolvedWinner) return;
    if (resolvedWinner !== winner) onWinner(resolvedWinner);
    if (res !== resolution) onResolution(res);
    submit(resolvedWinner, hFinal, aFinal, res);
    setDirty(false);
  };

  const pickWinner = (team) => {
    if (!canPick) return;
    onWinner(team);
    setDirty(false);
    submit(team, score?.h, score?.a, resolution ?? (needsResolution ? 'Penalties' : 'Normal'));
  };

  const pickResolution = (res) => {
    if (!canPick) return;
    onResolution(res);
    if (res === 'Normal') {
      // can't have normal resolution with tied 90min score — ignore
      return;
    }
    if (winner) submit(winner, score?.h, score?.a, res);
  };

  const inputCls = `w-12 h-11 text-center text-lg font-cond font-bold rounded-lg border outline-none transition
    ${isLocked
      ? 'bg-bg/40 border-edge/60 text-mute2 cursor-not-allowed'
      : 'bg-bg/70 border-edge text-cream focus:border-grass focus:ring-2 focus:ring-grass/25'}`;

  return (
    <div className={`flex flex-col border-b border-edge/30 last:border-0 ${isLocked ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-3 py-3">
        <div className="w-14 shrink-0 text-center">
          <div className="font-cond text-mute2 text-[10px] leading-tight">{formatDate(match.matchDate)}</div>
        </div>

        <button
          onClick={() => pickWinner(home)}
          disabled={!canPick}
          className={`shrink-0 sm:flex-1 flex items-center justify-end gap-2 rounded-lg px-2 py-1 transition
            ${winner === home ? 'bg-grass-dim/30 ring-1 ring-grass/40' : canPick ? 'hover:bg-surface2/60' : ''}
            ${!hasHome ? 'opacity-40 cursor-default' : ''}`}>
          <span className={`font-cond font-semibold text-sm truncate text-right hidden sm:block ${winner === home ? 'text-grass-400' : 'text-cream'}`}>
            {home || 'A definir'}
          </span>
          {hasHome
            ? <TeamBadge name={home} showName={false} dim={!!winner && winner !== home} />
            : <span className="w-7 h-7 rounded-md bg-surface2 border border-dashed border-edge/50 inline-block" />}
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <input ref={homeRef} type="number" min="0" max="20" disabled={isLocked}
            value={score?.h ?? ''}
            onChange={e => { onScore('h', e.target.value === '' ? '' : String(Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)))); setDirty(true); }}
            placeholder={isLocked ? '–' : '0'}
            className={inputCls} />
          <span className="text-mute2 font-cond text-sm">×</span>
          <input ref={awayRef} type="number" min="0" max="20" disabled={isLocked}
            value={score?.a ?? ''}
            onChange={e => { onScore('a', e.target.value === '' ? '' : String(Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)))); setDirty(true); }}
            placeholder={isLocked ? '–' : '0'}
            className={inputCls} />
        </div>

        <button
          onClick={() => pickWinner(away)}
          disabled={!canPick}
          className={`shrink-0 sm:flex-1 flex items-center gap-2 rounded-lg px-2 py-1 transition
            ${winner === away ? 'bg-grass-dim/30 ring-1 ring-grass/40' : canPick ? 'hover:bg-surface2/60' : ''}
            ${!hasAway ? 'opacity-40 cursor-default' : ''}`}>
          {hasAway
            ? <TeamBadge name={away} showName={false} dim={!!winner && winner !== away} />
            : <span className="w-7 h-7 rounded-md bg-surface2 border border-dashed border-edge/50 inline-block" />}
          <span className={`font-cond font-semibold text-sm truncate hidden sm:block ${winner === away ? 'text-grass-400' : 'text-cream'}`}>
            {away || 'A definir'}
          </span>
        </button>

        <div className="w-6 shrink-0 flex justify-center">
          {winner && <Icon name="check" size={14} className="text-grass-400" />}
        </div>
      </div>

      {(needsResolution || dirty) && canPick && (
        <div className="flex items-center gap-2 pb-3 pl-16 flex-wrap">
          {needsResolution && ['ExtraTime', 'Penalties'].map(res => (
            <button
              key={res}
              onClick={() => pickResolution(res)}
              className={`px-3 py-1 rounded-lg font-cond text-xs font-semibold transition border
                ${resolution === res
                  ? 'bg-gold-dim/40 border-gold/50 text-gold-400'
                  : 'border-edge text-mute hover:text-cream hover:bg-surface2/60'}`}>
              {res === 'ExtraTime' ? 'Prorrogação' : 'Pênaltis'}
            </button>
          ))}
          {dirty && !(needsResolution && !resolution) && (
            <button
              onClick={handleSave}
              className="px-3 py-1 rounded-lg bg-grass text-bg font-cond text-xs font-bold transition hover:bg-grass/80 active:scale-95">
              Salvar placar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function MataMata({ matchIdMap = {}, knockoutMatches = [], winners = {}, setWinners, koScores = {}, setKoScores = () => {}, koResolutions = {}, setKoResolutions = () => {}, tournamentPhase = 'GroupStage', locked = false }) {
  const [phase, setPhase] = useState('r32');

  if (tournamentPhase === 'GroupStage' || tournamentPhase === 'PreTournament') {
    return (
      <div>
        <PageTitle kicker="Fase eliminatória">Mata-Mata</PageTitle>
        <Card className="flex flex-col items-center justify-center py-16 gap-4 text-center border-edge/60">
          <div className="w-14 h-14 rounded-2xl bg-surface2 border border-edge grid place-items-center text-mute2">
            <Icon name="lock" size={28} />
          </div>
          <div>
            <div className="font-display text-lg text-cream mb-1">Fase de Grupos em andamento</div>
            <div className="font-cond text-mute2 text-sm max-w-xs">Os palpites do Mata-Mata serão liberados após o encerramento da fase de grupos.</div>
          </div>
        </Card>
      </div>
    );
  }

  const activePhase = PHASES.find(p => p.key === phase) || PHASES[0];

  const phaseMatches = knockoutMatches
    .filter(m => phase === 'final' ? m.externalId === 'ko_final' : m.externalId.startsWith(activePhase.prefix))
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));

  const handleScore = (externalId, side, val) => {
    const key = externalIdToKey(externalId);
    if (!key) return;
    setKoScores(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [side]: val } }));
  };

  const handleWinner = (externalId, team) => {
    const key = externalIdToKey(externalId);
    if (!key) return;
    setWinners(prev => ({ ...prev, [key]: team }));
  };

  const handleResolution = (externalId, res) => {
    const key = externalIdToKey(externalId);
    if (!key) return;
    setKoResolutions(prev => ({ ...prev, [key]: res }));
  };

  const champion = winners['4-0'];

  return (
    <div>
      <PageTitle kicker="Fase eliminatória">Mata-Mata</PageTitle>
      <p className="text-mute -mt-3 mb-5">
        Clique no time vencedor e preencha o placar.
        Acerto vale <b className="text-grass-400">15 pts</b>. Com placar exato: <b className="text-gold">20 pts</b>.
      </p>

      {champion && (
        <Card className="mb-6 border-gold/40 bg-gold-dim/30 flex items-center gap-4">
          <span className="text-gold"><Icon name="crown" size={28} /></span>
          <div>
            <div className="font-cond text-mute text-xs tracking-widest uppercase">Seu campeão</div>
            <div className="font-display text-2xl text-gold-400">{champion}</div>
          </div>
        </Card>
      )}

      {/* Phase tabs */}
      <div className="flex gap-1 mb-4 bg-surface2/40 rounded-xl p-1 border border-edge">
        {PHASES.map(p => {
          const phaseMatchCount = knockoutMatches.filter(m =>
            p.key === 'final' ? m.externalId === 'ko_final' : m.externalId.startsWith(p.prefix)
          ).length;
          const disabled = phaseMatchCount === 0;
          return (
            <button
              key={p.key}
              onClick={() => !disabled && setPhase(p.key)}
              disabled={disabled}
              className={`flex-1 py-1.5 px-2 rounded-lg font-cond text-xs font-semibold tracking-wide transition
                ${phase === p.key
                  ? 'bg-grass text-bg shadow'
                  : disabled
                    ? 'text-mute2/40 cursor-not-allowed'
                    : 'text-mute hover:text-cream hover:bg-surface2'}`}>
              {p.label}
            </button>
          );
        })}
      </div>

      <Card pad={false} className="px-4 py-1">
        {phaseMatches.length === 0 ? (
          <div className="py-12 text-center font-cond text-mute2">Jogos desta fase ainda não definidos.</div>
        ) : (
          phaseMatches.map(match => {
            const key = externalIdToKey(match.externalId);
            return (
              <KnockoutMatchRow
                key={match.externalId}
                match={match}
                score={key ? koScores[key] : undefined}
                winner={key ? winners[key] : undefined}
                onScore={(side, val) => handleScore(match.externalId, side, val)}
                onWinner={(team) => handleWinner(match.externalId, team)}
                resolution={key ? koResolutions[key] : undefined}
                onResolution={(res) => handleResolution(match.externalId, res)}
                locked={locked}
              />
            );
          })
        )}
      </Card>
    </div>
  );
}
