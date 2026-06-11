# Documentação Funcional — Módulo de Perfis
## `br.ipti.form` — Tela de Gerenciamento de Perfis

---

## 1. Contexto e Motivação

O sistema possuía reaplicadores e coordenadores como `role` dentro do cadastro de usuários
(`users.role = REAPPLICATORS / COORDINATORS`). A nova arquitetura separa o **perfil operacional**
da **conta de login**:

- **Conta de login** (`users`): credenciais de acesso. `role` só pode ser `ADMIN` ou `USER`.
- **Perfil operacional** (`profile`): identidade de campo. Tipo: `COORDINATOR` ou `REAPPLICATOR`.
  Um perfil pode existir **sem** uma conta de login vinculada.

A tela de gerenciamento de perfis substitui e expande a tela de reaplicadores, centralizando
o gerenciamento de coordenadores e reaplicadores num único lugar.

---

## 2. Público-Alvo das Telas

| Ator | Tela de Perfis | Tela de Usuários |
|---|---|---|
| **Administrador** (`role: ADMIN`) | Acesso total: criar, editar, excluir, visualizar | Acesso total |
| **Coordenador** (`profileType: COORDINATOR`) | Somente leitura (sem criar/editar/excluir) | Sem acesso |
| Outros | Sem acesso | Sem acesso |

---

## 3. Histórias Funcionais — Tela de Perfis

### HF-01 — Listar perfis

**Como** administrador ou coordenador,
**Quero** ver a lista de todos os perfis cadastrados,
**Para que** eu possa acompanhar quem está ativo no programa.

**Critérios de aceite:**
- A lista exibe: Nome, Tipo (Coordenador/Reaplicador), E-mail, Telefone, Tecnologias Sociais, Status (Ativo/Inativo), coluna "Usuário" (Vinculado / —)
- Paginação com 10 registros por página (padrão)
- Filtro por **nome** (campo de busca livre)
- Filtro por **tipo** (select: Todos / Coordenador / Reaplicador)
- Os filtros resetam a paginação para a página 1 ao serem alterados
- Coordenador vê a lista mas não vê os botões de criar/editar/excluir

---

### HF-02 — Visualizar detalhe do perfil

**Como** administrador,
**Quero** ver todos os dados de um perfil específico,
**Para que** eu possa verificar informações detalhadas e o histórico completo.

**Critérios de aceite:**
- Exibe todos os dados pessoais do perfil
- Exibe o **tipo atual** (Coordenador / Reaplicador) com badge colorido
- Exibe a seção de **conta de login** vinculada (nome, username, status, link para editar usuário)
- Se não houver usuário vinculado, exibe botão "Vincular usuário" (somente admin)
- Se houver usuário vinculado, exibe botão "Desvincular" (somente admin)
- Exibe a lista de **tecnologias sociais** vinculadas
- Exibe o **histórico de tipo** (linha do tempo de quando o tipo mudou, com motivo e responsável)
- Botões de editar e excluir disponíveis para admin

---

### HF-03 — Criar perfil sem conta de login

**Como** administrador,
**Quero** cadastrar um perfil sem precisar criar uma conta de login,
**Para que** a pessoa já exista no sistema antes de ter acesso à plataforma.

**Critérios de aceite:**
- Formulário com os campos: Nome*, Tipo*, E-mail, Telefone, Sexo*, Cor/Raça*, Data de Nascimento*, Data de Início, Status Ativo
- O campo Tipo é obrigatório: Coordenador ou Reaplicador
- Não há campo de usuário no formulário de criação — o vínculo é feito depois, na tela de detalhe
- O perfil é criado com `active: true` por padrão
- Após salvar, redireciona para a tela de detalhe do perfil criado

---

### HF-04 — Criar perfil com conta de login

**Como** administrador,
**Quero** criar um perfil já vinculando uma conta de login,
**Para que** a pessoa possa acessar o sistema imediatamente após o cadastro.

