# TASK-10 — CreateUser + ListUsers: Simplificação

**Depende de:** TASK-02  
**Esforço:** Médio  
**Arquivos alterados:** 3  

---

## Contexto

O formulário de criação de usuário hoje inclui dados pessoais e roles operacionais
(`REAPPLICATORS`/`COORDINATORS`). Com a migração:
- Criação de usuário passa a ser somente dados de autenticação
- Dados pessoais e tipo operacional ficam no profile (criado via `/profile` ou `/user-bff`)
- A listagem de usuários perde o filtro por role operacional e ganha coluna de perfil

---

## Checklist

- [ ] Simplificar `src/Pages/Users/CreateUser/index.tsx`
- [ ] Atualizar `src/Pages/Users/Inputs/index.tsx`
- [ ] Atualizar `src/Pages/Users/ListUsers.tsx`

---

## 1. `src/Pages/Users/CreateUser/index.tsx` — simplificar formulário

### Campos a REMOVER do formulário de criação:

- `birthday` (data de nascimento)
- `phone` (telefone)
- `email`
- `sex`
- `color_race`
- `initial_date`
- `project[]` (tecnologias sociais)
- role options `REAPPLICATORS` e `COORDINATORS`

### Campos que PERMANECEM:

- `name` (obrigatório)
- `username` (obrigatório)
- `password` (obrigatório)
- `confirmPassword` (obrigatório, validação local)
- `role`: dropdown somente `ADMIN | USER`
- `active` (toggle, default: true)

### Schema Yup simplificado:

```typescript
const createUserSchema = Yup.object({
  name:            Yup.string().min(3).required('Nome obrigatório'),
  username:        Yup.string().min(3).required('Nome de usuário obrigatório'),
  password:        Yup.string().min(8, 'Mínimo 8 caracteres').required('Senha obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'As senhas não coincidem')
    .required('Confirmação obrigatória'),
  role:            Yup.string().oneOf(['ADMIN', 'USER']).required('Papel obrigatório'),
});
```

### DTO enviado ao backend:

```typescript
// POST /users (ou PUT /user-bff simplificado)
{
  name:     values.name,
  username: values.username,
  password: values.password,
  role:     values.role,      // 'ADMIN' | 'USER'
  active:   values.active,
}
```

> **Nota:** para criar usuário já com perfil e tecnologias sociais,
> usar a tela `/perfis/criar` com o toggle "Criar conta de login".
> A tela de usuários passa a ser somente gestão de autenticação.

---

## 2. `src/Pages/Users/Inputs/index.tsx` — simplificar opções de role

### Remover opções de role operacional:

```typescript
// ANTES — dois arrays condicionais
const ADMIN_ROLE_OPTIONS = [
  { id: ROLE.ADMIN,        name: 'Admin' },
  { id: ROLE.USER,         name: 'Usuário' },
  { id: ROLE.COORDINATORS, name: 'Coordenador' },
  { id: ROLE.REAPPLICATORS, name: 'Reaplicador' },
];

const COORDINATOR_ROLE_OPTIONS = [
  { id: ROLE.COORDINATORS,  name: 'Coordenador' },
  { id: ROLE.REAPPLICATORS, name: 'Reaplicador' },
];

// DEPOIS — um único array simples
const ROLE_OPTIONS = [
  { id: 'ADMIN', name: 'Administrador' },
  { id: 'USER',  name: 'Usuário' },
];
```

### Simplificar o Dropdown de role:

```typescript
// ANTES — condicional baseado no role do usuário logado
{props.user?.role === ROLE.ADMIN ? ADMIN_ROLE_OPTIONS : COORDINATOR_ROLE_OPTIONS}

// DEPOIS — sempre o mesmo array
{ROLE_OPTIONS}
```

### Remover campos de dados pessoais do Inputs:

```typescript
// Se o componente Inputs é compartilhado entre CreateUser e EditUser,
// verificar se campos pessoais (birthday, phone, email, etc.) ainda estão aqui.
// Se sim: remover. Esses campos agora ficam somente no ProfileInputs (TASK-04).
```

