import { Icon } from '../components/Icon';
import { Logo } from '../components/ui/Logo';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

function PublicNav({ active, go }) {
  const link = (id, label) => (
    <button onClick={() => go(id)}
      className={`font-cond font-semibold tracking-wide text-[15px] transition-colors ${active === id ? "text-grass-400" : "text-mute hover:text-cream"}`}>
      {label}
    </button>
  );
  return (
    <header className="border-b border-edge/70 bg-bg/70 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-5 sm:px-7 h-16 flex items-center">
        <Logo onClick={() => go("landing")} />
        <div className="flex-1" />
        <nav className="flex items-center gap-6">
          {link("pub_ranking", "Ranking")}
          {link("pub_regras", "Regras")}
          <Button size="sm" onClick={() => go("auth")}>Entrar</Button>
        </nav>
      </div>
    </header>
  );
}

export function PublicShell({ active, go, children }) {
  return (
    <div className="min-h-screen bg-pitch">
      <PublicNav active={active} go={go} />
      <div className="max-w-6xl mx-auto px-5 sm:px-7 py-10 fade-in" key={active}>{children}</div>
    </div>
  );
}

export function Landing({ go }) {
  const features = [
    { icon:"users",  title:"Grupos",    text:"10 pts por seleção certa, 5 se passou em outra posição." },
    { icon:"target", title:"Mata-mata", text:"10 pts por confronto eliminatório vencido corretamente." },
    { icon:"trophy", title:"Título",    text:"75 pts no campeão, 55 no vice, 40 no outro finalista." },
    { icon:"award",  title:"Prêmios",   text:"Artilheiro, MVP, assistências e Golden Boy valem pontos." },
  ];
  return (
    <div className="min-h-screen bg-pitch">
      <PublicNav active="landing" go={go} />

      <section className="max-w-5xl mx-auto px-5 sm:px-7 pt-16 sm:pt-24 pb-10 text-center fade-in">
        <span className="inline-block rounded-full border border-gold/40 bg-gold-dim/40 text-gold-400 font-cond font-semibold tracking-[.18em] uppercase text-xs px-4 py-1.5 mb-7">
          Copa do Mundo · EUA · Canadá · México
        </span>
        <h1 className="title-3d text-5xl sm:text-7xl leading-[1] mb-6">
          Bolão da{" "}
          <span className="text-grass-400" style={{ textShadow: "2px 2px 0 #0e3a1e, 4px 4px 0 rgba(0,0,0,.35)" }}>
            Copa 2026
          </span>
        </h1>
        <p className="text-mute text-lg sm:text-xl max-w-xl mx-auto mb-9" style={{ textWrap: "pretty" }}>
          Cravou o campeão? Acertou os grupos? Dispute com seus amigos quem entende mais de futebol.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" icon="ball" onClick={() => go("auth")}>Fazer meu palpite</Button>
          <Button size="lg" variant="secondary" icon="trophy" onClick={() => go("pub_ranking")}>Ver ranking</Button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-7 pb-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => (
            <Card key={f.title} accent className="hover:border-edge2 transition-colors">
              <span className="text-gold mb-3 inline-block"><Icon name={f.icon} size={26} /></span>
              <h3 className="font-display text-xl text-cream mb-2">{f.title}</h3>
              <p className="text-mute text-sm leading-relaxed">{f.text}</p>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <button onClick={() => go("pub_regras")}
            className="font-cond font-semibold text-grass-400 hover:text-grass-DEFAULT inline-flex items-center gap-1.5 transition">
            Ver tabela completa de pontuação <Icon name="arrowRight" size={16} />
          </button>
        </div>
      </section>

      <footer className="border-t border-edge/60 py-8 text-center">
        <p className="font-cond text-mute2 text-sm tracking-wide">Bolão da Copa 2026 · protótipo de demonstração</p>
      </footer>
    </div>
  );
}