**Critérios de aceite:**
- No formulário de criação existe uma seção "Dados de acesso" expansível (toggle "Criar conta de login")
- Se a seção for aberta, requer: nome de usuário (username)*, senha*, confirmação de senha*
- A senha deve ter no mínimo 8 caracteres
- O sistema cria usuário e perfil em uma única operação (`POST /user-bff`)
- Após salvar, o usuário vinculado já aparece no detalhe do perfil

---

### HF-05 — Editar perfil

**Como** administrador,
**Quero** editar os dados de um perfil existente,
**Para que** eu possa corrigir informações ou atualizar dados da pessoa.

**Critérios de aceite:**
- Todos os campos do formulário de criação são editáveis
- A **alteração do tipo** (Coordenador ↔ Reaplicador) mostra um campo de **motivo** (opcional)
- Se o tipo mudar, o sistema registra automaticamente no histórico de tipo
- Após salvar, redireciona para o detalhe do perfil

---

### HF-06 — Vincular conta de login a um perfil

**Como** administrador,
**Quero** vincular uma conta de login existente a um perfil que ainda não tem login,
**Para que** eu possa associar o acesso ao sistema a um perfil já cadastrado.

**Critérios de aceite:**
- No detalhe do perfil (sem usuário vinculado), há botão "Vincular usuário"
- Ao clicar, abre um dropdown/busca com usuários que ainda **não têm perfil vinculado**
- Ao selecionar e confirmar, o sistema chama `PUT /profile/:id` com `{ user_fk: userId }`
- Após vincular, a seção "Conta de Login" é atualizada imediatamente

---

### HF-07 — Desvincular conta de login de um perfil

**Como** administrador,
**Quero** remover o vínculo entre um perfil e a sua conta de login,
**Para que** eu possa revogar o acesso ao sistema sem excluir o perfil operacional.

**Critérios de aceite:**
- No detalhe do perfil (com usuário vinculado), há botão "Desvincular"
- A ação exige confirmação: "Ao desvincular, o usuário perderá o acesso operacional. Deseja continuar?"
- Após confirmar, o sistema chama `PUT /profile/:id` com `{ user_fk: null }`
- O perfil continua existindo — apenas o `user_fk` é removido
- O usuário vinculado não é excluído nem afetado

---

### HF-08 — Visualizar histórico de tipo

**Como** administrador,
**Quero** ver o histórico de mudanças de tipo de um perfil,
**Para que** eu possa rastrear quando e por que a função da pessoa foi alterada.

**Critérios de aceite:**
- O histórico é exibido na tela de detalhe do perfil
- Cada item exibe: tipo anterior → tipo novo, data/hora, usuário responsável, motivo (se preenchido)
- O primeiro registro exibe "—" no tipo anterior (atribuição inicial)
- Ordenado do mais recente para o mais antigo
- Somente leitura — sem opção de editar ou excluir

---

### HF-09 — Excluir perfil

**Como** administrador,
**Quero** excluir um perfil,
**Para que** eu possa remover registros indevidos ou obsoletos.

**Critérios de aceite:**
- O botão de excluir exibe confirmação antes de executar
- A mensagem de confirmação informa que o usuário vinculado não será excluído
- Após excluir, redireciona para a lista de perfis

---

## 4. Histórias Funcionais — Tela de Usuários (mudanças)

> A tela de usuários existe hoje e precisa ser **adaptada** para o novo modelo.
> As histórias abaixo descrevem apenas o que **muda** em relação ao comportamento atual.

---

### HF-10 — Criar usuário (simplificado)

**Como** administrador,
**Quero** criar uma conta de login com apenas os dados de autenticação,
**Para que** os dados pessoais e operacionais fiquem exclusivamente no perfil.

**O que muda:**
- Formulário de criação de usuário passa a ter somente: Nome, Username*, Senha*, Role (ADMIN | USER)
- **Removido**: birthday, phone, email, sex, color_race, initial_date, tecnologias sociais
- **Removido**: role REAPPLICATORS e COORDINATORS — o tipo operacional fica em `profile.current_type`
- O campo `role` passa a ser apenas `ADMIN` ou `USER`

---

### HF-11 — Ver perfil vinculado na tela de usuário

