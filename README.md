# Bonelli Arquitetura — site do escritório

Site do escritório Bonelli Arquitetura (Caculé, BA), com CRM e fluxo de caixa
embutidos no painel do administrador.

- **Site público (`#/`):** hero, serviços (Reforma, Construção, Interiores),
  portfólio, processo, sobre e formulário de orçamento — os pedidos caem
  direto no CRM.
- **Painel do administrador (`#/admin`):** protegido por senha-mestra criada
  no primeiro acesso (o hash fica no navegador; nenhuma senha no código).
  - **CRM:** leads com funil (novo → contato → orçamento → projeto → obra →
    entregue), detalhe do lead, conversão em cliente, criação de projeto a
    partir do lead, clientes e projetos.
  - **Fluxo de caixa:** receitas e despesas por mês e por projeto, com
    resumo (receitas, despesas, saldo do mês).

## Design

Visual da Braba Lab (só o design — nenhum código copiado): fundo quase preto
(`oklch(0.155 0.008 262)`), texto quase branco, primária azul viva
(`oklch(0.7 0.18 250)`), display Sora, corpo Manrope, acentos JetBrains Mono.

## Stack

Vite + React + TypeScript + Tailwind CSS v4. Sem backend por enquanto: os dados
vivem no `localStorage` do navegador (`bonelli-escritorio-db-v1`) e o app
funciona offline. Roteamento por hash (`#/admin`) para funcionar em
hospedagem estática sem fallback de SPA.

## Rodar local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build → dist/
```

## Publicar (padrão do dono — zero crédito da Lovable)

1. Criar um projeto **em branco** na conta Lovable do bonellando
   (por cliques, sem usar a IA da Lovable).
2. Conectar o projeto ao repositório GitHub (ex.: `bonicripto/bonelli-arquitetura`)
   e subir este código.
3. **Publish por cliques** no Lovable. Publicar não gasta crédito.

## Banco de dados (futuro)

`supabase/migrations/0001_office_crm.sql` tem as tabelas `leads`, `clients`,
`projects` e `transactions` com RLS dono (`user_id = auth.uid()`), no mesmo
modelo dos tipos em `src/lib/types.ts`. **Não aplicada ainda** — quando o
painel ganhar backend, aplicar no editor SQL e trocar a camada de dados
(`src/lib/store.ts`) por Supabase; os nomes de tabela/coluna não mudam.

## Pendências (decisão do dono)

- **Fotos do portfólio:** os cartões hoje são placeholders ("Projeto em breve").
  Fotos reais dos projetos entram depois.
- **Acento dourado?** A marca do escritório (placa) é preto premium + dourado;
  o site segue o azul da Braba Lab por decisão dele. Se quiser dourado nos
  detalhes, trocar `--color-brand` em `src/index.css`.
- **Senha-mestra:** o primeiro acesso ao `#/admin` cria a senha. Se esquecer,
  limpar o `localStorage` do site (`bonelli-escritorio-admin-hash`) e criar
  outra — os dados do CRM ficam, só a senha reseta.
