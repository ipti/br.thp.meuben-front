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

## 2. Público-Alvo da Tela

| Ator | O que pode fazer |
|---|---|
| **Administrador** (`role: ADMIN`) | Acesso total: criar, editar, excluir, visualizar histórico |
| **Coordenador** (`profileType: COORDINATOR`) | Somente visualização da lista — sem criar/editar/excluir |
| Outros | Sem acesso |

---

## 3. Histórias Funcionais

### HF-01 — Listar perfis

**Como** administrador ou coordenador,
**Quero** ver a lista de todos os perfis cadastrados,
**Para que** eu possa acompanhar quem está ativo no programa.

**Critérios de aceite:**
- A lista exibe: Nome, Tipo (Coordenador/Reaplicador), E-mail, Telefone, Data de Nascimento, Tecnologias Sociais, Status (Ativo/Inativo), e se tem usuário vinculado
- Paginação com 10 registros por página (padrão)
- Filtro por **nome** (campo de busca livre)
- Filtro por **tipo** (select: Todos / Coordenador / Reaplicador)
- Os filtros resetam a paginação para a página 1 ao serem alterados
- Coordenador vê a lista mas não vê os botões de criar/editar/excluir

---

### HF-02 — Visualizar detalhe do perfil

**Como** administrador,
**Quero** ver todos os dados de um perfil específico,
**Para que** eu possa verificar informações detalhadas e o histórico.

**Critérios de aceite:**
- Exibe todos os dados pessoais do perfil
- Exibe o **tipo atual** (Coordenador / Reaplicador) com badge colorido
- Exibe se há **usuário vinculado** (nome e username) com link para editar
- Exibe a lista de **tecnologias sociais** vinculadas ao perfil
- Exibe o **histórico de tipo** (linha do tempo de quando o tipo mudou)
- Botões de editar e excluir disponíveis para admin

---

### HF-03 — Criar perfil sem conta de login

**Como** administrador,
**Quero** cadastrar um perfil (coordenador ou reaplicador) sem precisar criar uma conta de login,
**Para que** a pessoa já exista no sistema antes de ter acesso à plataforma.

**Critérios de aceite:**
- Formulário com os campos: Nome, Tipo, E-mail, Telefone, Sexo, Cor/Raça, Data de Nascimento, Data de Início, Tecnologias Sociais, Status Ativo
- O campo "Tipo" é obrigatório: Coordenador ou Reaplicador
- O campo "Usuário vinculado" é **opcional**
- O perfil é criado com `active: true` por padrão
- Após salvar, redireciona para a tela de detalhe do perfil criado

---

### HF-04 — Criar perfil com conta de login

**Como** administrador,
**Quero** criar um perfil já vinculando uma conta de login,
**Para que** a pessoa possa acessar o sistema imediatamente após o cadastro.

**Critérios de aceite:**
- No formulário de criação existe uma seção "Dados de acesso" expansível/opcional
- Se preenchida, requer: nome de usuário (username), senha e confirmação de senha
- O sistema cria o usuário e o perfil em uma única operação (`POST /user-bff`)
- As senhas devem ter no mínimo 8 caracteres
- Após salvar, o usuário vinculado aparece no detalhe do perfil

---

### HF-05 — Editar perfil

**Como** administrador,
**Quero** editar os dados de um perfil existente,
**Para que** eu possa corrigir informações ou atualizar os dados da pessoa.

**Critérios de aceite:**
- Todos os campos do formulário de criação são editáveis
- A **alteração do tipo** (Coordenador ↔ Reaplicador) mostra um campo de **motivo** (opcional)
- Se o tipo mudar, o sistema registra automaticamente no histórico
- O campo de usuário vinculado permite: vincular um usuário existente, manter ou desvincular
- Após salvar, redireciona para o detalhe do perfil

---

### HF-06 — Vincular / desvincular conta de login

**Como** administrador,
**Quero** vincular ou desvincular uma conta de login de um perfil,
**Para que** eu possa controlar quem tem acesso ao sistema separadamente dos dados de campo.

**Critérios de aceite:**
- No detalhe do perfil existe a opção de vincular um usuário (se não tiver) ou desvincular (se tiver)
- Ao vincular, exibe um campo de busca de usuários existentes sem perfil vinculado
- Ao desvincular, o perfil continua existindo — apenas o `user_fk` é removido
- A ação de desvincular pede confirmação antes de executar

---

### HF-07 — Visualizar histórico de tipo

**Como** administrador,
**Quero** ver o histórico de mudanças de tipo de um perfil,
**Para que** eu possa rastrear quando e por que a função da pessoa foi alterada.

**Critérios de aceite:**
- O histórico é exibido na tela de detalhe do perfil
- Cada item exibe: tipo anterior → tipo novo, data/hora, usuário responsável, motivo
- O primeiro registro exibe "Tipo anterior: —" (atribuição inicial)
- Ordenado do mais recente para o mais antigo
- O histórico é somente leitura — sem opção de editar ou excluir

---

### HF-08 — Excluir perfil

**Como** administrador,
**Quero** excluir um perfil,
**Para que** eu possa remover registros indevidos ou obsoletos.

