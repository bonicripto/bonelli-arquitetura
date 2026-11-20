import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  endAdminSession,
  hasAdminPassword,
  isAdminSession,
  setAdminPassword,
  startAdminSession,
  verifyAdminPassword,
} from "../lib/auth";
import { fmtBRL, fmtDate, monthKeyOf, monthLabel, parseReaisToCentavos, todayISO } from "../lib/format";
import {
  addClient,
  addProject,
  addTransaction,
  convertLeadToClient,
  createProjectFromLead,
  deleteClient,
  deleteLead,
  deleteProject,
  deleteTransaction,
  setLeadStatus,
  updateProject,
  useDB,
} from "../lib/store";
import {
  PIPELINE_LABELS,
  PIPELINE_STATUSES,
  PROJECT_STATUSES,
  TRANSACTION_CATEGORIES,
} from "../lib/types";
import type { Lead, PipelineStatus, ProjectStatus, TransactionTipo } from "../lib/types";

const inputCls =
  "w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-paper placeholder:text-muted outline-none focus:border-brand";
const labelCls = "mb-1 block font-mono text-[11px] uppercase tracking-widest text-muted";
const btnPrimary =
  "rounded-lg bg-brand px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-deep hover:text-paper";
const btnGhost =
  "rounded-lg border border-line px-3 py-2 text-sm font-medium text-paper transition hover:border-brand";
const btnDanger =
  "rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-bad transition hover:border-bad";

