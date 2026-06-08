import { SPECIAL_FIELDS, MATCHES, GROUPS, TEAMS } from '../data';

export function ExportPDFLayout({ user, matchPredictions, groupRanks, knockoutPredictions, specials }) {
  return (
    <div id="pdf-export-layout" className="bg-white text-slate-900 p-10 w-[800px] font-sans leading-tight">
      {/* Header */}
      <div className="border-b-4 border-emerald-600 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-emerald-800">Copa do Mundo 2026</h1>
          <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">Meus Palpites do Bolão</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-emerald-700">{user.name}</div>
          <div className="text-slate-400 font-bold tracking-wider">{user.handle}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-8">
        
        {/* Left Column: Groups */}
        <div className="space-y-6">
          <h2 className="text-lg font-black uppercase bg-emerald-600 text-white px-3 py-1 inline-block mb-2 italic">Fase de Grupos</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {GROUPS.map(g => {
              const rank = groupRanks.find(r => r.group === g.id);
              const groupMatches = matchPredictions.filter(p => {
                const m = MATCHES.find(mm => mm.id === p.externalId || mm.id === `m${p.matchId}`);
                return m && m.group === g.id;
              });

              return (
                <div key={g.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-black text-slate-700 flex justify-between border-b border-slate-200 uppercase tracking-tighter">
                    <span>Grupo {g.id}</span>
                    <span className="text-emerald-600">Classificação</span>
                  </div>
                  <div className="p-3">
                    {/* Classification */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-3 pb-3 border-b border-slate-100">
                      <div className="min-w-0">
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">1º Lugar</div>
                        <div className="font-bold text-slate-800 text-[11px] leading-tight break-words">{rank?.firstTeam || '–'}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">2º Lugar</div>
                        <div className="font-bold text-slate-800 text-[11px] leading-tight break-words">{rank?.secondTeam || '–'}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">3º Lugar</div>
                        <div className="font-bold text-slate-600 text-[10px] leading-tight break-words">{rank?.thirdTeam || '–'}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">4º Lugar</div>
                        <div className="font-bold text-slate-600 text-[10px] leading-tight break-words">{rank?.fourthTeam || '–'}</div>
                      </div>
                    </div>
                    {/* Matches */}
                    <div className="space-y-1.5">
                      {groupMatches.map(p => {
                        const m = MATCHES.find(mm => mm.id === p.externalId || mm.id === `m${p.matchId}`);
                        return (
                          <div key={p.id} className="flex items-center justify-between text-[11px] font-medium border-b border-slate-50 last:border-0 pb-2 pt-1.5">
                            <span className="w-10 text-slate-400 font-bold uppercase">{m.homeCode}</span>
                            <span className="bg-emerald-50 text-emerald-700 font-black px-3 h-6 rounded-md text-xs tabular-nums tracking-tighter flex items-center justify-center min-w-[52px] leading-none">{p.homeScore} × {p.awayScore}</span>
                            <span className="w-10 text-slate-400 font-bold uppercase text-right">{m.awayCode}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Mata-Mata & Specials */}
        <div className="space-y-8">
          
          {/* Mata-Mata */}
          <div>
            <h2 className="text-lg font-black uppercase bg-emerald-600 text-white px-3 py-1 inline-block mb-4 italic">Mata-Mata</h2>
            <div className="space-y-3">
              {knockoutPredictions.map(p => (
                <div key={p.id} className="flex items-center gap-3 border-l-4 border-emerald-200 pl-3 py-1">
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      {p.externalId?.includes('r32') ? '16avos' : 
                       p.externalId?.includes('r16') ? 'Oitavas' : 
                       p.externalId?.includes('sf') ? 'Semifinal' : 'Final'}
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      Vencedor: <span className="text-emerald-700">{p.winnerTeam}</span>
                    </div>
                  </div>
                  <div className="bg-slate-100 px-2 py-1 rounded text-xs font-black text-slate-600 tabular-nums">
                    {p.homeScore} × {p.awayScore}
                  </div>
                </div>
              ))}
              {knockoutPredictions.length === 0 && <div className="text-slate-400 italic text-sm">Nenhum palpite de mata-mata registrado.</div>}
            </div>
          </div>

          {/* Special Awards */}
          <div>
            <h2 className="text-lg font-black uppercase bg-emerald-600 text-white px-3 py-1 inline-block mb-4 italic">Prêmios Especiais</h2>
            <div className="grid grid-cols-1 gap-3">
              {SPECIAL_FIELDS.map(f => {
                const val = specials[f.key];
                if (!val) return null;
                return (
                  <div key={f.key} className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black text-amber-600/70 uppercase tracking-[0.15em] leading-none mb-1">{f.label}</div>
                      <div className="text-sm font-black text-slate-800">{val}</div>
                    </div>
                    <div className="text-amber-200">
                      {f.kind === "team" ? "🏆" : "⭐"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-10 mt-auto text-center border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Gerado em bolao-copa-2026.app</p>
          </div>
        </div>

      </div>
    </div>
  );
}
