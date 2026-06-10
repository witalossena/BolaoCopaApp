import { MATCHES, GROUPS, SPECIAL_FIELDS, GROUP_ORDER } from '../data';

const BACKEND_KEYS = {
  campeao: 'champion', vice: 'runnerUp', terceiro: 'thirdPlace',
  artilheiro: 'topScorer', assist: 'mostAssists', mvp: 'mvp', goldenboy: 'goldenBoy',
};

const GROUP_MATCHES = MATCHES.filter(m => m.group);

function StatBox({ label, done, total }) {
  const complete = total != null && done >= total;
  const missing = total != null && done < total;
  const border = complete ? '#86efac' : missing ? '#fcd34d' : '#e5e7eb';
  const bg = complete ? '#f0fdf4' : missing ? '#fffbeb' : '#f9fafb';
  const color = complete ? '#15803d' : missing ? '#92400e' : '#374151';
  return (
    <div style={{ border: `1px solid ${border}`, borderRadius: 8, padding: '12px 14px', background: bg }}>
      <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>
        {done}{total != null ? `/${total}` : ''}
      </div>
      <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

export function AdminReportLayout({ usersData }) {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif", background: 'white', color: '#111' }}>
      {usersData.map(({ user, predictions }, index) => {
        const matchIds = new Set((predictions?.matchPredictions || []).map(p => p.externalId));
        const groupIds = new Set((predictions?.groupRanks || []).map(r => r.group));
        const knockoutPreds = predictions?.knockoutPredictions || [];
        const specials = predictions?.specials || {};

        const missingMatches = GROUP_MATCHES.filter(m => !matchIds.has(m.id));
        const missingGroups = GROUPS.filter(g => !groupIds.has(g.id));
        const presentSpecials = SPECIAL_FIELDS.filter(f => specials[BACKEND_KEYS[f.key]]);
        const missingSpecials = SPECIAL_FIELDS.filter(f => !specials[BACKEND_KEYS[f.key]]);
        const missingCount = missingMatches.length + missingGroups.length + missingSpecials.length;

        return (
          <div
            key={user.id}
            style={{
              padding: '28px 32px',
              pageBreakAfter: index < usersData.length - 1 ? 'always' : 'auto',
              breakAfter: index < usersData.length - 1 ? 'page' : 'auto',
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: '3px solid #16a34a', paddingBottom: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#9ca3af', marginBottom: 4 }}>
                  Copa do Mundo 2026 — Relatório de Apostas
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{user.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginTop: 2 }}>@{user.handle}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 6 }}>Gerado em {now}</div>
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: user.isPaid ? '#15803d' : '#92400e',
                  background: user.isPaid ? '#dcfce7' : '#fef3c7',
                  border: `1px solid ${user.isPaid ? '#86efac' : '#fcd34d'}`,
                  padding: '3px 10px', borderRadius: 999, display: 'inline-block',
                }}>
                  {user.isPaid ? '✓ PAGO' : '⏳ PENDENTE'}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
              <StatBox label="Partidas apostadas" done={matchIds.size} total={GROUP_MATCHES.length} />
              <StatBox label="Grupos classificados" done={groupIds.size} total={GROUPS.length} />
              <StatBox label="Especiais" done={presentSpecials.length} total={SPECIAL_FIELDS.length} />
            </div>

            {/* Missing */}
            {missingCount > 0 && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 16px', marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c2410c', marginBottom: 10 }}>
                  ⚠ Apostas Faltando ({missingCount})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: missingMatches.length > 0 ? '2fr 1fr 1fr' : 'repeat(2, 1fr)', gap: 16 }}>
                  {missingMatches.length > 0 && (
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                        Partidas ({missingMatches.length})
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px' }}>
                        {missingMatches.map(m => (
                          <div key={m.id} style={{ fontSize: 10, color: '#7c2d12' }}>
                            <span style={{ fontWeight: 700 }}>{m.homeCode}</span>
                            <span style={{ color: '#d1d5db' }}> × </span>
                            <span style={{ fontWeight: 700 }}>{m.awayCode}</span>
                            <span style={{ color: '#9ca3af', fontSize: 9 }}> (G{m.group})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {missingGroups.length > 0 && (
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                        Classificações ({missingGroups.length})
                      </div>
                      {missingGroups.map(g => (
                        <div key={g.id} style={{ fontSize: 10, color: '#7c2d12', marginBottom: 2 }}>
                          Grupo {g.id}
                        </div>
                      ))}
                    </div>
                  )}
                  {missingSpecials.length > 0 && (
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                        Especiais ({missingSpecials.length})
                      </div>
                      {missingSpecials.map(f => (
                        <div key={f.key} style={{ fontSize: 10, color: '#7c2d12', marginBottom: 2 }}>{f.label}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Predictions grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Left: groups */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#15803d', marginBottom: 10 }}>
                  Fase de Grupos
                </div>
                {GROUP_ORDER.map(gId => {
                  const gMatches = (predictions?.matchPredictions || []).filter(p => {
                    const m = GROUP_MATCHES.find(mm => mm.id === p.externalId);
                    return m?.group === gId;
                  });
                  const gRank = (predictions?.groupRanks || []).find(r => r.group === gId);
                  if (gMatches.length === 0 && !gRank) return null;
                  return (
                    <div key={gId} style={{ marginBottom: 8, border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ background: '#f9fafb', padding: '4px 10px', fontSize: 9, fontWeight: 700, color: '#374151', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb' }}>
                        <span>GRUPO {gId}</span>
                        {gRank
                          ? <span style={{ color: '#15803d' }}>1º {gRank.firstTeam} · 2º {gRank.secondTeam}</span>
                          : <span style={{ color: '#c2410c' }}>classificação não feita</span>}
                      </div>
                      {gMatches.length === 0
                        ? <div style={{ padding: '4px 10px', fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>Nenhuma partida apostada</div>
                        : gMatches.map(p => {
                            const m = GROUP_MATCHES.find(mm => mm.id === p.externalId);
                            return (
                              <div key={p.externalId} style={{ padding: '3px 10px', fontSize: 10, display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 4, alignItems: 'center', borderTop: '1px solid #f3f4f6' }}>
                                <span style={{ color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m?.home || p.externalId}</span>
                                <span style={{ fontWeight: 700, color: '#111', letterSpacing: '0.05em', textAlign: 'center', whiteSpace: 'nowrap' }}>{p.homeScore} × {p.awayScore}</span>
                                <span style={{ color: '#6b7280', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m?.away || ''}</span>
                              </div>
                            );
                          })}
                    </div>
                  );
                })}
                {matchIds.size === 0 && groupIds.size === 0 && (
                  <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>Nenhuma aposta de grupo registrada.</div>
                )}
              </div>

              {/* Right: knockout + specials */}
              <div>
                {knockoutPreds.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#15803d', marginBottom: 8 }}>
                      Mata-Mata ({knockoutPreds.length})
                    </div>
                    {knockoutPreds.map(k => (
                      <div key={k.externalId} style={{ fontSize: 10, padding: '4px 8px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9ca3af', fontSize: 9, textTransform: 'uppercase' }}>{k.externalId}</span>
                        <span style={{ fontWeight: 700 }}>
                          {k.winnerTeam}
                          {k.homeScore != null && ` (${k.homeScore}×${k.awayScore})`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {presentSpecials.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#92400e', marginBottom: 8 }}>
                      Prêmios Especiais
                    </div>
                    {presentSpecials.map(f => (
                      <div key={f.key} style={{ fontSize: 10, padding: '5px 10px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 5, marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#78350f' }}>{f.label}</span>
                        <span style={{ fontWeight: 700, color: '#92400e' }}>{specials[BACKEND_KEYS[f.key]]}</span>
                      </div>
                    ))}
                  </div>
                )}

                {presentSpecials.length === 0 && (
                  <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>Nenhum especial registrado.</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