/* ================= Portão: senha-mestra ================= */

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const isSetup = !hasAdminPassword();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setBusy(true);
    try {
      if (isSetup) {
        if (password !== confirm) {
          setError("As senhas não coincidem.");
          return;
        }
        await setAdminPassword(password);
      } else if (!(await verifyAdminPassword(password))) {
        setError("Senha incorreta.");
        return;
      }
      startAdminSession();
      onUnlock();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <a href="#/" className="mb-6 font-mono text-sm text-brand hover:underline">
        ← Voltar ao site
      </a>
      <div className="rounded-2xl border border-line bg-panel p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">
          Bonelli Arquitetura
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold text-paper">
          {isSetup ? "Criar senha do painel" : "Área do administrador"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {isSetup
            ? "Primeiro acesso: crie a senha-mestra do painel. Ela fica guardada só neste navegador — não esqueça."
            : "Digite a senha-mestra para entrar no CRM e no fluxo de caixa."}
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className={labelCls} htmlFor="adm-pw">Senha</label>
            <input
              id="adm-pw"
              type="password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          {isSetup && (
            <div>
              <label className={labelCls} htmlFor="adm-pw2">Confirmar senha</label>
              <input
                id="adm-pw2"
                type="password"
                className={inputCls}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </div>
          )}
          {error && <p className="text-sm font-medium text-bad">{error}</p>}
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full disabled:opacity-50`}>
            {busy ? "Verificando…" : isSetup ? "Criar senha e entrar" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= CRM: Leads ================= */

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const db = useDB();
  const [projectName, setProjectName] = useState(
    `${lead.tipo} — ${lead.ambiente || lead.nome}`,
  );
  const [note, setNote] = useState("");
  const client = db.clients.find((c) => c.leadId === lead.id);
  const projects = db.projects.filter((p) => p.leadId === lead.id);

  function handleConvert() {
    const c = convertLeadToClient(lead.id);
    setNote(c ? `Cliente criado: ${c.nome}.` : "Não foi possível criar o cliente.");
  }

  function handleCreateProject() {
    const name = projectName.trim();
    if (name.length < 2) {
      setNote("Dê um nome ao projeto antes de criar.");
      return;
    }
    const p = createProjectFromLead(lead.id, name);
    setNote(p ? `Projeto criado: ${p.nome}.` : "Não foi possível criar o projeto.");
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand/40 bg-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold text-paper">{lead.nome}</h3>
          <p className="mt-1 font-mono text-xs text-muted">
            Chegou em {fmtDate(lead.createdAt)} · {lead.tipo} · {lead.cidade || "cidade não informada"}
          </p>
        </div>
        <button className={btnGhost} onClick={onClose}>Fechar</button>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div><dt className={labelCls}>WhatsApp</dt><dd className="text-sm text-paper">{lead.telefone}</dd></div>
        <div><dt className={labelCls}>Ambiente</dt><dd className="text-sm text-paper">{lead.ambiente || "—"}</dd></div>
        <div><dt className={labelCls}>Prazo</dt><dd className="text-sm text-paper">{lead.prazo}</dd></div>
        <div><dt className={labelCls}>Status</dt>
          <dd>
            <select
              className={`${inputCls} mt-1 max-w-52`}
              value={lead.status}
              onChange={(e) => setLeadStatus(lead.id, e.target.value as PipelineStatus)}
            >
              {PIPELINE_STATUSES.map((s) => (
                <option key={s} value={s}>{PIPELINE_LABELS[s]}</option>
              ))}
            </select>
          </dd>
        </div>
        <div className="sm:col-span-2"><dt className={labelCls}>Mensagem</dt><dd className="text-sm leading-relaxed text-paper">{lead.mensagem || "—"}</dd></div>
        <div className="sm:col-span-2"><dt className={labelCls}>Fotos</dt><dd className="text-sm leading-relaxed text-paper">{lead.fotos || "Nenhuma foto registrada."}</dd></div>
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button className={btnPrimary} onClick={handleConvert} disabled={Boolean(client)}>
          {client ? `Já é cliente (${client.nome})` : "Virar cliente"}
        </button>
        <input
          className={`${inputCls} max-w-xs`}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Nome do projeto"
          aria-label="Nome do projeto"
        />
        <button className={btnGhost} onClick={handleCreateProject}>Criar projeto</button>
        <button className={btnDanger} onClick={() => { deleteLead(lead.id); onClose(); }}>
          Excluir lead
        </button>
      </div>
      {note && <p className="mt-3 text-sm text-brand">{note}</p>}
      {projects.length > 0 && (
        <p className="mt-3 text-sm text-muted">
          Projetos deste lead: {projects.map((p) => p.nome).join(", ")}
        </p>
      )}
    </div>
  );
}

function LeadsSection() {
  const db = useDB();
  const [filter, setFilter] = useState<PipelineStatus | "todos">("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = db.leads.find((l) => l.id === selectedId) ?? null;
  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: db.leads.length };
    for (const s of PIPELINE_STATUSES) c[s] = db.leads.filter((l) => l.status === s).length;
    return c;
  }, [db.leads]);
  const visible = filter === "todos" ? db.leads : db.leads.filter((l) => l.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {(["todos", ...PIPELINE_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              filter === s ? "border-brand bg-brand text-ink" : "border-line text-muted hover:text-paper"
            }`}
          >
            {s === "todos" ? "Todos" : PIPELINE_LABELS[s]} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
          Nenhum lead por aqui ainda. Os pedidos do formulário do site caem aqui
          automaticamente.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-panel-2 text-muted">
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest">Nome</th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest">Tipo</th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest">Cidade</th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest">Data</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedId(lead.id)}
                  className={`cursor-pointer border-b border-line last:border-0 hover:bg-panel ${
                    selectedId === lead.id ? "bg-panel-2" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-paper">{lead.nome}</td>
                  <td className="px-4 py-3 text-muted">{lead.tipo}</td>
                  <td className="px-4 py-3 text-muted">{lead.cidade || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-line px-2.5 py-1 text-xs text-paper">
                      {PIPELINE_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{fmtDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <LeadDetail lead={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

/* ================= CRM: Clientes e Projetos ================= */

function ClientsSection() {
  const db = useDB();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2 || telefone.trim().length < 8) return;
    addClient({ nome: nome.trim(), telefone: telefone.trim(), cidade: cidade.trim() });
    setNome("");
    setTelefone("");
    setCidade("");
  }

  return (
    <div className="mt-10">
      <h3 className="font-display text-lg font-bold text-paper">Clientes</h3>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 rounded-2xl border border-line bg-panel p-5 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome *" aria-label="Nome do cliente" />
        <input className={inputCls} value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="WhatsApp *" inputMode="tel" aria-label="WhatsApp do cliente" />
        <input className={inputCls} value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" aria-label="Cidade do cliente" />
        <button type="submit" className={btnPrimary}>Adicionar</button>
      </form>
      {db.clients.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Nenhum cliente ainda — converta um lead ou cadastre direto.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {db.clients.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-panel px-4 py-3">
              <div>
                <p className="text-sm font-medium text-paper">{c.nome}</p>
                <p className="font-mono text-xs text-muted">{c.telefone} · {c.cidade || "—"}</p>
              </div>
              <button className={btnDanger} onClick={() => deleteClient(c.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectsSection() {
  const db = useDB();
  const [nome, setNome] = useState("");
  const [clientId, setClientId] = useState("");
  const [cidade, setCidade] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("orçamento");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (nome.trim().length < 2) return;
    addProject({
      nome: nome.trim(),
      clientId: clientId || null,
      leadId: null,
      status,
      cidade: cidade.trim(),
      descricao: "",
    });
    setNome("");
    setClientId("");
    setCidade("");
    setStatus("orçamento");
  }

  return (
    <div className="mt-10">
      <h3 className="font-display text-lg font-bold text-paper">Projetos</h3>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 rounded-2xl border border-line bg-panel p-5 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do projeto *" aria-label="Nome do projeto" />
        <select className={inputCls} value={clientId} onChange={(e) => setClientId(e.target.value)} aria-label="Cliente do projeto">
          <option value="">Sem cliente vinculado</option>
          {db.clients.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <input className={inputCls} value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" aria-label="Cidade do projeto" />
        <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} aria-label="Status do projeto">
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>{PIPELINE_LABELS[s]}</option>
          ))}
        </select>
        <button type="submit" className={btnPrimary}>Adicionar</button>
      </form>
      {db.projects.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Nenhum projeto ainda — crie a partir de um lead ou cadastre direto.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {db.projects.map((p) => {
            const client = db.clients.find((c) => c.id === p.clientId);
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-panel px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-paper">{p.nome}</p>
                  <p className="font-mono text-xs text-muted">
                    {client ? `${client.nome} · ` : ""}{p.cidade || "—"} · {PIPELINE_LABELS[p.status]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className={`${inputCls} w-40`}
                    value={p.status}
                    onChange={(e) => updateProject(p.id, { status: e.target.value as ProjectStatus })}
                    aria-label="Mudar status do projeto"
                  >
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>{PIPELINE_LABELS[s]}</option>
                    ))}
                  </select>
                  <button className={btnDanger} onClick={() => deleteProject(p.id)}>Excluir</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ================= Fluxo de caixa ================= */

function CashFlow() {
  const db = useDB();
  const [month, setMonth] = useState(() => monthKeyOf(todayISO()));
  const [projectFilter, setProjectFilter] = useState<string>("todos");
  const [tipo, setTipo] = useState<TransactionTipo>("receita");
  const [categoria, setCategoria] = useState(TRANSACTION_CATEGORIES.receita[0]);
  const [projectId, setProjectId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(() => todayISO());
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    return db.transactions.filter((t) => {
      if (monthKeyOf(t.data) !== month) return false;
      if (projectFilter !== "todos" && t.projectId !== projectFilter) return false;
      return true;
    });
  }, [db.transactions, month, projectFilter]);

  const totals = useMemo(() => {
    let receitas = 0;
    let despesas = 0;
    for (const t of filtered) {
      if (t.tipo === "receita") receitas += t.valorCentavos;
      else despesas += t.valorCentavos;
    }
    return { receitas, despesas, saldo: receitas - despesas };
  }, [filtered]);

  function onTipoChange(next: TransactionTipo) {
    setTipo(next);
    setCategoria(TRANSACTION_CATEGORIES[next][0]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cents = parseReaisToCentavos(valor);
    if (cents === null) {
      setError("Informe um valor válido em reais (ex.: 1500,00).");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      setError("Informe uma data válida.");
      return;
    }
    addTransaction({
      tipo,
      categoria,
      projectId: projectId || null,
      descricao: descricao.trim() || categoria,
      valorCentavos: cents,
      data,
    });
    setDescricao("");
    setValor("");
    setError("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <div>
          <label className={labelCls} htmlFor="cf-month">Mês</label>
          <input
            id="cf-month"
            type="month"
            className={inputCls}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="min-w-52 flex-1">
          <label className={labelCls} htmlFor="cf-proj">Projeto</label>
          <select id="cf-proj" className={inputCls} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="todos">Todos os projetos</option>
            {db.projects.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Receitas · {monthLabel(month)}</p>
          <p className="mt-2 font-display text-2xl font-bold text-ok">{fmtBRL(totals.receitas)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Despesas · {monthLabel(month)}</p>
          <p className="mt-2 font-display text-2xl font-bold text-bad">{fmtBRL(totals.despesas)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Saldo do mês</p>
          <p className={`mt-2 font-display text-2xl font-bold ${totals.saldo >= 0 ? "text-paper" : "text-bad"}`}>
            {fmtBRL(totals.saldo)}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-line bg-panel p-5">
        <h3 className="font-display text-lg font-bold text-paper">Novo lançamento</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="cf-tipo">Tipo</label>
            <select id="cf-tipo" className={inputCls} value={tipo} onChange={(e) => onTipoChange(e.target.value as TransactionTipo)}>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="cf-cat">Categoria</label>
            <select id="cf-cat" className={inputCls} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {TRANSACTION_CATEGORIES[tipo].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="cf-valor">Valor (R$)</label>
            <input id="cf-valor" className={inputCls} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="1500,00" inputMode="decimal" />
          </div>
          <div>
            <label className={labelCls} htmlFor="cf-data">Data</label>
            <input id="cf-data" type="date" className={inputCls} value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="cf-proj2">Projeto (opcional)</label>
            <select id="cf-proj2" className={inputCls} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Sem projeto vinculado</option>
              {db.projects.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="cf-desc">Descrição</label>
            <input id="cf-desc" className={inputCls} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: sinal do projeto da cozinha" />
          </div>
        </div>
        {error && <p className="mt-3 text-sm font-medium text-bad">{error}</p>}
        <button type="submit" className={`${btnPrimary} mt-4`}>Adicionar lançamento</button>
      </form>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
          Nenhum lançamento neste mês{filtersuffix(projectFilter)}. Adicione o primeiro acima.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-panel-2 text-muted">
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest">Data</th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest">Descrição</th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest">Categoria</th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-widest">Projeto</th>
                <th className="px-4 py-3 text-right font-mono text-[11px] uppercase tracking-widest">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const project = db.projects.find((p) => p.id === t.projectId);
                return (
                  <tr key={t.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-muted">{fmtDate(t.data)}</td>
                    <td className="px-4 py-3 font-medium text-paper">{t.descricao}</td>
                    <td className="px-4 py-3 text-muted">{t.categoria}</td>
                    <td className="px-4 py-3 text-muted">{project ? project.nome : "—"}</td>
                    <td className={`px-4 py-3 text-right font-bold ${t.tipo === "receita" ? "text-ok" : "text-bad"}`}>
                      {t.tipo === "receita" ? "+" : "−"} {fmtBRL(t.valorCentavos)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className={btnDanger} onClick={() => deleteTransaction(t.id)}>Excluir</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function filtersuffix(projectFilter: string): string {
  return projectFilter === "todos" ? "" : " para este projeto";
}

/* ================= App do admin ================= */

export default function Admin() {
  const [unlocked, setUnlocked] = useState(() => isAdminSession());
  const [tab, setTab] = useState<"crm" | "caixa">("crm");
  const db = useDB();

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-ink font-sans text-paper">
        <Gate onUnlock={() => setUnlocked(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink font-sans text-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold tracking-tight">BONELLI</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand">Admin</span>
          </div>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setTab("crm")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${tab === "crm" ? "bg-brand text-ink" : "text-muted hover:text-paper"}`}
            >
              CRM ({db.leads.length} leads)
            </button>
            <button
              onClick={() => setTab("caixa")}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${tab === "caixa" ? "bg-brand text-ink" : "text-muted hover:text-paper"}`}
            >
              Fluxo de caixa
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#/" className="text-sm text-muted hover:text-paper">Ver o site</a>
            <button
              className={btnGhost}
              onClick={() => { endAdminSession(); setUnlocked(false); }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {tab === "crm" ? (
          <>
            <h1 className="font-display text-2xl font-bold">CRM — Leads, clientes e projetos</h1>
            <p className="mt-1 text-sm text-muted">
              Os pedidos do formulário do site chegam aqui. Clique num lead para ver os
              detalhes, mudar o status, virar cliente ou criar o projeto.
            </p>
            <div className="mt-6">
              <LeadsSection />
              <ClientsSection />
              <ProjectsSection />
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold">Fluxo de caixa</h1>
            <p className="mt-1 text-sm text-muted">
              Receitas e despesas do escritório, por mês e por projeto. Os dados ficam
              salvos neste navegador.
            </p>
            <div className="mt-6">
              <CashFlow />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
