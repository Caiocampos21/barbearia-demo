# Barbearia Navalha de Ouro — Sistema de demonstração

Demo completa de um sistema para barbearias, feita para **mostrar a donos de barbearia** como fica um site profissional:

- **Site do cliente** (`/`): landing premium, agendamento online em 5 passos e pagamento simulado (PIX e cartão) com comprovante.
- **Painel do dono** (`/painel`): dashboard, agenda, financeiro, barbeiros, clientes e estoque, com gráficos.

Tudo é **100% front-end** (sem backend). Os dados são fictícios e os agendamentos feitos no site ficam no `localStorage`
do navegador, aparecendo também no painel. Em todas as telas há aviso de "ambiente de demonstração" e um botão
**Resetar dados** para voltar ao estado original.

**Stack:** React + Vite + TypeScript · Tailwind CSS v4 · react-router-dom · Recharts · lucide-react · date-fns.

## Rotas

| Rota | O que é |
|---|---|
| `/` | Landing da barbearia |
| `/agendar` | Fluxo de agendamento |
| `/pagamento/:id` · `/comprovante/:id` | Pagamento simulado e comprovante |
| `/painel` | Dashboard do dono |
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

O projeto já tem `netlify.toml` (comando de build, pasta `dist`, redirecionamento das rotas e cache) e
`public/_redirects`. Escolha uma das opções:

**Opção A — arrastar e soltar (mais rápida, 2 minutos)**
1. No terminal, na pasta do projeto: `npm install` e depois `npm run build`.
2. Acesse [app.netlify.com/drop](https://app.netlify.com/drop) (faça login se pedir).
3. Arraste a pasta **`dist`** para a página. O site fica no ar com um endereço `nome-aleatorio.netlify.app`.
4. Para trocar o endereço: *Site configuration → Change site name*.

**Opção B — pelo GitHub (publica sozinho a cada `git push`)**
1. Suba o projeto para um repositório no GitHub.
2. No Netlify: *Add new site → Import an existing project → GitHub* e escolha o repositório.
3. As configurações vêm do `netlify.toml` (build `npm run build`, publish `dist`). Clique em *Deploy*.

**Opção C — pelo terminal (Netlify CLI)**
```bash
npx netlify-cli login
npx netlify-cli deploy --prod --dir=dist   # após npm run build
```

Para usar domínio próprio (ex.: `demo.caiocampos.dev`): *Domain management → Add a domain* no painel do Netlify.

## Estrutura

```
src/
  components/
    layout/ home/ booking/ payment/ ui/   site do cliente
    admin/                                sidebar, KPIs, tooltips e tema dos gráficos
  pages/         Home, Booking, Payment, Receipt, NotFound
  pages/admin/   Dashboard, Agenda, Finance, Barbers, Customers, Stock
  data/
    seed.ts       negócio, serviços, barbeiros, horários, avaliações, galeria
    adminSeed.ts  gerador dos dados do painel (atendimentos, clientes, despesas, estoque)
  lib/           agenda (schedule/grid), analytics (cálculos do painel), storage, formatação, tipos
  hooks/         useInView, useAdminData, usePageTitle
```

## Como funcionam os dados

- **Uma fonte única:** `adminSeed.ts` gera ~4 meses de histórico (≈ 600 clientes, ≈ 1.000 atendimentos/mês, preços
  reais de BH, mais movimento sexta e sábado) e agenda futura. O site e o painel usam a mesma base, então os horários batem.
- Os dados são **determinísticos** e **relativos a "hoje"**: todo dia o mês atual aparece preenchido e igual para qualquer pessoa.
- Agendamentos feitos em `/agendar` entram na Agenda, no Dashboard ("Chegando pelo site") e em Clientes, com selo "site".
- No mês em andamento, as despesas fixas entram proporcionais aos dias decorridos (regime de competência).
- **Resetar dados** (botão no painel e no selo no canto do site) apaga as chaves `navalha:*` do `localStorage` e recarrega.

## O que dá pra personalizar por cliente

Este projeto é a base para cada barbearia nova. O que trocar, na ordem:

1. **Nome, endereço, telefone, WhatsApp e Instagram:** objeto `business` em `src/data/seed.ts`. O nome também aparece em
   `index.html` (título e meta tags), `src/components/layout/Logo.tsx` e `src/hooks/usePageTitle.ts`.
2. **Serviços e preços:** lista `services` em `seed.ts` (nome, descrição, preço, duração em minutos). Ajuste os pesos de
   venda em `serviceWeights` (`adminSeed.ts`) para o painel refletir o mix do cliente.
3. **Equipe:** lista `barbers` em `seed.ts` (nome, especialidade, folgas) e as comissões em `commissionRates` (`adminSeed.ts`).
4. **Horário de funcionamento:** `weekHours` em `seed.ts` (a agenda e o "Aberto agora" se ajustam sozinhos).
5. **Cores e fontes:** tokens no bloco `@theme` de `src/index.css` (`--color-gold-*` é o destaque; troque o dourado por
   qualquer cor da marca e o site inteiro acompanha). Fontes: link do Google Fonts em `index.html` e `--font-display` / `--font-sans`.
6. **Logo:** hoje é um ícone de tesoura + texto em `Logo.tsx` e `public/favicon.svg`. Para usar o logo do cliente,
   coloque o arquivo em `public/` e troque o conteúdo de `Logo.tsx` por uma `<img>`.
7. **Fotos:** IDs do Unsplash em `galleryIds` e `heroImage` (`seed.ts`, `lib/images.ts`). Troque pelas fotos reais do
   cliente (coloque em `public/fotos/` e ajuste `Photo.tsx` para URLs locais). Avaliações em `reviews`.
8. **Para usar com dados reais:** o painel lê tudo por `src/lib/analytics.ts`. Basta substituir as funções de
   `adminSeed.ts` por dados de uma API.

> Dica: antes de apresentar a um cliente novo, rode `npm run build && npm run preview` e confira no celular.
