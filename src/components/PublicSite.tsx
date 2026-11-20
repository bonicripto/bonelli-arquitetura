import { useState } from "react";
import type { FormEvent } from "react";
import { addLead } from "../lib/store";
import type { LeadTipo } from "../lib/types";

const WHATSAPP_URL =
  "https://wa.me/5577981184371?text=" +
  encodeURIComponent("Olá! Vim pelo site da Bonelli Arquitetura e quero conversar sobre um projeto.");
const INSTAGRAM_URL = "https://instagram.com/bonelliarquitetura";

const inputCls =
  "w-full rounded-lg border border-line bg-panel px-4 py-3 text-sm text-paper placeholder:text-muted outline-none focus:border-brand";
const labelCls = "mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-muted";

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-paper">
            BONELLI
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand">
            Arquitetura
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <a href="#servicos" className="hover:text-paper">Serviços</a>
          <a href="#projetos" className="hover:text-paper">Projetos</a>
          <a href="#processo" className="hover:text-paper">Processo</a>
          <a href="#sobre" className="hover:text-paper">Sobre</a>
          <a href="#contato" className="hover:text-paper">Contato</a>
        </nav>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-deep hover:text-paper"
        >
          Falar no WhatsApp
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-grid relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
          Bonelli Arquitetura — Caculé · BA
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-paper sm:text-6xl">
          Chega de projetos iguais!{" "}
          <span className="text-brand">Sua rotina, sua casa.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Reforma, construção e interiores pensados para a sua vida de verdade —
          não para a foto. Do primeiro papo à entrega da obra, com um arquiteto
          acompanhando cada etapa.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-brand px-6 py-3 font-bold text-ink transition hover:bg-brand-deep hover:text-paper"
          >
            Chamar no WhatsApp
          </a>
          <a
            href="#orcamento"
            className="rounded-lg border border-line bg-panel px-6 py-3 font-bold text-paper transition hover:border-brand"
          >
            Pedir um orçamento
          </a>
        </div>
        <p className="mt-10 font-mono text-xs uppercase tracking-[0.25em] text-muted">
          Reforma · Construção · Interiores
        </p>
      </div>
    </section>
  );
}

const SERVICES: { title: string; desc: string; points: string[] }[] = [
  {
    title: "Reforma",
    desc: "Sua casa atual, do jeito que você sempre quis — sem mudar de endereço.",
    points: ["Levantamento do existente", "Projeto de reforma completo", "Acompanhamento da obra"],
  },
  {
    title: "Construção",
    desc: "Do terreno vazio à casa pronta, com projeto pensado para a sua rotina.",
    points: ["Projeto arquitetônico", "Projeto executivo", "Compatibilização e obra"],
  },
  {
    title: "Interiores",
    desc: "Ambientes que funcionam no dia a dia e ficam bonitos de verdade.",
    points: ["Layout e marcenaria", "Iluminação e materiais", "Detalhamento executivo"],
  },
];

