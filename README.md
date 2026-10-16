# Barbearia Navalha de Ouro — Demo

Sistema de demonstração para barbearias: site do cliente com landing, agendamento online e pagamento simulado.
**Todos os dados são fictícios** e ficam salvos apenas no navegador (localStorage). Não existe backend.

Stack: React + Vite + TypeScript · Tailwind CSS v4 · react-router-dom · Recharts · lucide-react · date-fns.

## Rotas

| Rota | O que é |
|---|---|
| `/` | Landing da barbearia |
| `/agendar` | Fluxo de agendamento (5 passos) |
| `/pagamento/:id` · `/comprovante/:id` | Pagamento simulado e comprovante |
| `/painel` | **Painel do dono**: dashboard |
| `/painel/agenda` · `/financeiro` · `/barbeiros` · `/clientes` · `/estoque` | Demais seções do painel |

## Como rodar

Requisitos: [Node.js](https://nodejs.org) 20 ou superior.

```bash
npm install      # instala as dependências (só na primeira vez)
npm run dev      # abre em http://localhost:5173
```

Outros comandos:

```bash
npm run build    # gera a versão de produção na pasta dist/
npm run preview  # serve a pasta dist/ localmente para testar o build
npm run lint     # verifica o código
```

## Como publicar no Netlify

**Opção A — arrastar e soltar (mais rápida)**
1. Rode `npm run build`.
2. Acesse [app.netlify.com/drop](https://app.netlify.com/drop) e arraste a pasta `dist/`.

**Opção B — via GitHub (deploy automático a cada push)**
1. Suba o projeto para um repositório no GitHub.
2. No Netlify: *Add new site → Import an existing project* e escolha o repositório.
3. Configure: **Build command** `npm run build` · **Publish directory** `dist`.

O arquivo `public/_redirects` já está configurado para que as rotas do React Router
(`/agendar`, `/pagamento/...`) funcionem ao recarregar a página.

## Estrutura

```
src/
  components/   layout/ · home/ · booking/ · payment/ · ui/
  pages/        Home, Booking, Payment, Receipt, NotFound
  pages/admin/  Dashboard, Agenda, Financeiro, Barbeiros, Clientes, Estoque
  components/admin/  sidebar, cards de KPI, tooltips e tema dos gráficos
  data/seed.ts  serviços, barbeiros, horários, avaliações (dados fictícios)
  data/adminSeed.ts  dados mock do painel (atendimentos, clientes, despesas, estoque)
  lib/          agenda (schedule), analytics (cálculos do painel), storage, formatação, tipos
  hooks/        useInView
```

## Personalizar para um cliente real

- Dados do negócio, serviços, equipe e horários: `src/data/seed.ts`
- Cores, fontes, raios e sombras (tokens): `src/index.css` (bloco `@theme`)
- Fotos: IDs do Unsplash em `galleryIds` (`seed.ts`); troque pelas fotos reais do cliente.

## Painel do dono

- **Fonte única de dados:** `src/data/adminSeed.ts` gera ~14 meses de atendimentos, 900 clientes, despesas e compras de
  produtos, sempre relativos a "hoje". A agenda do site e a do painel usam a MESMA base, então os horários batem.
- **Integração com o site:** agendamentos feitos em `/agendar` (localStorage) aparecem na Agenda, no Dashboard
  ("Chegando pelo site") e em Clientes, marcados com o selo "site".
- **Para usar dados reais:** substitua as funções de `adminSeed.ts`; as telas leem tudo via `src/lib/analytics.ts`.
- Comissões por barbeiro: `commissionRates` em `adminSeed.ts`.

## Como funciona a demonstração

- **Agenda:** horários ocupados são gerados de forma determinística (clientes fictícios) e somados aos
  agendamentos feitos por você, que ficam salvos em `localStorage` (chave `navalha:appointments:v1`).
- **Pagamento:** PIX (QR e código falsos) e cartão (formulário falso). Nenhum valor é cobrado.
- Para limpar os agendamentos: DevTools → Application → Local Storage → apagar a chave acima.