**Como** administrador,
**Quero** ver, na tela de detalhe de um usuário, qual perfil operacional está vinculado a ele,
**Para que** eu possa navegar facilmente entre o usuário e seu perfil.

**Critérios de aceite:**
- A tela de detalhe do usuário exibe uma seção "Perfil Operacional"
- Se o usuário tiver perfil vinculado: exibe nome, tipo (badge) e link para abrir o perfil em `/perfis/:id`
- Se não tiver perfil: exibe "Sem perfil vinculado" com link "Criar perfil para este usuário" → `/perfis/criar?user_fk=:id`

---

### HF-12 — Listagem de usuários sem papéis de REAPPLICATORS/COORDINATORS

**Como** administrador,
**Quero** que a listagem de usuários não exiba mais as colunas de perfil operacional,
**Para que** a tela de usuários fique focada em gestão de acesso, não de papéis de campo.

**O que muda:**
- Filtro de role remove as opções REAPPLICATORS e COORDINATORS
- Colunas `role` exibem apenas `ADMIN` ou `USER`
- Coluna nova opcional: "Perfil" (Vinculado / —) com link

---

## 5. Fluxo Completo — Relação entre Perfis e Usuários

```
ADMIN cria perfil SEM login:
  POST /profile → profile criado (user_fk: null)
  ↓
  Admin abre detalhe do perfil → clica "Vincular usuário"
  ↓
  Busca usuários sem perfil → seleciona → PUT /profile/:id { user_fk }
  ↓
  Usuário vinculado. No próximo login dele, JWT retorna profileId + profileType.

──────────────────────────────────────────────────────────────

ADMIN cria perfil COM login (fluxo direto):
  POST /user-bff → cria user + profile + profile_type_log + social_technology em transação
  ↓
  Redireciona para detalhe do perfil criado
  ↓
  Usuário pode fazer login imediatamente com profileType no JWT

──────────────────────────────────────────────────────────────

ADMIN altera tipo do perfil (coordenador → reaplicador):
  PUT /profile/:id { current_type: 'REAPPLICATOR', reason: '...' }
  ↓
  Backend gera profile_type_log automaticamente
  ↓
  Na tela de detalhe: histórico atualiza
  ↓
  Usuário vinculado SÓ terá o novo profileType no próximo login

──────────────────────────────────────────────────────────────

ADMIN remove vínculo (desvincular):
  PUT /profile/:id { user_fk: null }
  ↓
  profile.user_fk = null no banco
  ↓
  Na próxima sessão do usuário, o JWT não terá mais profileId/profileType
  ↓
  Usuário passa a operar apenas com role básico (USER)
```

---

## 6. Layout e Navegação

### 6.1 Rota de Listagem — `/perfis`

```
┌─────────────────────────────────────────────────────────┐
│  Perfis                              [+ Novo Perfil]     │
│  Gerenciamento de coordenadores e reaplicadores           │
├──────────────────────┬──────────────────────────────────┤
│  [Buscar por nome…]  │  [Tipo ▼] Todos/Coord/Reap        │
├──────┬───────────────┬──────┬──────────┬────────┬───────┤
│ Nome │ Tipo          │Email │Tec.Soc.  │ Status │ Ações │
├──────┴───────────────┴──────┴──────────┴────────┴───────┤
│ João Silva   [COORD.]  j@…  ST-1, ST-2  [Ativo]  👁✎🗑  │
│ Maria Santos [REAP.]   m@…  ST-1        [Ativo]  👁✎🗑  │
├─────────────────────────────────────────────────────────┤
│                     [◀ 1 2 3 ▶]                          │
└─────────────────────────────────────────────────────────┘
```

Ações visíveis apenas para ADMIN. Coordenador vê somente 👁 (detalhe).

---

### 6.2 Rota de Detalhe — `/perfis/:id`

