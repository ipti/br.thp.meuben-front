# TASK-06 — Substituição de Verificações de Permissão

**Depende de:** TASK-01 (hook), TASK-02 (tipos + context)  
**Esforço:** Médio  
**Arquivos alterados:** 11  

---

## Contexto

Substituir todas as 47 ocorrências de `role === ROLE.COORDINATORS/REAPPLICATORS`
pelo hook `usePermissions`. Cada componente passa a usar `can('permissao.especifica')`
em vez de comparações diretas.

**Regra:** nunca comparar `user?.role` ou `user?.profileType` diretamente em componentes.
Sempre usar `can(...)` do hook — assim a lógica de negócio fica só em `src/permissions/config.ts`.

---

## Checklist

- [ ] `src/Components/Menu/index.tsx` (feito na TASK-05, confirmar)
- [ ] `src/Components/Card/CardClassroom/index.tsx`
- [ ] `src/Components/Card/CardMeeting/index.tsx`
- [ ] `src/Components/Card/CardRegistration/index.tsx`
- [ ] `src/Pages/Classroom/ListClassroom/index.tsx`
- [ ] `src/Pages/Classroom/ClassroomOne/index.tsx`
- [ ] `src/Pages/Classroom/ClassroomOne/MeetingList/Meeting/DataMeeting/index.tsx`
- [ ] `src/Pages/Classroom/ClassroomOne/MeetingList/Meeting/index.tsx`
- [ ] `src/Pages/Projects/ProjectsList/index.tsx`
- [ ] `src/Pages/Projects/ProjectOne/index.tsx` ⚠️ inclui correção de bug
- [ ] `src/Pages/Users/ListUsers.tsx`
- [ ] `src/Pages/Users/EditUser/index.tsx`
- [ ] `src/Pages/Users/Inputs/index.tsx`

---

## Padrão de migração por arquivo

Para cada arquivo abaixo:
1. Adicionar o import do hook
2. Chamar o hook no topo do componente
3. Substituir as comparações de role pela chamada `can(...)`
4. Remover imports de `ROLE` que não sejam mais usados

```typescript
// Adicionar import em cada arquivo
import { usePermissions } from '../../../hooks/usePermissions';

// No topo do componente funcional
const { can } = usePermissions();
```

---

## Substituições por arquivo

### `src/Components/Card/CardClassroom/index.tsx` — linha 61

```typescript
// ANTES
(propsAplication.user?.role === ROLE.ADMIN || propsAplication.user?.role === ROLE.COORDINATORS) && (
  <button onClick={...}>excluir</button>
)

// DEPOIS
can('classroom.delete') && (
  <button onClick={...}>excluir</button>
)
```

---

### `src/Components/Card/CardMeeting/index.tsx` — linha 58

```typescript
// ANTES
propsAplication.user?.role === ROLE.ADMIN || propsAplication.user?.role === ROLE.COORDINATORS

// DEPOIS
can('meeting.delete')
```

---

### `src/Components/Card/CardRegistration/index.tsx` — linha 49

```typescript
// ANTES
const canEdit = propsAplication.user?.role === ROLE.ADMIN || propsAplication.user?.role === ROLE.COORDINATORS;

// DEPOIS
const canEdit = can('registration.view');
```

---

### `src/Pages/Classroom/ListClassroom/index.tsx` — linha 52

```typescript
// ANTES
(propsAplication.user?.role === ROLE.ADMIN || propsAplication.user?.role === ROLE.COORDINATORS) && (
  <Button label="+ Nova Turma" ... />
)

// DEPOIS
can('classroom.create') && (
  <Button label="+ Nova Turma" ... />
)
```

---

### `src/Pages/Classroom/ClassroomOne/index.tsx` — linha 270

```typescript
// ANTES
(propsAplication.user?.role === ROLE.ADMIN || propsAplication.user?.role === ROLE.COORDINATORS) && (
  <ActionMenu ... />
)

// DEPOIS
can('classroom.actions') && (
  <ActionMenu ... />
)
```

---

### `src/Pages/Classroom/ClassroomOne/MeetingList/Meeting/DataMeeting/index.tsx` — linha 167

```typescript
// ANTES
const canEditStatus = propsAplication.user?.role === ROLE.ADMIN || propsAplication.user?.role === ROLE.COORDINATORS;

// DEPOIS
const canEditStatus = can('meeting.editStatus');
```

---

### `src/Pages/Classroom/ClassroomOne/MeetingList/Meeting/index.tsx` — linhas 96 e 124

```typescript
// ANTES — linha 96
props.meeting.justification && propsAplication.user?.role === ROLE.REAPPLICATORS

// DEPOIS
props.meeting.justification && can('meeting.viewJustification')

// ──────────────────────────────────────────────────────────────
// ANTES — linha 124
!(props.meeting.status === Status.APPROVED && propsAplication.user?.role === ROLE.REAPPLICATORS)

// DEPOIS
!(props.meeting.status === Status.APPROVED && can('meeting.uploadFiles'))
```

