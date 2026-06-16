export function AdminCravadosCard({ ranking = [] }) {
  const sorted = [...ranking].sort((a, b) => (b.total || 0) - (a.total || 0));
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const medal = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;

  return (
    <div
      id="admin-cravados-card"
      style={{
        width: 800,
        background: 'linear-gradient(160deg, #0b1f13 0%, #0f2a1a 50%, #0b1a10 100%)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* bg glows */}
      <div style={{
        position: 'absolute', top: -100, right: -100,
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, #34c75e1a 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60,
        width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, #e3b23c0d 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        padding: '48px 56px 36px',
        borderBottom: '1px solid #34c75e1a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div>
          <div style={{ color: '#34c75e', fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10 }}>
            ⚽ Bolão Copa do Mundo 2026
          </div>
          <div style={{ color: '#f0ebe0', fontSize: 38, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-1px' }}>
            Placar do Bolão
          </div>
          <div style={{ color: '#6b9e7a', fontSize: 14, fontWeight: 500, marginTop: 10 }}>
            {today}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#34c75e', fontSize: 28, fontWeight: 900, lineHeight: 1 }}>🎯 = cravou</div>
          <div style={{ color: '#6b9e7a', fontSize: 12, fontWeight: 600, marginTop: 6 }}>placar exato</div>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '28px 56px' }}>
        {sorted.length === 0 ? (
          <div style={{ color: '#6b9e7a', textAlign: 'center', fontSize: 16, padding: '40px 0' }}>
            Nenhum participante ainda.
          </div>
        ) : (
          <>
            {/* column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 90px 90px 80px',
              gap: '0 12px',
              padding: '0 16px 10px',
              color: '#6b9e7a',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              <span>#</span>
              <span>Participante</span>
              <span style={{ textAlign: 'center' }}>Pontos</span>
              <span style={{ textAlign: 'center' }}>Cravados</span>
              <span style={{ textAlign: 'center' }}>Taxa</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sorted.map((u, i) => {
                const hasCravados = (u.exactCount || 0) > 0;
                const isTop3 = i < 3;
                const m = medal(i);
                return (
                  <div key={u.handle || i} style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 90px 90px 80px',
                    gap: '0 12px',
                    alignItems: 'center',
                    background: isTop3 ? '#ffffff0a' : '#ffffff05',
                    border: `1px solid ${isTop3 ? '#34c75e20' : '#ffffff08'}`,
                    borderLeft: `3px solid ${isTop3 ? '#34c75e50' : '#ffffff10'}`,
                    borderRadius: 12,
                    padding: '12px 16px',
                  }}>
                    {/* rank */}
                    <span style={{
                      color: isTop3 ? '#f0ebe0' : '#6b9e7a',
                      fontSize: m ? 18 : 13,
                      fontWeight: 900,
                      textAlign: 'center',
                    }}>
                      {m || `${i + 1}`}
                    </span>

                    {/* name */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#f0ebe0', fontSize: 14, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                      <div style={{ color: '#6b9e7a', fontSize: 11, fontWeight: 500, marginTop: 3 }}>{u.handle}</div>
                    </div>

                    {/* total points */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#e3b23c', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{u.total ?? 0}</div>
                      <div style={{ color: '#6b9e7a', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', marginTop: 2 }}>PTS</div>
                    </div>

                    {/* exact count */}
                    <div style={{
                      textAlign: 'center',
                      background: hasCravados ? '#34c75e15' : 'transparent',
                      border: `1px solid ${hasCravados ? '#34c75e30' : 'transparent'}`,
                      borderRadius: 10,
                      padding: '6px 0',
                    }}>
                      {hasCravados ? (
                        <>
                          <div style={{ color: '#34c75e', fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                            🎯 {u.exactCount}
                          </div>
                          <div style={{ color: '#6b9e7a', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', marginTop: 2 }}>
                            {u.exactCount === 1 ? 'CRAVADO' : 'CRAVADOS'}
                          </div>
                        </>
                      ) : (
                        <div style={{ color: '#6b9e7a40', fontSize: 13, fontWeight: 600 }}>—</div>
                      )}
                    </div>

                    {/* exact rate */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: hasCravados ? '#34c75e' : '#6b9e7a50', fontSize: 14, fontWeight: 800, lineHeight: 1 }}>
                        {u.exactRate != null ? `${Math.round(u.exactRate * 100)}%` : '—'}
                      </div>
                      <div style={{ color: '#6b9e7a', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', marginTop: 2 }}>EXATOS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '20px 56px 40px',
        borderTop: '1px solid #34c75e12',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ color: '#34c75e40', fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          bolao-copa-2026.app
        </div>
        <div style={{ color: '#6b9e7a55', fontSize: 11 }}>
          {sorted.length} participante{sorted.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