function Services() {
  return (
    <section id="servicos" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">O que eu faço</p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-paper">
        Serviços
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {SERVICES.map((s) => (
          <article key={s.title} className="rounded-2xl border border-line bg-panel p-6">
            <h3 className="font-display text-xl font-bold text-paper">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            <ul className="mt-4 space-y-2">
              {s.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-paper">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

/* Portfólio — placeholders elegantes. Fotos reais entram depois;
   nenhum nome de projeto inventado. */
function Portfolio() {
  const slots = ["01", "02", "03", "04", "05", "06"];
  return (
    <section id="projetos" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">Portfólio</p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-paper">
        Projetos
      </h2>
      <p className="mt-3 max-w-2xl text-muted">
        As fotos dos projetos entram aqui em breve — acompanhe pelo Instagram
        enquanto o portfólio é montado.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((n) => (
          <article
            key={n}
            className="bg-blueprint flex aspect-[4/3] flex-col justify-between rounded-2xl border border-line p-5"
          >
            <span className="font-mono text-sm font-bold text-brand">{n}</span>
            <div>
              <p className="font-display text-lg font-bold text-paper">Projeto em breve</p>
              <p className="text-sm text-muted">Foto e descrição chegam aqui.</p>
            </div>
          </article>
        ))}
      </div>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block font-mono text-sm text-brand hover:underline"
      >
        Ver projetos no Instagram — @bonelliarquitetura →
      </a>
    </section>
  );
}

const STEPS = [
  { n: "01", title: "Conversa", desc: "Você conta o que precisa — reforma, construção ou interiores — e em qual cidade." },
  { n: "02", title: "Visita e levantamento", desc: "Conheço o lugar, meço tudo e entendo a sua rotina." },
  { n: "03", title: "Projeto", desc: "Você aprova o projeto antes de qualquer obra começar." },
  { n: "04", title: "Obra e acompanhamento", desc: "A obra sai do papel com acompanhamento até a entrega." },
];

function Process() {
  return (
    <section id="processo" className="border-y border-line bg-panel/50">
      <div className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">Como funciona</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-paper">
          Do primeiro papo à chave na mão
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl border border-line bg-panel p-6">
              <span className="font-mono text-2xl font-bold text-brand">{s.n}</span>
              <h3 className="mt-3 font-display text-lg font-bold text-paper">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="sobre" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">Sobre</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-paper">
            Bonelli Arquitetura
          </h2>
        </div>
        <div className="space-y-4 text-lg leading-relaxed text-muted">
          <p>
            A Bonelli Arquitetura é o escritório do arquiteto{" "}
            <strong className="text-paper">Vítor Bonelli</strong>, em Caculé, na Bahia.
            Aqui, projeto não é só desenho bonito: é a sua rotina desenhada em planta,
            com cada ambiente pensado para como você vive de verdade.
          </p>
          <p>
            Reforma, construção ou interiores — o trabalho começa ouvindo você e termina
            com a obra entregue, sem surpresa no caminho.
          </p>
        </div>
      </div>
    </section>
  );
}

const PRAZOS = ["O quanto antes", "Em até 3 meses", "Em até 6 meses", "Ainda estou planejando"];

function LeadForm() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<LeadTipo>("reforma");
  const [cidade, setCidade] = useState("");
  const [ambiente, setAmbiente] = useState("");
  const [prazo, setPrazo] = useState(PRAZOS[0]);
  const [mensagem, setMensagem] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2) {
      setError("Conta pra gente o seu nome.");
      return;
    }
    if (telefone.trim().length < 8) {
      setError("Deixa um WhatsApp válido pra gente te responder.");
      return;
    }
    addLead({
      nome: nome.trim(),
      telefone: telefone.trim(),
      tipo,
      cidade: cidade.trim(),
      ambiente: ambiente.trim(),
      prazo,
      mensagem: mensagem.trim(),
      fotos: "",
    });
    setError("");
    setSent(true);
  }

  if (sent) {
    return (
      <section id="orcamento" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-line bg-panel p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">Recebido</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-paper">
            Pedido enviado — obrigado, {nome.trim().split(" ")[0]}!
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Seu pedido já está no painel do escritório. Se preferir agilizar,
            chama direto no WhatsApp.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 font-bold text-ink transition hover:bg-brand-deep hover:text-paper"
          >
            Chamar no WhatsApp
          </a>
        </div>
      </section>
    );
  }

  return (
    <section id="orcamento" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">Orçamento</p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-paper">
        Me conta o seu projeto
      </h2>
      <p className="mt-3 max-w-2xl text-muted">
        Preenche aqui — é a mesma qualificação do atendimento no WhatsApp.
        O escritório responde com os próximos passos.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 grid gap-5 rounded-2xl border border-line bg-panel p-6 sm:grid-cols-2 sm:p-8"
      >
        <div>
          <label className={labelCls} htmlFor="lf-nome">Seu nome *</label>
          <input id="lf-nome" className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Maria Silva" />
        </div>
        <div>
          <label className={labelCls} htmlFor="lf-tel">WhatsApp *</label>
          <input id="lf-tel" className={inputCls} value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(77) 98118-4371" inputMode="tel" />
        </div>
        <div>
          <label className={labelCls} htmlFor="lf-tipo">O que você precisa?</label>
          <select id="lf-tipo" className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value as LeadTipo)}>
            <option value="reforma">Reforma</option>
            <option value="construção">Construção</option>
            <option value="interiores">Interiores</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="lf-cidade">Cidade</label>
          <input id="lf-cidade" className={inputCls} value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex.: Caculé" />
        </div>
        <div>
          <label className={labelCls} htmlFor="lf-amb">Ambiente</label>
          <input id="lf-amb" className={inputCls} value={ambiente} onChange={(e) => setAmbiente(e.target.value)} placeholder="Ex.: cozinha, quarto, casa toda" />
        </div>
        <div>
          <label className={labelCls} htmlFor="lf-prazo">Prazo</label>
          <select id="lf-prazo" className={inputCls} value={prazo} onChange={(e) => setPrazo(e.target.value)}>
            {PRAZOS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="lf-msg">Conta um pouco mais (opcional)</label>
          <textarea id="lf-msg" className={`${inputCls} min-h-24 resize-y`} value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Ex.: quero reformar a cozinha e integrar com a sala..." />
        </div>
        {error && <p className="text-sm font-medium text-bad sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <button type="submit" className="w-full rounded-lg bg-brand px-6 py-3 font-bold text-ink transition hover:bg-brand-deep hover:text-paper sm:w-auto">
            Enviar pedido de orçamento
          </button>
        </div>
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contato" className="border-t border-line bg-panel/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-paper">BONELLI</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand">Arquitetura</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Reforma, construção e interiores em Caculé, BA.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">Contato</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="text-paper hover:text-brand">
                WhatsApp — (77) 98118-4371
              </a>
            </li>
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-paper hover:text-brand">
                Instagram — @bonelliarquitetura
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">Escritório</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Travessa Senhor do Bonfim, nº 05 — térreo
            <br />
            Centro, Caculé — BA
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-muted sm:px-6">
          <span>© 2026 Bonelli Arquitetura</span>
          <a href="#/admin" className="font-mono hover:text-paper">
            Área do administrador
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function PublicSite() {
  return (
    <div className="min-h-screen bg-ink font-sans text-paper">
      <Header />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Process />
        <About />
        <LeadForm />
      </main>
      <Footer />
    </div>
  );
}