---

### `src/Pages/Projects/ProjectsList/index.tsx` — linha 35

```typescript
// ANTES
(propsAplication.user?.role === ROLE.ADMIN || propsAplication.user?.role === ROLE.COORDINATORS) && (
  <Button label="+ Novo Projeto" ... />
)

// DEPOIS
can('project.create') && (
  <Button label="+ Novo Projeto" ... />
)
```

---

### `src/Pages/Projects/ProjectOne/index.tsx` — linhas 158 e 168 ⚠️ BUG

```typescript
// ANTES (bugado — comparação com booleano, nunca funciona para COORDINATOR)
propsAplication.user?.role === (ROLE.ADMIN || ROLE.COORDINATORS)

// DEPOIS (corrigido)
can('project.edit')   // linha 158
can('project.delete') // linha 168
```

> Este bug existe desde antes da migração: coordenadores nunca veem os botões
> de editar/excluir projetos. Corrigir aqui resolve o bug original **e** a migração.

---

### `src/Pages/Users/ListUsers.tsx` — linhas 46, 88, 96

```typescript
// Linha 46–52: exibição do role na tabela
// ANTES: exibia "Coordenador" / "Reaplicador" baseado em role
// DEPOIS: exibir baseado em profile.current_type (quando existir)

const roleDisplay = (row: User): string => {
  if (row.role === 'ADMIN') return 'Admin';
  if (row.profile?.current_type === 'COORDINATOR') return 'Coordenador';
  if (row.profile?.current_type === 'REAPPLICATOR') return 'Reaplicador';
  return 'Usuário';
};

// Linha 88-98: opções do dropdown de filtro de role
// ANTES: incluía COORDINATORS e REAPPLICATORS como filtros
// DEPOIS: manter somente ADMIN e USER como opções de role
// Filtro por tipo operacional não se aplica mais aqui (vai para /perfis)
const roleOptions = [
  { id: 'TODOS', name: 'Todos' },
  { id: 'ADMIN', name: 'Admin' },
  { id: 'USER', name: 'Usuário' },
];
```

---

### `src/Pages/Users/EditUser/index.tsx` — linhas 98 e 105

```typescript
// Linha 98–101: escolher qual perfil pré-preenche o form
// ANTES
const profile =
  project?.role === ROLE.REAPPLICATORS ? project?.reapplicators?.[0]
  : project?.role === ROLE.COORDINATORS ? project?.coordinators?.[0]
  : null;

// DEPOIS
const profile = project?.profile ?? null;

// ──────────────────────────────────────────────────────────────
// Linha 105: determinar se tem perfil operacional
// ANTES
const hasOperationalProfile = project?.role === ROLE.REAPPLICATORS || project?.role === ROLE.COORDINATORS;

// DEPOIS
const hasOperationalProfile = !!project?.profile;
```

---

### `src/Pages/Users/Inputs/index.tsx` — linhas 29–37 e 111

```typescript
// Remover ADMIN_ROLE_OPTIONS e COORDINATOR_ROLE_OPTIONS com COORDINATORS/REAPPLICATORS

// DEPOIS — apenas roles de sistema
const ROLE_OPTIONS_FOR_ADMIN = [
  { id: 'ADMIN', name: 'Administrador' },
  { id: 'USER',  name: 'Usuário' },
];

// Linha 111 — dropdown condicional
// ANTES
props.user?.role === ROLE.ADMIN ? ADMIN_ROLE_OPTIONS : COORDINATOR_ROLE_OPTIONS

// DEPOIS — todos usam as mesmas opções (só ADMIN e USER)
ROLE_OPTIONS_FOR_ADMIN
```

> **Nota:** coordenadores não criam mais usuários com tipo operacional —
> o tipo vai para o profile, não para o user.role.

---

## Validação

- [ ] Logar como COORDINATOR: deve ver menu Perfis, Usuários, botões de turma/reunião/projeto
- [ ] Logar como REAPPLICATOR: não vê menu Perfis/Usuários, não vê botões de criar/excluir
- [ ] Logar como REAPPLICATOR: vê campo de justificativa de reunião
- [ ] Logar como COORDINATOR: não vê campo de justificativa de reunião
- [ ] Logar como COORDINATOR: botões editar/excluir **projeto** aparecem (bug corrigido!)
- [ ] Logar como ADMIN: acesso total a tudo
- [ ] Dropdown de role na tela de usuários mostra somente Admin / Usuário
- [ ] Coluna role na lista de usuários exibe "Coordenador"/"Reaplicador" baseado em `profile.current_type`