```
┌───────────────────────────────────────────────────────────────┐
│  ← Voltar     João Silva              [Editar]  [Excluir]     │
├──────────────────────────┬────────────────────────────────────┤
│  DADOS PESSOAIS          │  CONTA DE LOGIN                    │
│  Tipo: [COORDENADOR]     │  Nome: João Silva                  │
│  E-mail: j@email.com     │  Usuário: joao.silva               │
│  Telefone: (11) 9 9999…  │  Status: [Ativo]                   │
│  Nascimento: 01/01/1990  │  [Ver usuário →]                   │
│  Início: 01/03/2024      │  [Desvincular]  ← somente admin    │
│  Sexo: Masculino         ├────────────────────────────────────┤
│  Cor/Raça: Parda         │  TECNOLOGIAS SOCIAIS               │
│  Status: [Ativo]         │  • Tecnologia A                    │
│                          │  • Tecnologia B                    │
└──────────────────────────┴────────────────────────────────────┘
│  HISTÓRICO DE TIPO                                             │
│  ─────────────────────────────────────────────────────────── │
│  01/06/2026 14:32 — admin.silva                               │
│  Reaplicador → Coordenador   |  Motivo: Promoção              │
│  ─────────────────────────────────────────────────────────── │
│  15/01/2026 09:00 — admin.silva                               │
│  — → Reaplicador             |  Atribuição inicial            │
└───────────────────────────────────────────────────────────────┘
```

Quando não há usuário vinculado, a seção "Conta de Login" exibe:
```
│  CONTA DE LOGIN                    │
│  Sem conta de login vinculada      │
│  [Vincular usuário]                │
```

---

### 6.3 Modal de Vínculo — "Vincular usuário"

```
┌─────────────────────────────────────┐
│  Vincular conta de login            │
│                                     │
│  Buscar usuário:                    │
│  [____________________________ ▼]   │
│  (mostra apenas usuários sem perfil)│
│                                     │
│       [Cancelar]  [Vincular]        │
└─────────────────────────────────────┘
```

---

### 6.4 Rota de Criação — `/perfis/criar`

**Seção 1 — Dados do Perfil** (sempre visível):

| Campo | Obrigatório | Componente |
|---|---|---|
| Nome | Sim | TextInput |
| Tipo | Sim | Dropdown (Coordenador / Reaplicador) |
| E-mail | Não | TextInput |
| Telefone | Não | MaskInput `(99) 9 9999-9999` |
| Data de Nascimento | Sim | MaskInput `99/99/9999` |
| Data de Início | Não | MaskInput `99/99/9999` |
| Sexo | Sim | Dropdown |
| Cor/Raça | Sim | Dropdown |
| Ativo | Não | Toggle (default: sim) |

**Seção 2 — Dados de Acesso** (toggle opcional "Criar conta de login"):

| Campo | Obrigatório se aberta |
|---|---|
| Nome de usuário | Sim |
| Senha | Sim (mín. 8 caracteres) |
| Confirmar senha | Sim |

---

### 6.5 Rota de Edição — `/perfis/:id/editar`

Mesmo formulário da criação, com campos pré-preenchidos.

Campo **motivo** aparece condicionalmente quando `current_type` é alterado:

```
Tipo atual: Coordenador → [Reaplicador ▼]
Motivo da alteração: [________________________] (opcional)
```

---

### 6.6 Tela de Usuários — mudanças visuais

**Formulário de criação/edição de usuário (simplificado):**
```
┌────────────────────────────────────────┐
│  Nome*         [__________________]    │
│  Username*     [__________________]    │
│  Senha*        [__________________]    │
│  Confirmar*    [__________________]    │
│  Papel         [ADMIN | USER ▼]        │
│  Ativo         [toggle]               │
└────────────────────────────────────────┘
```

**Tela de detalhe de usuário — seção de perfil:**
```
┌───────────────────────────────────────────┐
│  PERFIL OPERACIONAL                       │
│  Nome: João Silva                         │
│  Tipo: [COORDENADOR]                      │
│  [Ver perfil →]                           │
└───────────────────────────────────────────┘
```

---

## 7. Mensagens e Feedbacks

