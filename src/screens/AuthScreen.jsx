import { useState } from 'react';
import { Logo } from '../components/ui/Logo';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';

export function AuthScreen({ onAuth, go }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", handle: "", email: "", pass: "" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const name = form.name.trim() || (mode === "login" ? "Você" : "Novo Palpiteiro");
    onAuth({
      name,
      handle: form.handle.trim()
        ? (form.handle[0] === "@" ? form.handle : "@" + form.handle)
        : "@voce",
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
            <h1 className="title-3d text-4xl mb-2">
              {mode === "login" ? "Bem-vindo de volta" : "Entre no jogo"}
            </h1>
            <p className="text-mute">
              {mode === "login"
                ? "Acesse seus palpites e o ranking."
                : "Crie sua conta e comece a palpitar."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 bg-surface2 rounded-full border border-edge mb-6">
            {[["login", "Entrar"], ["signup", "Cadastrar"]].map(([k, l]) => (
              <button key={k} onClick={() => setMode(k)}
                className={`py-2.5 rounded-full font-cond font-semibold tracking-wide text-sm transition-all
                  ${mode === k
                    ? "bg-grass text-bg shadow-[0_6px_18px_-8px_rgba(52,199,94,.7)]"
                    : "text-mute hover:text-cream"}`}>
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
                  <button type="button" className="text-xs font-cond font-semibold text-mute hover:text-grass-400 transition">
                    Esqueci a senha
                  </button>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" iconRight="arrowRight">
                {mode === "login" ? "Entrar" : "Criar conta e palpitar"}
              </Button>
            </form>
          </Card>

          <p className="text-center text-mute2 text-sm mt-5">
            {mode === "login" ? "Ainda não tem conta? " : "Já tem conta? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-cond font-semibold text-grass-400 hover:underline">
              {mode === "login" ? "Cadastre-se" : "Faça login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
