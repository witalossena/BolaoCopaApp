export function AdminCravadosCard({ ranking = [], matchLabel = '' }) {
  const cravados = ranking
    .filter(u => (u.exactCount || 0) > 0)
    .sort((a, b) => (b.exactCount || 0) - (a.exactCount || 0) || (b.total || 0) - (a.total || 0));

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

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
      }}>
        <div style={{ color: '#34c75e', fontSize: 11, fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10 }}>
          ⚽ Bolão Copa do Mundo 2026
        </div>
        <div style={{ color: '#f0ebe0', fontSize: 38, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-1px' }}>
          🎯 Quem Cravou?
        </div>
        <div style={{ color: '#6b9e7a', fontSize: 14, fontWeight: 500, marginTop: 10 }}>
          {matchLabel ? matchLabel + ' · ' : ''}{today}
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '28px 56px' }}>
        {cravados.length === 0 ? (
          <div style={{ color: '#6b9e7a', textAlign: 'center', fontSize: 16, padding: '40px 0' }}>
            Nenhum placar exato registrado ainda.
          </div>
        ) : (
          <>
            {/* column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr 80px 80px',
              gap: '0 16px',
              padding: '0 16px 10px',
              color: '#6b9e7a',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              <span>#</span>
              <span>Participante</span>
              <span style={{ textAlign: 'center' }}>Cravados</span>
              <span style={{ textAlign: 'center' }}>Pontos</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cravados.map((u, i) => {
                const isTop = i === 0;
                return (
                  <div key={u.handle || i} style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr 80px 80px',
                    gap: '0 16px',
                    alignItems: 'center',
                    background: isTop ? '#34c75e10' : '#ffffff06',
                    border: `1px solid ${isTop ? '#34c75e30' : '#ffffff0a'}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                  }}>
                    {/* rank */}
                    <span style={{
                      color: isTop ? '#34c75e' : '#6b9e7a',
                      fontSize: isTop ? 18 : 14,
                      fontWeight: 900,
                      textAlign: 'center',
                    }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </span>

                    {/* name */}
                    <div>
                      <div style={{ color: '#f0ebe0', fontSize: 15, fontWeight: 700, lineHeight: 1 }}>{u.name}</div>
                      <div style={{ color: '#6b9e7a', fontSize: 11, fontWeight: 500, marginTop: 3 }}>{u.handle}</div>
                    </div>

                    {/* exact count */}
                    <div style={{
                      textAlign: 'center',
                      background: '#34c75e18',
                      border: '1px solid #34c75e35',
                      borderRadius: 10,
                      padding: '6px 0',
                    }}>
                      <div style={{ color: '#34c75e', fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{u.exactCount}</div>
                      <div style={{ color: '#6b9e7a', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', marginTop: 2 }}>
                        {u.exactCount === 1 ? 'CRAVADO' : 'CRAVADOS'}
                      </div>
                    </div>

                    {/* total pts */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#e3b23c', fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{u.total ?? 0}</div>
                      <div style={{ color: '#6b9e7a', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', marginTop: 2 }}>PTS</div>
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
          {ranking.length} participantes no total
        </div>
      </div>
    </div>
  );
}