| Ação | Mensagem |
|---|---|
| Perfil criado | "Perfil criado com sucesso!" |
| Perfil atualizado | "Perfil atualizado com sucesso!" |
| Tipo alterado | "Tipo de perfil atualizado. O acesso do usuário vinculado será atualizado no próximo login." |
| Perfil excluído | "Perfil excluído. O usuário vinculado não foi excluído." |
| Confirmação de exclusão | "Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita." |
| Usuário vinculado | "Usuário vinculado com sucesso ao perfil." |
| Confirmação de desvincular | "Ao desvincular, o usuário perderá o acesso operacional. Deseja continuar?" |
| Usuário desvinculado | "Vínculo removido. O usuário não foi excluído." |
| Erro ao salvar | Exibe `error.response.data.message` |

---

## 8. Regras de Negócio Visíveis

| Regra | Comportamento |
|---|---|
| Tipo obrigatório | Não é possível salvar sem selecionar Coordenador ou Reaplicador |
| Um usuário → um perfil | No seletor de vínculo, exibir apenas usuários sem perfil |
| Perfil sem usuário é válido | Seção de login é opcional na criação |
| Exclusão não cascateia para usuário | Informar o usuário na confirmação |
| Tipo muda → acesso só muda no próximo login | Informar na mensagem de sucesso do tipo |
| Coordenador vê lista mas não edita | Botões de ação ocultos para coordenador |
| ADMIN sem perfil tem acesso total | role ADMIN independe de ter profileType |

---

## 9. Mapa de Permissões — Antes e Depois da Migração

> Esta seção mapeia **todas as funcionalidades existentes** que dependem de
> `role === COORDINATORS/REAPPLICATORS` e como cada uma muda após a migração.
> É a referência para validar que nenhum acesso foi perdido ou concedido errado.

### 9.1 Lógica que muda por tela/componente

| Tela / Componente | Funcionalidade controlada | Antes | Depois |
|---|---|---|---|
| **Menu lateral** | Exibir item "Reaplicadores" | `role === ADMIN ou COORDINATORS` | `role === ADMIN ou profileType === COORDINATOR` |
| **Menu lateral** | Exibir item "Usuários" | `role === ADMIN ou COORDINATORS` | `role === ADMIN ou profileType === COORDINATOR` |
| **Menu lateral** | Exibir item "Logs" | `role === ADMIN` | sem mudança |
| **CardClassroom** | Botão excluir turma | `role === ADMIN ou COORDINATORS` | `role === ADMIN ou profileType === COORDINATOR` |
| **CardMeeting** | Botão excluir reunião | `role === ADMIN ou COORDINATORS` | `role === ADMIN ou profileType === COORDINATOR` |
| **CardRegistration** | Clicar na matrícula / botão excluir | `role === ADMIN ou COORDINATORS` | `role === ADMIN ou profileType === COORDINATOR` |
| **Lista de Turmas** | Botão "+ Nova Turma" | `role === ADMIN ou COORDINATORS` | `role === ADMIN ou profileType === COORDINATOR` |
| **Detalhe de Turma** | Menu de ações (download, editar, transferir, reutilizar) | `role === ADMIN ou COORDINATORS` | `role === ADMIN ou profileType === COORDINATOR` |
| **Reunião — DataMeeting** | Editar status da reunião (Aprovado/Reprovado/Pendente) | `role === ADMIN ou COORDINATORS` | `role === ADMIN ou profileType === COORDINATOR` |
| **Reunião — DataMeeting** | Campo de justificativa visível | `role === REAPPLICATORS` | `profileType === REAPPLICATOR` |
| **Reunião — DataMeeting** | Bloquear upload quando reunião aprovada | `role === REAPPLICATORS` | `profileType === REAPPLICATOR` |
| **Lista de Projetos** | Botão "+ Novo Projeto" | `role === ADMIN ou COORDINATORS` | `role === ADMIN ou profileType === COORDINATOR` |
| **Detalhe de Projeto** | Botão editar projeto ⚠️ BUG ATUAL | `role === (ADMIN \|\| COORDINATORS)` — comparação errada | `role === ADMIN ou profileType === COORDINATOR` (corrigir bug) |
| **Detalhe de Projeto** | Botão excluir projeto ⚠️ BUG ATUAL | `role === (ADMIN \|\| COORDINATORS)` — comparação errada | `role === ADMIN ou profileType === COORDINATOR` (corrigir bug) |
| **Página Reaplicadores** | Acesso à página inteira | `role === ADMIN ou COORDINATORS` | será substituída por `/perfis` |
| **Detalhe Reaplicador** | Acesso à página inteira | `role === ADMIN ou COORDINATORS` | será substituída por `/perfis/:id` |
| **Criar/Editar Usuário** | Dropdown de role inclui COORDINATOR/REAPPLICATOR | `role === ADMIN` → mostra todos; senão, mostra só COORD/REAP | Remover COORDINATOR/REAPPLICATOR do dropdown; role só é ADMIN ou USER |