---

## 3. `src/Pages/Users/ListUsers.tsx` — atualizar listagem

### 3.1 Remover filtro por role operacional

```typescript
// ANTES — filtro de role incluía COORDINATORS e REAPPLICATORS
const roleOptions = [
  { id: 'TODOS',        name: 'Todos' },
  { id: 'ADMIN',        name: 'Admin' },
  { id: 'COORDINATORS', name: 'Coordenador' },
  { id: 'REAPPLICATORS', name: 'Reaplicador' },
];

// DEPOIS — somente roles de sistema
const roleOptions = [
  { id: 'TODOS', name: 'Todos' },
  { id: 'ADMIN', name: 'Admin' },
  { id: 'USER',  name: 'Usuário' },
];
```

### 3.2 Atualizar exibição de role na tabela

```typescript
// ANTES
rowData.role === ROLE.ADMIN ? 'Admin'
: rowData.role === ROLE.COORDINATORS ? 'Coordenador'
: rowData.role === ROLE.REAPPLICATORS ? 'Reaplicador'
: 'Usuário'

// DEPOIS — role só é ADMIN ou USER; tipo operacional vem do profile
const getRoleDisplay = (row: User): string => {
  if (row.role === 'ADMIN') return 'Admin';
  return 'Usuário';
};

// Adicionar coluna separada para tipo operacional (do profile):
const getProfileTypeDisplay = (row: User): string => {
  if (!row.profile) return '—';
  return row.profile.current_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador';
};
```

### 3.3 Adicionar coluna "Perfil" na tabela

```typescript
// Após a coluna de role, adicionar coluna de perfil:
const profileBody = (row: User) =>
  row.profile ? (
    <Button
      label={row.profile.current_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador'}
      text
      size="small"
      severity={row.profile.current_type === 'COORDINATOR' ? 'info' : 'warning'}
      onClick={() => history(`/perfis/${row.profile!.id}`)}
    />
  ) : (
    <span style={{ color: '#aaa', fontSize: 12 }}>Sem perfil</span>
  );

// No DataTable:
<Column header="Perfil" body={profileBody} />
```

### 3.4 Adicionar seção de perfil no detalhe/edição do usuário

Na tela que exibe detalhes ou formulário de edição do usuário, adicionar:

```typescript
// Seção "Perfil Operacional"
{user?.profile ? (
  <div>
    <h4>Perfil Operacional</h4>
    <p>
      <strong>Nome:</strong> {user.profile.name}{'  '}
      <Tag
        value={user.profile.current_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador'}
        severity={user.profile.current_type === 'COORDINATOR' ? 'info' : 'warning'}
      />
    </p>
    <Button
      label="Ver perfil →"
      text
      onClick={() => history(`/perfis/${user.profile!.id}`)}
    />
  </div>
) : (
  <div>
    <h4>Perfil Operacional</h4>
    <p style={{ color: '#888' }}>Sem perfil vinculado</p>
    <Button
      label="Criar perfil para este usuário"
      text
      severity="secondary"
      onClick={() => history(`/perfis/criar?user_fk=${user.id}`)}
    />
  </div>
)}
```

---

## 4. Validação

- [ ] Formulário de criação de usuário exibe somente: Nome, Username, Senha, Confirmar senha, Papel, Ativo
- [ ] Dropdown de Papel exibe somente "Administrador" e "Usuário"
- [ ] Criar usuário com role USER → usuário criado sem erro
- [ ] Criar usuário com role ADMIN → usuário criado sem erro
- [ ] Lista de usuários exibe coluna "Perfil" com link para `/perfis/:id` quando vinculado
- [ ] Filtro de role na lista exibe somente Admin / Usuário
- [ ] Na tela de detalhe/edição do usuário, seção "Perfil Operacional" exibe dados corretos
- [ ] Link "Criar perfil para este usuário" redireciona para `/perfis/criar?user_fk=:id`
