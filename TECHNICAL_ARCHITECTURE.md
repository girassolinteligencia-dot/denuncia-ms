# Estrutura Técnica e Arquitetura: Plataforma MAIS Denúncia MS

Este documento detalha a arquitetura interna, o stack tecnológico e as regras de negócio da plataforma **DENUNCIA MS**, desenvolvida para o Governo de Mato Grosso do Sul. Foi concebido para fornecer contexto técnico exaustivo a agentes de IA (como Claude).

## 1. Visão Geral (Stack Tecnológico)

A plataforma é uma aplicação full-stack moderna construída sob o paradigma de **Server-First** e **Type-Safety**.

- **Frontend/Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados/Backend-as-a-Service**: Supabase (PostgreSQL)
- **Estilização**: Tailwind CSS com design system personalizado (Aesthetics: Premium/Modern)
- **Gerenciamento de Estado**: React Hooks + Server Actions
- **Geração de Documentos**: jsPDF (Server-side)
- **Comunicação/E-mail**: Resend API
- **Arquivamento**: Supabase Storage
- **Validação**: Zod + React Hook Form

---

## 2. Arquitetura de Dados (Database Schema)

O banco de dados utiliza PostgreSQL no Supabase com **Row Level Security (RLS)** habilitado em todas as tabelas.

### Tabelas Principais:
- **`profiles`**: Extensão do `auth.users`, define roles (`superadmin`, `admin`, `moderador`).
- **`denuncias`**: Coração do sistema. Armazena protocolos, títulos, descrições, dados geográficos e status.
- **`categorias`**: Define o tipo da denúncia, slug, emoji e instruções específicas.
- **`localidades_cep`**: (Adicionado em 21/04/2026) Base local de CEPs do MS (11.941 registros) para auto-preenchimento e validação territorial sem dependência de APIs externas lentas.
- **`arquivos_denuncia`**: Metadados de evidências enviadas (fotos/documentos) vinculados ao Storage.
- **`integracoes_destino`**: Configurações de webhooks e e-mails de destino por categoria.
- **`plataforma_config`**: Armazena tokens de identidade visual, cores e slogans (Módulo 0).
- **`config_templates`**: Templates Mustache/Handlebars-like para cabeçalhos e rodapés de PDFs e e-mails.

### Segurança e RLS:
- **Público**: Pode disparar `INSERT` em `denuncias` e `SELECT` em `categorias`, `noticias`, `banners` e `localidades_cep`.
- **Moderador**: Acesso de leitura e atualização de status em denúncias.
- **Admin**: Gestão completa de categorias e integrações.
- **Superadmin**: Controle total sobre configurações do sistema e templates.

---

## 3. Fluxos de Trabalho (Core Flows)

### A. Fluxo de Registro de Denúncia (`registrarDenuncia`)
1. **Captura**: Usuário preenche o `DenunciaFormWizard`.
2. **Geolocalização**: O sistema usa a base local `localidades_cep` para auto-preencher logradouro/bairro ao digitar o CEP.
3. **Action (Server-Side)**:
   - Gera Protocolo Atômico (ex: `DNS-2026-000421`).
   - Sobe arquivos para o Supabase Storage.
   - **Geração de PDF**: Cria um documento oficial assinado digitalmente (via jsPDF) usando os templates de cabeçalho/rodapé configurados.
   - **Persistência**: Salva a denúncia e vincula os metadados dos arquivos.
   - **Despacho**: Dispara assincronamente webhooks e e-mails para os órgãos competentes (ex: Ouvidoria Municipal, SESAU, SEJUSP).

### B. Ingestão e Inteligência Territorial
- A plataforma consome dados brutos (JSON/CSV) de infraestruturas estaduais.
- O script `generate-cep-sql.mjs` converte dados de endereços para seeds SQL, permitindo que a plataforma funcione offline/localmente para buscas de endereço.

---

## 4. Organização do Projeto

```text
/
├── app/                  # Rotas Next.js (Admin, Público, Auth)
├── components/           # UI Components (Radix/Tailwind)
│   ├── admin/            # Dashboard e Gestão
│   ├── public/           # Wizard de Denúncia e Landing Page
│   └── ui/               # Componentes atômicos (Design System)
├── lib/                  # Lógica de Negócio (Server-side)
│   ├── actions/          # Server Actions (Denúncia, CEP, Admin)
│   ├── supabase/         # Clientes admin e browser
│   ├── pdf.ts            # Motor de geração de documentos
│   └── protocolo.ts      # Lógica de sequenciamento atômico
├── supabase/             # Migrações, Schema e Seeds SQL
├── scripts/              # Scripts de manutenção e ingestão
└── types/                # Definições TypeScript globais
```

---

## 5. Endpoints e Integrações Técnicas

- **API Nominatim**: Utilizada como fallback para buscas complexas de endereços.
- **Resend SDK**: Integrado para entrega garantida de e-mails transacionais.
- **Webhooks**: Saídas em JSON via `POST/PUT` com suporte a autenticação Bearer/APIKey para sistemas legados do governo.

---

## 6. Filosofia de Design (Aesthetics)
- **Interatividade**: Transições suaves, animações micro-interativas (Lottie/CSS), glassmorphism em cards administrativos.
- **Responsividade**: Mobile-first para que denúncias possam ser feitas em campo com captura direta de câmera.
- **Identidade**: Uso de cores institucionais do MS (Azul Royal e Amarelo Canário) com tipografia limpa (Inter/Outfit).

---
*Documentação gerada automaticamente para suporte à inteligência artificial.*