### 9.2 Lógica que NÃO muda (continua baseada em `role === ADMIN`)

| Tela / Componente | O que controla |
|---|---|
| Menu lateral | Exibir item "Logs" |
| Lista de Tecnologias Sociais | Botão "+ Nova Tecnologia" |
| Detalhe de Tecnologia Social | Botão criar tecnologia |
| Página Inicial | Botão download CSV |
| Troca de Senha | Botão salvar |
| Vários | Qualquer verificação `role === ADMIN` |

### 9.3 Regra de acesso consolidada pós-migração

```
ADMIN (role: ADMIN, sem profileType obrigatório)
  → Acesso total a todas as funcionalidades

COORDENADOR (role: USER, profileType: COORDINATOR)
  → Visualização + edição nas telas operacionais
  → Acesso à lista de perfis (somente leitura)
  → Acesso ao menu: Perfis, Usuários
  → Pode criar/editar turmas, reuniões, projetos
  → NÃO acessa: Logs, Tecnologias (criação)

REAPLICADOR (role: USER, profileType: REAPPLICATOR)
  → Acesso às turmas e reuniões que está vinculado
  → Campo de justificativa de reunião visível
  → Upload de arquivo de reunião (quando status não é APPROVED)
  → NÃO cria/edita turmas, reuniões, projetos
  → NÃO acessa: Logs, Usuários, Perfis (admin)

USUÁRIO SEM PERFIL (role: USER, sem profileType)
  → Acesso mínimo — sem funcionalidades operacionais
```

---

## 10. Mapa de Relacionamentos — Dados que Mudam por Tela

> Onde o frontend lê ou escreve estruturas de dados antigas que precisam ser trocadas.

### 10.1 Reunião — participantes

| Onde | O que faz hoje | O que muda |
|---|---|---|
| `DataMeeting/index.tsx:234` | Monta array `users[]` com `meeting_user[].users.id` para enviar ao backend | Montar array `profiles[]` com `meeting_profile[].profile.id` |
| `DataMeeting/index.tsx:257` | Lista de fallback: `meeting_user[].users` | `meeting_profile[].profile` |
| `Beneficiarios/index.tsx:224` | Nomes dos facilitadores no PDF: `meeting_user[].users.name` | `meeting_profile[].profile.name` |
| `Report/Pdf/index.tsx:140` | Itera `meeting_user[]` para coletar facilitadores únicos do relatório | Iterar `meeting_profile[]` acessando `entry.profile` |
| API `PUT /meeting-bff/update-members` | Envia `{ id, users: number[] }` | Enviar `{ id, profiles: number[] }` |
| Types: `Context/Classroom/Meeting/MeetingListRegistration/type.tsx:25` | `meeting_user: MeetingUser[]` com `users` aninhado | `meeting_profile: MeetingProfile[]` com `profile` aninhado |
| Types: `Services/Classroom/type.tsx:28` | `meeting_user: MeetingUser[]` | `meeting_profile: MeetingProfile[]` |
| Types: `Context/Classroom/Meeting/Create/type.tsx:5,18` | `users?: number[]` no DTO de criação/edição | `profiles?: number[]` |

### 10.2 Reaplicadores — página atual (substituída por /perfis)

