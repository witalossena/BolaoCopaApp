/* ============================================================
   TELAS — Landing, Auth, Regras
   ============================================================ */

/* ---------- Top nav público ---------- */
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

function PublicShell({ active, go, children }) {
  return (
    <div className="min-h-screen bg-pitch">
      <PublicNav active={active} go={go} />
      <div className="max-w-6xl mx-auto px-5 sm:px-7 py-10 fade-in" key={active}>{children}</div>
    </div>
  );
}

/* ---------- Landing ---------- */
function Landing({ go }) {
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
          Bolão da <span className="text-grass-400" style={{textShadow:"2px 2px 0 #0e3a1e, 4px 4px 0 rgba(0,0,0,.35)"}}>Copa 2026</span>
        </h1>
        <p className="text-mute text-lg sm:text-xl max-w-xl mx-auto mb-9" style={{textWrap:"pretty"}}>
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
          <button onClick={() => go("pub_regras")} className="font-cond font-semibold text-grass-400 hover:text-grass-DEFAULT inline-flex items-center gap-1.5 transition">
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

/* ---------- Auth (Login / Cadastro) ---------- */
function AuthScreen({ onAuth, go }) {
  const [mode, setMode] = React.useState("login");
  const [form, setForm] = React.useState({ name:"", handle:"", email:"", pass:"" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const name = form.name.trim() || (mode === "login" ? "Você" : "Novo Palpiteiro");
    onAuth({
      name,
      handle: form.handle.trim() ? (form.handle[0] === "@" ? form.handle : "@" + form.handle) : "@voce",
      email: form.email,
    });
  };

  return (
    <div className="min-h-screen bg-pitch flex flex-col">
      <div className="px-5 sm:px-7 h-16 flex items-center max-w-6xl mx-auto w-full">
        <Logo onClick={() => go("landing")} />
      </div>
      <div className="flex-1 grid place-items-center px-5 py-8">
        <div className="w-full max-w-md fade-in">
          <div className="text-center mb-7">
            <h1 className="title-3d text-4xl mb-2">{mode === "login" ? "Bem-vindo de volta" : "Entre no jogo"}</h1>
            <p className="text-mute">{mode === "login" ? "Acesse seus palpites e o ranking." : "Crie sua conta e comece a palpitar."}</p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-surface2 rounded-full border border-edge mb-6">
            {[["login","Entrar"],["signup","Cadastrar"]].map(([k,l]) => (
              <button key={k} onClick={() => setMode(k)}
                className={`py-2.5 rounded-full font-cond font-semibold tracking-wide text-sm transition-all
                  ${mode === k ? "bg-grass text-bg shadow-[0_6px_18px_-8px_rgba(52,199,94,.7)]" : "text-mute hover:text-cream"}`}>
                {l}
              </button>
            ))}
          </div>

          <Card pad={false} className="p-6">
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <Field label="Nome completo" icon="user" value={form.name} onChange={set("name")} placeholder="Ex.: João Silva" />
                  <Field label="Nome de usuário" icon="hash" value={form.handle} onChange={set("handle")} placeholder="joaosilva" />
                </>
              )}
              <Field label="E-mail" icon="mail" type="email" value={form.email} onChange={set("email")} placeholder="voce@email.com" />
              <Field label="Senha" icon="lock" type="password" value={form.pass} onChange={set("pass")} placeholder="••••••••" />

              {mode === "login" && (
                <div className="flex justify-end -mt-1">
                  <button type="button" className="text-xs font-cond font-semibold text-mute hover:text-grass-400 transition">Esqueci a senha</button>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" iconRight="arrowRight">
                {mode === "login" ? "Entrar" : "Criar conta e palpitar"}
              </Button>
            </form>
          </Card>

          <p className="text-center text-mute2 text-sm mt-5">
            {mode === "login" ? "Ainda não tem conta? " : "Já tem conta? "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-cond font-semibold text-grass-400 hover:underline">
              {mode === "login" ? "Cadastre-se" : "Faça login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Regras de pontuação ---------- */
function RuleRow({ label, pts, tone, last }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3.5 ${last ? "" : "border-b border-edge/60"}`}>
      <span className="text-cream/90 text-[15px]">{label}</span>
      <PointPill pts={pts} tone={tone} />
    </div>
  );
}

function Regras() {
  return (
    <div>
      <PageTitle kicker="Como pontuar">Regras de pontuação</PageTitle>
      <p className="text-mute max-w-2xl mb-8 -mt-3" style={{textWrap:"pretty"}}>
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

Object.assign(window, { PublicNav, PublicShell, Landing, AuthScreen, Regras });
