import { SPECIAL_FIELDS, ALL_TEAMS, TEAMS } from '../data';
import { Icon } from '../components/Icon';
import { Card } from '../components/ui/Card';
import { PageTitle } from '../components/ui/PageTitle';
import { SectionLabel } from '../components/ui/SectionLabel';
import { PointPill } from '../components/ui/PointPill';
import { Select } from '../components/ui/Select';

// Derive teams that are candidates for 3rd place from the bracket
function getThirdCandidates(koWinners) {
  const sf0Teams = [koWinners["2-0"], koWinners["2-1"]].filter(Boolean);
  const sf1Teams = [koWinners["2-2"], koWinners["2-3"]].filter(Boolean);
  const sf0Loser = sf0Teams.length === 2 && koWinners["3-0"]
    ? sf0Teams.find(t => t !== koWinners["3-0"]) : null;
  const sf1Loser = sf1Teams.length === 2 && koWinners["3-1"]
    ? sf1Teams.find(t => t !== koWinners["3-1"]) : null;
  return [sf0Loser, sf1Loser].filter(Boolean);
}

// Keys that are auto-filled from the bracket
const BRACKET_KEYS = new Set(["campeao", "vice", "finalista"]);

const STAR_PLAYERS = [
  "Kylian Mbappé","Vinícius Júnior","Erling Haaland","Jude Bellingham","Lionel Messi",
  "Lamine Yamal","Harry Kane","Rodrygo","Pedri","Florian Wirtz","Bukayo Saka",
  "Phil Foden","Rafael Leão","Julián Álvarez","Federico Valverde","Cristiano Ronaldo",
];

function SpecialCard({ field, value, onChange, fromBracket = false, teamOptions = null }) {
  const teams = teamOptions || ALL_TEAMS;
  return (
    <Card pad={false} className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-cond font-bold text-cream text-base flex items-center gap-2">
            <span className="text-gold">
              <Icon name={field.kind === "team" ? "shield" : "star"} size={16} />
            </span>
            {field.label}
            {fromBracket && (
              <span className="text-[10px] font-cond font-semibold tracking-wider text-grass-400 border border-grass/30 rounded px-1.5 py-0.5 leading-none">
                DO BRACKET
              </span>
            )}
          </h3>
          <p className="text-mute2 text-xs mt-0.5">{field.hint}</p>
        </div>
        <PointPill pts={field.pts} tone="gold" />
      </div>
      {field.kind === "team" ? (
        <Select value={value || ""} placeholder="Escolha a seleção" onChange={e => onChange(e.target.value)}>
          {teams.map(t => <option key={t} value={t}>{TEAMS[t] ? `${TEAMS[t]} · ` : ''}{t}</option>)}
        </Select>
      ) : (
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute2">
            <Icon name="user" size={16} />
          </span>
          <input list="star-players" value={value || ""} onChange={e => onChange(e.target.value)}
            placeholder="Nome do jogador"
            className="w-full bg-bg/70 border border-edge focus:border-grass rounded-xl py-2.5 pl-10 pr-3 text-sm font-cond font-semibold text-cream placeholder-mute2 outline-none focus:ring-2 focus:ring-grass/25 transition" />
        </div>
      )}
    </Card>
  );
}

export function Especiais({ specials, setSpecial, koWinners = {} }) {
  const thirdCandidates = getThirdCandidates(koWinners);

  const podium = SPECIAL_FIELDS.filter(f => f.kind === "team");
  const awards = SPECIAL_FIELDS.filter(f => f.kind === "player");
  const totalPot = SPECIAL_FIELDS.reduce((s, f) => s + f.pts, 0);
  const filled = SPECIAL_FIELDS.filter(f => specials[f.key]).length;
  const bracketFilled = SPECIAL_FIELDS.filter(f => BRACKET_KEYS.has(f.key) && specials[f.key]).length;

  return (
    <div>
      <datalist id="star-players">
        {STAR_PLAYERS.map(p => <option key={p} value={p} />)}
      </datalist>

      <PageTitle kicker="Pódio &amp; premiações">Palpites Especiais</PageTitle>

      <Card pad={false} className="p-4 mb-6 -mt-2 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <span className="text-gold"><Icon name="sparkles" size={24} /></span>
          <div>
            <div className="font-cond font-semibold text-cream">Estas são as apostas que mais valem pontos.</div>
            <div className="text-mute2 text-sm">{filled} de {SPECIAL_FIELDS.length} preenchidos
              {bracketFilled > 0 && <span className="text-grass-400"> · {bracketFilled} do bracket</span>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl text-gold leading-none">{totalPot}</div>
          <div className="font-cond text-mute text-xs tracking-wide">PONTOS EM JOGO</div>
        </div>
      </Card>

      <SectionLabel icon="trophy">O pódio</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {podium.map(f => (
          <SpecialCard
            key={f.key}
            field={f}
            value={specials[f.key]}
            onChange={v => setSpecial(f.key, v)}
            fromBracket={BRACKET_KEYS.has(f.key) && !!specials[f.key]}
            teamOptions={f.key === "terceiro" && thirdCandidates.length === 2 ? thirdCandidates : null}
          />
        ))}
      </div>

      <SectionLabel icon="award">Premiações individuais</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4">
        {awards.map(f => (
          <SpecialCard key={f.key} field={f} value={specials[f.key]} onChange={v => setSpecial(f.key, v)} />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 text-mute2 text-sm">
        <Icon name="checkCircle" size={16} className="text-grass-400" />
        Palpites salvos automaticamente. Você pode alterar até o início da Copa.
      </div>
    </div>
  );
}