| Onde | O que faz hoje | O que muda |
|---|---|---|
| `ReapplicatorsList/index.tsx:73` | Lê `users.user_social_technology[]` para exibir tecnologias | Lê `profile_social_technology[]` diretamente (profile já inclui) |
| `ReapplicatorsList/index.tsx:45` | Exibe `users.name` do reaplicador | `profile.user.name` (usuário vinculado) ou `profile.name` (nome do perfil) |
| `ReapplicatorView/index.tsx:82` | Navega para `/users/:users_fk` | Navegar para `/users/:user_fk` (campo renomeado) |
| `ReapplicatorView/index.tsx:88-99` | Lê `users.name`, `users.username`, `users.role`, `users.active` | Lê `user.name`, `user.username`, `user.role`, `user.active` (via `profile.user`) |
| Service `GET /reapplicators` | Chama endpoint específico de reaplicadores | Substituir por `GET /profile?current_type=REAPPLICATOR` |
| Context `Reapplicators/type.tsx:14` | `user_social_technology[]` com `usersocialtechnology` aninhado | `profile_social_technology[]` com `social_technology` aninhado |
| Context `Reapplicators/type.tsx:28` | `users_fk: number` | `user_fk: number` (campo renomeado no perfil) |

### 10.3 Edição de Usuário — dados do perfil operacional

| Onde | O que faz hoje | O que muda |
|---|---|---|
| `EditUser/index.tsx:97-101` | `user.reapplicators[0]` ou `user.coordinators[0]` para pré-preencher dados pessoais | `user.profile` (objeto único) |
| `EditUser/index.tsx:128` | `user.user_social_technology` para pré-preencher tecnologias | `user.profile.profile_social_technology` |
| `EditUser/index.tsx:105` | `role === REAPPLICATORS \|\| role === COORDINATORS` para saber se é perfil operacional | `user.profile !== undefined` ou `profileType !== undefined` |
| API `PUT /user-bff` | Envia `role: REAPPLICATORS\|COORDINATORS` + dados pessoais | Envia `current_type: COORDINATOR\|REAPPLICATOR` via `PUT /profile/:id` separado |

### 10.4 Login — leitura do projeto padrão

| Onde | O que faz hoje | O que muda |
|---|---|---|
| `Services/Login/controller.tsx:28-29` | Lê `userRegistered.user_social_technology[0].social_technology_fk` para definir projeto padrão | Ler `userRegistered.profile.profile_social_technology[0].social_technology_fk` |

### 10.5 Tipos TypeScript com estrutura antiga

| Arquivo | O que muda |
|---|---|
| `Context/Users/type.tsx` | Adicionar `profileId?: number`, `profileType?: 'COORDINATOR' \| 'REAPPLICATOR'`, `profile?: UserProfile` na interface `User`; remover `role: REAPPLICATORS\|COORDINATORS` |
| `Context/Reapplicators/type.tsx` | Substituir por `Profile` type (página será removida) |
| `Context/Classroom/Meeting/.../type.tsx` | `meeting_user` → `meeting_profile`; `users` → `profile` aninhado |
| `Services/Classroom/type.tsx` | `meeting_user` → `meeting_profile` |
| `Context/Classroom/Meeting/Create/type.tsx` | `users?: number[]` → `profiles?: number[]` |

---

## 11. Bug Existente a Corrigir Durante a Migração

**Arquivo:** `src/Pages/Projects/ProjectOne/index.tsx` — linhas 158-159 e 168-169

```typescript
// CÓDIGO ATUAL (BUGADO):
propsAplication.user?.role === (ROLE.ADMIN || ROLE.COORDINATORS)
// Isso avalia (ROLE.ADMIN || ROLE.COORDINATORS) = "ADMIN" (string truthy)
// e compara role === "ADMIN" — então coordenadores nunca veem os botões!

// CORREÇÃO NECESSÁRIA:
propsAplication.user?.role === ROLE.ADMIN || propsAplication.user?.profileType === PROFILE_TYPE.COORDINATOR
```

Este bug existe hoje: coordenadores não veem os botões de editar/excluir projetos.
A migração é o momento certo para corrigir.
