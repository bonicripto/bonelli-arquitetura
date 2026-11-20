/* Tipos do escritório — espelham a migration
   supabase/migrations/0001_office_crm.sql. */

export type LeadTipo = "reforma" | "construção" | "interiores" | "outro";

/** Funil do CRM: novo → contato → orçamento → projeto → obra → entregue. */
export type PipelineStatus =
  | "novo"
  | "contato"
  | "orçamento"
  | "projeto"
  | "obra"
  | "entregue";

export const PIPELINE_STATUSES: PipelineStatus[] = [
  "novo",
  "contato",
  "orçamento",
  "projeto",
  "obra",
  "entregue",
];

export const PIPELINE_LABELS: Record<PipelineStatus, string> = {
  novo: "Novo",
  contato: "Em contato",
  orçamento: "Orçamento",
  projeto: "Projeto",
  obra: "Obra",
  entregue: "Entregue",
};

export type ProjectStatus = "orçamento" | "projeto" | "obra" | "entregue";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "orçamento",
  "projeto",
  "obra",
  "entregue",
];

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  tipo: LeadTipo;
  cidade: string;
  ambiente: string;
  prazo: string;
  mensagem: string;
  /** Links/observações sobre fotos enviadas pelo cliente. */
  fotos: string;
  status: PipelineStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  leadId: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  nome: string;
  clientId: string | null;
  leadId: string | null;
  status: ProjectStatus;
  cidade: string;
  descricao: string;
  createdAt: string;
}

export type TransactionTipo = "receita" | "despesa";

export interface Transaction {
  id: string;
  tipo: TransactionTipo;
  categoria: string;
  projectId: string | null;
  descricao: string;
  /** Valor em centavos — evita erro de ponto flutuante. */
  valorCentavos: number;
  /** Data ISO YYYY-MM-DD. */
  data: string;
  createdAt: string;
}

export interface DB {
  leads: Lead[];
  clients: Client[];
  projects: Project[];
  transactions: Transaction[];
}

export const TRANSACTION_CATEGORIES: Record<TransactionTipo, string[]> = {
  receita: [
    "Sinal do projeto",
    "Parcela do projeto",
    "Consultoria",
    "Projeto executivo",
    "Outros",
  ],
  despesa: [
    "Aluguel",
    "Energia",
    "Internet",
    "Material",
    "Mão de obra",
    "Marketing",
    "Transporte",
    "Outros",
  ],
};
