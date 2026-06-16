import { TEAMS, TEAM_TINT } from '../data';

function TeamChip({ name }) {
  const code = TEAMS[name] || name.slice(0, 3).toUpperCase();
  const tint = TEAM_TINT[code] || '#34c75e';
  return (
    <span
      className="inline-flex items-center justify-center w-12 h-8 rounded-lg font-black text-xs tracking-wider border"
      style={{ background: `${tint}22`, borderColor: `${tint}55`, color: tint }}
    >
      {code}
    </span>
  );
}

export function CravadosShareCard({ user, cravados }) {
  const count = cravados.length;

  return (
    <div
      id="cravados-share-card"
      style={{
        width: 800,
        minHeight: 800,
        background: 'linear-gradient(160deg, #0b1f13 0%, #0f2a1a 50%, #0b1a10 100%)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* bg decoration */}
      <div style={{
        position: 'absolute', top: -120, right: -120,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, #34c75e18 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -80,
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, #34c75e10 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        padding: '52px 60px 40px',
        borderBottom: '1px solid #34c75e20',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ color: '#34c75e', fontSize: 12, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 8 }}>
            Bolão Copa 2026
          </div>
          <div style={{ color: '#f0ebe0', fontSize: 42, fontWeight: 900, lineHeight: 1, letterSpacing: '-1px' }}>
            🎯 {count} {count === 1 ? 'CRAVADO' : 'CRAVADOS'}
          </div>
          <div style={{ color: '#6b9e7a', fontSize: 14, fontWeight: 600, marginTop: 10, letterSpacing: '0.05em' }}>
            placares exatos
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#f0ebe0', fontSize: 20, fontWeight: 800 }}>{user.name}</div>
          <div style={{ color: '#6b9e7a', fontSize: 13, fontWeight: 600, marginTop: 4 }}>{user.handle}</div>
        </div>
      </div>

      {/* Matches */}
      <div style={{ flex: 1, padding: '36px 60px' }}>
        {count === 0 ? (
          <div style={{ color: '#6b9e7a', textAlign: 'center', fontSize: 16, paddingTop: 60 }}>
            Nenhum placar exato ainda. Vai que vai! ⚽
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: count > 6 ? '1fr 1fr' : '1fr', gap: 16 }}>
            {cravados.map((item, i) => {
              const homeCode = TEAMS[item.homeTeam] || item.homeTeam?.slice(0, 3).toUpperCase();
              const awayCode = TEAMS[item.awayTeam] || item.awayTeam?.slice(0, 3).toUpperCase();
              const homeTint = TEAM_TINT[homeCode] || '#34c75e';
              const awayTint = TEAM_TINT[awayCode] || '#34c75e';
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: '#ffffff08',
                  border: '1px solid #34c75e18',
                  borderLeft: '3px solid #34c75e55',
                  borderRadius: 14,
                  padding: '14px 20px',
                }}>
                  {/* home */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
                    <span style={{ color: '#f0ebe0', fontSize: 15, fontWeight: 700 }}>{item.homeTeam}</span>
                    <span style={{
                      background: `${homeTint}22`, border: `1px solid ${homeTint}55`, color: homeTint,
                      padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 800, letterSpacing: '0.05em',
                    }}>{homeCode}</span>
                  </div>

                  {/* score */}
                  <div style={{
                    background: '#34c75e15', border: '1px solid #34c75e40',
                    borderRadius: 12, padding: '8px 18px', textAlign: 'center', flexShrink: 0,
                  }}>
                    <div style={{ color: '#34c75e', fontSize: 26, fontWeight: 900, lineHeight: 1, letterSpacing: '-1px' }}>
                      {item.predictedHome} × {item.predictedAway}
                    </div>
                    <div style={{ color: '#6b9e7a', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', marginTop: 3 }}>
                      CRAVADO ✓
                    </div>
                  </div>

                  {/* away */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <span style={{
                      background: `${awayTint}22`, border: `1px solid ${awayTint}55`, color: awayTint,
                      padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 800, letterSpacing: '0.05em',
                    }}>{awayCode}</span>
                    <span style={{ color: '#f0ebe0', fontSize: 15, fontWeight: 700 }}>{item.awayTeam}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '24px 60px',
        borderTop: '1px solid #34c75e15',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ color: '#34c75e55', fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          bolao-copa-2026.app
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[...Array(Math.min(count, 5))].map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#34c75e', opacity: 0.6 + i * 0.08 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
