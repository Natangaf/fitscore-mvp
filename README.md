# FitScore — Mini MVP

Mini MVP para avaliação de candidatos com base em Performance, Energia e Cultura, gerando um FitScore e classificação automática.

---

## 🚀 Deploy

O app está publicado em:
👉 [https://seu-deploy.vercel.app](https://fitscore-mvp-gray.vercel.app/forms)

---

## ✨ Features

* **Formulário FitScore** com 10 perguntas em 3 blocos (Performance, Energia, Cultura).
* **Dashboard** para avaliadores:

  * Lista de candidatos avaliados
  * Filtros por classificação
  * Breakdown P/E/C com barras + marcador
  * KPIs e donut de distribuição
  * Estados de *loading*, *empty* e *error*
* **Autenticação com Supabase** (email/senha).
* **Persistência** dos candidatos no Supabase (tabela `candidates`).
* **Processamento Assíncrono com n8n**:

  * Envio automático de e-mail ao candidato com seu resultado após envio do formulário.
  * Relatório de aprovados (FitScore ≥ 80) enviado ao gestor a cada 12h.
* **Arquitetura documentada** na pasta [`/docs`](./docs).

---

## 📦 Stack

* **Front-end:** Next.js (App Router, TSX, TailwindCSS)
* **Auth & DB:** Supabase (auth + Postgres)
* **Processos assíncronos:** n8n (workflows com webhooks + SMTP)
* **Deploy:** Vercel

---

## ⚙️ Setup

### 1. Clone e instale dependências

```bash
git clone https://github.com/seu-usuario/fitscore-mvp.git
cd fitscore-mvp
npm install
```

### 2. Configuração do Supabase

No Supabase, crie:

* Projeto (free tier)
* Tabela `candidates`:

```sql
create table candidates (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  p_experiencia int,
  p_entregas int,
  p_habilidades int,
  e_disponibilidade int,
  e_prazos int,
  e_pressao int,
  e_proatividade int,
  c_valores int,
  c_comunicacao int,
  c_colaboracao int,
  fitscore float,
  fit_class text,
  created_at timestamp default now()
);
```

Crie variáveis em `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # usado no n8n
```

### 3. Rodar local

```bash
npm run dev
```

---

## 📊 Processamento Assíncrono (n8n)

* **Workflow 1 — Notificação de Resultado**

  * Trigger: Webhook chamado pelo envio do formulário.
  * Ações:

    * Inserir candidato no Supabase.
    * Enviar e-mail com o resultado (FitScore e classificação).

* **Workflow 2 — Relatório de Aprovados**

  * Trigger: Cron (a cada 12h).
  * Ações:

    * Consultar Supabase (candidatos com `fitscore >= 80`).
    * Enviar e-mail consolidado ao gestor.

* **Plus**: possibilidade de adicionar lógica extra (ex.: enviar resumo semanal em CSV/Excel para análise do time de RH).

---

## 📚 Documentação

Detalhes adicionais de arquitetura e decisões técnicas estão em [`/docs/arquitetura.md`](./docs/arquitetura.md).

---

## 📹 Vídeo

Foi gravado um vídeo de até 5 minutos mostrando:

* Formulário de envio
* Dashboard filtrando candidatos
* Fluxo no n8n funcionando

👉 Link: *(inserir aqui)*

---

## ✅ Critérios Atendidos

* Deploy público ✔️
* Processo assíncrono implementado ✔️
* Persistência no Supabase ✔️
* Front-end bem trabalhado ✔️
* README + Docs completos ✔️