**Critérios de aceite:**
- O botão de excluir exibe uma confirmação antes de executar
- A exclusão não exclui o usuário vinculado — apenas remove o vínculo
- Após excluir, redireciona para a lista de perfis

---

## 4. Layout e Navegação

### 4.1 Rota de Listagem — `/perfis`

```
┌─────────────────────────────────────────────────────┐
│  Perfis                          [+ Novo Perfil]     │
│  Gerenciamento de coordenadores e reaplicadores       │
├──────────────────┬──────────────────────────────────┤
│  [Buscar nome…]  │  [Tipo ▼]  Todos/Coord/Reap       │
├─────┬────────────┬───────┬────────┬──────────┬──────┤
│ Nome│ Tipo       │ Email │ Telef. │ Tec.Soc. │ Ações│
├─────┴────────────┴───────┴────────┴──────────┴──────┤
│ [▶] João Silva   COORD.  j@…  (11)99… ST-1, ST-2 ✎🗑│
│ [▶] Maria Santos REAP.   m@…  (11)88… ST-1      ✎🗑│
│ ...                                                   │
├─────────────────────────────────────────────────────┤
│                  [◀ 1 2 3 ▶]                         │
└─────────────────────────────────────────────────────┘
```

**Colunas da DataTable:**
| Campo | Origem |
|---|---|
| Nome | `profile.name` |
| Tipo | `profile.current_type` → badge "Coordenador" / "Reaplicador" |
| E-mail | `profile.email` |
| Telefone | `profile.phone` |
| Tec. Sociais | `profile.profile_social_technology[].social_technology.name` |
| Status | `profile.active` → badge "Ativo" / "Inativo" |
| Usuário | `profile.user ? "Vinculado" : "—"` |
| Ações | Ver detalhe / Editar / Excluir (somente admin) |

---

### 4.2 Rota de Detalhe — `/perfis/:id`

```
┌─────────────────────────────────────────────────────┐
│  ← Voltar     João Silva                [Editar]     │
├──────────────────────┬──────────────────────────────┤
│  DADOS PESSOAIS      │  CONTA DE LOGIN               │
│  Tipo: [COORDENADOR] │  Usuário: joao.silva          │
│  E-mail: j@…         │  [Desvincular usuário]        │
│  Telefone: (11)99…   ├──────────────────────────────┤
│  Nascimento: 01/01/… │  TECNOLOGIAS SOCIAIS          │
│  Início: 01/03/…     │  ST-1, ST-2                   │
│  Sexo: Masculino     │                               │
│  Cor/Raça: Parda     │                               │
└──────────────────────┴──────────────────────────────┘
│  HISTÓRICO DE TIPO                                    │
│  ─────────────────────────────────────────────────── │
│  01/06/2026 14:32 — admin.silva                       │
│  Reaplicador → Coordenador  |  Motivo: Promoção       │
│  ─────────────────────────────────────────────────── │
│  15/01/2026 09:00 — admin.silva                       │
│  — → Reaplicador  |  Criação inicial                  │
└─────────────────────────────────────────────────────┘
```

---

### 4.3 Rota de Criação — `/perfis/criar`

Formulário em duas seções:

**Seção 1 — Dados do Perfil** (obrigatória):
- Nome* | Tipo* (Coordenador / Reaplicador)
- E-mail | Telefone
- Data de Nascimento* | Data de Início
- Sexo* | Cor/Raça*
- Tecnologias Sociais (multiselect)
- Ativo (toggle, default: sim)

**Seção 2 — Dados de Acesso** (opcional — toggle "Criar conta de login"):
- Nome de usuário* | Senha* | Confirmar senha*

---

### 4.4 Rota de Edição — `/perfis/:id/editar`

Mesmo formulário da criação, com campos pré-preenchidos.

Campo de **motivo da mudança de tipo** aparece condicionalmente quando `current_type` é alterado:
```
Tipo atual: Coordenador → [Reaplicador ▼]
Motivo da alteração: [                        ] (opcional)
```

---

## 5. Mensagens e Feedbacks

| Ação | Mensagem |
|---|---|
| Perfil criado | "Perfil criado com sucesso!" |
| Perfil atualizado | "Perfil atualizado com sucesso!" |
| Tipo alterado | "Tipo de perfil atualizado. O acesso do usuário vinculado será atualizado no próximo login." |
| Perfil excluído | "Perfil excluído. O usuário vinculado não foi excluído." |
| Confirmação de exclusão | "Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita." |
| Confirmação de desvincular usuário | "Ao desvincular, o usuário perderá o acesso operacional. Deseja continuar?" |
| Erro ao salvar | Exibe `error.response.data.message` |

---

## 6. Regras de Negócio Visíveis

| Regra | Comportamento |
|---|---|
| Tipo obrigatório | Não é possível salvar sem selecionar Coordenador ou Reaplicador |
| Um usuário → um perfil | No seletor de usuário ao vincular, exibir apenas usuários sem perfil vinculado |
| Perfil sem usuário é válido | Seção de conta de login é opcional na criação |
| Exclusão não cascateia para usuário | Informar o usuário sobre isso na confirmação |
| Acesso após mudança de tipo | Informar que o novo tipo só vale após novo login do usuário vinculado |
| Coordenador vê lista mas não edita | Botões de ação ocultos para coordenador |
