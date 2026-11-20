-- 0001 — CRM + fluxo de caixa do escritório Bonelli Arquitetura.
--
-- Tabelas: leads (pedidos do formulário do site), clients, projects,
-- transactions (receitas/despesas). Modelo idêntico ao do app local
-- (src/lib/types.ts) — a troca do localStorage por Supabase é só trocar
-- a camada de dados; nenhum nome de tabela/coluna muda.
--
-- NÃO APLICADA AINDA: o app hoje persiste em localStorage e funciona
-- offline. Quando o painel ganhar backend, aplicar este arquivo no
-- editor SQL do Lovable/Supabase e commitar como registro.
--
-- Convenções copiadas do Braba Lab (drizzle/migrations/0053):
-- uuid com gen_random_uuid(), timestamptz com now(), updated_at com
-- trigger, RLS dono (user_id = auth.uid()), índices por (user_id, data).
-- Diferença: aqui não existe public.profiles — user_id referencia
-- auth.users direto.

-- Função de updated_at (própria do escritório).
CREATE OR REPLACE FUNCTION public.office_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 1. Leads — pedidos do formulário do site.
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  nome text NOT NULL CHECK (char_length(nome) BETWEEN 1 AND 120),
  telefone text NOT NULL CHECK (char_length(telefone) BETWEEN 8 AND 30),
  tipo text NOT NULL CHECK (tipo IN ('reforma', 'construção', 'interiores', 'outro')),
  cidade text NOT NULL DEFAULT '' CHECK (char_length(cidade) <= 120),
  ambiente text NOT NULL DEFAULT '' CHECK (char_length(ambiente) <= 200),
  prazo text NOT NULL DEFAULT '' CHECK (char_length(prazo) <= 120),
  mensagem text NOT NULL DEFAULT '' CHECK (char_length(mensagem) <= 4000),
  fotos text NOT NULL DEFAULT '' CHECK (char_length(fotos) <= 4000),
  status text NOT NULL DEFAULT 'novo'
    CHECK (status IN ('novo', 'contato', 'orçamento', 'projeto', 'obra', 'entregue')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_user_status_idx
  ON public.leads (user_id, status, created_at DESC);
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.office_updated_at();

-- 2. Clientes.
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  nome text NOT NULL CHECK (char_length(nome) BETWEEN 1 AND 120),
  telefone text NOT NULL CHECK (char_length(telefone) BETWEEN 8 AND 30),
  cidade text NOT NULL DEFAULT '' CHECK (char_length(cidade) <= 120),
  lead_id uuid REFERENCES public.leads (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS clients_user_idx
  ON public.clients (user_id, created_at DESC);
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.office_updated_at();

-- 3. Projetos.
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  nome text NOT NULL CHECK (char_length(nome) BETWEEN 1 AND 200),
  client_id uuid REFERENCES public.clients (id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.leads (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'orçamento'
    CHECK (status IN ('orçamento', 'projeto', 'obra', 'entregue')),
  cidade text NOT NULL DEFAULT '' CHECK (char_length(cidade) <= 120),
  descricao text NOT NULL DEFAULT '' CHECK (char_length(descricao) <= 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projects_user_idx
  ON public.projects (user_id, status, created_at DESC);
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.office_updated_at();

-- 4. Transações do fluxo de caixa (valor em centavos).
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria text NOT NULL CHECK (char_length(categoria) BETWEEN 1 AND 120),
  project_id uuid REFERENCES public.projects (id) ON DELETE SET NULL,
  descricao text NOT NULL DEFAULT '' CHECK (char_length(descricao) <= 500),
  valor_centavos integer NOT NULL CHECK (valor_centavos > 0),
  data date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS transactions_user_data_idx
  ON public.transactions (user_id, data DESC);
CREATE INDEX IF NOT EXISTS transactions_project_idx
  ON public.transactions (project_id, data DESC);
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.office_updated_at();

-- 5. RLS dono: só o dono vê e altera os próprios registros.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY leads_select_own ON public.leads
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY leads_insert_own ON public.leads
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY leads_update_own ON public.leads
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY leads_delete_own ON public.leads
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY clients_select_own ON public.clients
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY clients_insert_own ON public.clients
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY clients_update_own ON public.clients
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY clients_delete_own ON public.clients
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY projects_select_own ON public.projects
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY projects_insert_own ON public.projects
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY projects_update_own ON public.projects
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY projects_delete_own ON public.projects
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY transactions_select_own ON public.transactions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY transactions_insert_own ON public.transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY transactions_update_own ON public.transactions
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY transactions_delete_own ON public.transactions
  FOR DELETE USING (user_id = auth.uid());
