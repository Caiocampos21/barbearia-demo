# Barbearia Navalha de Ouro — Demo

Sistema de demonstração para barbearias: site do cliente com landing, agendamento online e pagamento simulado.
**Todos os dados são fictícios** e ficam salvos apenas no navegador (localStorage). Não existe backend.

Stack: React + Vite + TypeScript · Tailwind CSS v4 · react-router-dom · Recharts · lucide-react · date-fns.

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
  data/seed.ts  serviços, barbeiros, horários, avaliações (dados fictícios)
  lib/          agenda (schedule), storage (localStorage), formatação, tipos
  hooks/        useInView
```

## Personalizar para um cliente real

- Dados do negócio, serviços, equipe e horários: `src/data/seed.ts`
- Cores, fontes, raios e sombras (tokens): `src/index.css` (bloco `@theme`)
- Fotos: IDs do Unsplash em `galleryIds` (`seed.ts`); troque pelas fotos reais do cliente.

## Como funciona a demonstração

- **Agenda:** horários ocupados são gerados de forma determinística (clientes fictícios) e somados aos
  agendamentos feitos por você, que ficam salvos em `localStorage` (chave `navalha:appointments:v1`).
- **Pagamento:** PIX (QR e código falsos) e cartão (formulário falso). Nenhum valor é cobrado.
- Para limpar os agendamentos: DevTools → Application → Local Storage → apagar a chave acima.
