import { SCORING } from '../data';
import { Card } from '../components/ui/Card';
import { PageTitle } from '../components/ui/PageTitle';
import { SectionLabel } from '../components/ui/SectionLabel';
import { PointPill } from '../components/ui/PointPill';

function RuleRow({ label, pts, tone, last }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3.5 ${last ? "" : "border-b border-edge/60"}`}>
      <span className="text-cream/90 text-[15px]">{label}</span>
      <PointPill pts={pts} tone={tone} />
    </div>
  );
}

export function Regras() {
  return (
    <div>
      <PageTitle kicker="Como pontuar">Regras de pontuação</PageTitle>
      <p className="text-mute max-w-2xl mb-8 -mt-3" style={{ textWrap: "pretty" }}>
        Some pontos na fase de grupos, acertando classificados e mata-mata, e fature alto cravando o pódio e as premiações individuais.
      </p>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card accent>
          <SectionLabel icon="users">Fase de grupos</SectionLabel>
          {SCORING.groups.map((r, i) => (
            <RuleRow key={i} label={r.label} pts={r.pts} tone="green" last={i === SCORING.groups.length - 1} />
          ))}
          <p className="text-xs text-mute2 mt-3 leading-relaxed">
            Você escolhe o 1º e o 2º colocado de cada um dos 12 grupos. Acertar a seleção <b className="text-mute">e</b> a posição vale 10 pts; acertar que ela se classifica, mas trocando a posição, vale 5 pts.
          </p>
        </Card>

        <Card accent>
          <SectionLabel icon="target">Mata-mata</SectionLabel>
          {SCORING.knockout.map((r, i) => (
            <RuleRow key={i} label={r.label} pts={r.pts} tone="green" last />
          ))}
          <p className="text-xs text-mute2 mt-3 leading-relaxed">
            A cada rodada eliminatória, cada seleção que você apontar corretamente como vencedora do confronto rende 10 pts.
          </p>
        </Card>

        <Card accent className="lg:col-span-2">
          <SectionLabel icon="award">Pódio &amp; premiações individuais</SectionLabel>
          <div className="grid sm:grid-cols-2 sm:gap-x-8">
            {SCORING.awards.map((r, i) => (
              <RuleRow key={r.key} label={r.label} pts={r.pts} tone="gold"
                last={i === SCORING.awards.length - 1 || i === SCORING.awards.length - 2} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
