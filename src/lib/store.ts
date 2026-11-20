/* Persistência local (localStorage) do CRM + fluxo de caixa.
   Funciona offline. A migration em supabase/migrations/0001_office_crm.sql
   é o passo seguinte quando o painel ganhar backend — mesmo modelo. */

import { useSyncExternalStore } from "react";
import type {
  Client,
  DB,
  Lead,
  LeadTipo,
  PipelineStatus,
  Project,
  ProjectStatus,
  Transaction,
  TransactionTipo,
} from "./types";

const KEY = "bonelli-escritorio-db-v1";

const emptyDB: DB = { leads: [], clients: [], projects: [], transactions: [] };

let cache: DB | null = null;
const listeners = new Set<() => void>();

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...emptyDB };
    const parsed = JSON.parse(raw) as Partial<DB>;
    return {
      leads: Array.isArray(parsed.leads) ? parsed.leads : [],
      clients: Array.isArray(parsed.clients) ? parsed.clients : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      transactions: Array.isArray(parsed.transactions)
        ? parsed.transactions
        : [],
    };
  } catch {
    return { ...emptyDB };
  }
}

export function getDB(): DB {
  if (!cache) cache = load();
  return cache;
}

function save(next: DB): void {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Armazenamento cheio/bloqueado: os dados seguem em memória na sessão.
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, getDB);
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

/* ---------------- Leads ---------------- */

export interface NewLeadInput {
  nome: string;
  telefone: string;
  tipo: LeadTipo;
  cidade: string;
  ambiente: string;
  prazo: string;
  mensagem: string;
  fotos: string;
}

export function addLead(input: NewLeadInput): Lead {
  const lead: Lead = {
    ...input,
    id: uid(),
    status: "novo",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  const db = getDB();
  save({ ...db, leads: [lead, ...db.leads] });
  return lead;
}

export function updateLead(
  id: string,
  patch: Partial<Omit<Lead, "id" | "createdAt">>,
): void {
  const db = getDB();
  save({
    ...db,
    leads: db.leads.map((l) =>
      l.id === id ? { ...l, ...patch, updatedAt: nowISO() } : l,
    ),
  });
}

export function setLeadStatus(id: string, status: PipelineStatus): void {
  updateLead(id, { status });
}

export function deleteLead(id: string): void {
  const db = getDB();
  save({ ...db, leads: db.leads.filter((l) => l.id !== id) });
}

/** Converte um lead em cliente (mantém o vínculo leadId). */
export function convertLeadToClient(leadId: string): Client | null {
  const db = getDB();
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  const existing = db.clients.find((c) => c.leadId === leadId);
  if (existing) return existing;
  const client: Client = {
    id: uid(),
    nome: lead.nome,
    telefone: lead.telefone,
    cidade: lead.cidade,
    leadId: lead.id,
    createdAt: nowISO(),
  };
  save({ ...db, clients: [client, ...db.clients] });
  return client;
}

/* ---------------- Clientes ---------------- */

export function addClient(input: {
  nome: string;
  telefone: string;
  cidade: string;
}): Client {
  const client: Client = {
    ...input,
    id: uid(),
    leadId: null,
    createdAt: nowISO(),
  };
  const db = getDB();
  save({ ...db, clients: [client, ...db.clients] });
  return client;
}

export function deleteClient(id: string): void {
  const db = getDB();
  save({ ...db, clients: db.clients.filter((c) => c.id !== id) });
}

/* ---------------- Projetos ---------------- */

export function addProject(input: {
  nome: string;
  clientId: string | null;
  leadId: string | null;
  status: ProjectStatus;
  cidade: string;
  descricao: string;
}): Project {
  const project: Project = { ...input, id: uid(), createdAt: nowISO() };
  const db = getDB();
  save({ ...db, projects: [project, ...db.projects] });
  return project;
}

/** Cria um projeto a partir de um lead (e garante o cliente). */
export function createProjectFromLead(leadId: string, nome: string): Project | null {
  const db = getDB();
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  const client = convertLeadToClient(leadId);
  const project = addProject({
    nome,
    clientId: client ? client.id : null,
    leadId: lead.id,
    status: "orçamento",
    cidade: lead.cidade,
    descricao: `${lead.tipo} — ${lead.ambiente}`,
  });
  updateLead(leadId, { status: "projeto" });
  return project;
}

export function updateProject(
  id: string,
  patch: Partial<Omit<Project, "id" | "createdAt">>,
): void {
  const db = getDB();
  save({
    ...db,
    projects: db.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  });
}

export function deleteProject(id: string): void {
  const db = getDB();
  save({ ...db, projects: db.projects.filter((p) => p.id !== id) });
}

/* ---------------- Fluxo de caixa ---------------- */

export function addTransaction(input: {
  tipo: TransactionTipo;
  categoria: string;
  projectId: string | null;
  descricao: string;
  valorCentavos: number;
  data: string;
}): Transaction {
  const tx: Transaction = { ...input, id: uid(), createdAt: nowISO() };
  const db = getDB();
  const next = [...db.transactions, tx].sort((a, b) =>
    a.data < b.data ? 1 : a.data > b.data ? -1 : 0,
  );
  save({ ...db, transactions: next });
  return tx;
}

export function deleteTransaction(id: string): void {
  const db = getDB();
  save({
    ...db,
    transactions: db.transactions.filter((t) => t.id !== id),
  });
}
