# TASK-09 — EditUser: Dados do Perfil

**Depende de:** TASK-02  
**Esforço:** Médio  
**Arquivos alterados:** 1–2  

---

## Contexto

Hoje, o `EditUser` lê os dados pessoais do usuário a partir de `user.reapplicators[0]`
ou `user.coordinators[0]` (arrays no objeto do usuário). Com a migração, existe apenas
`user.profile` (objeto único) com todos os dados pessoais.

Além disso, a edição de dados pessoais (birthday, phone, email, etc.) deve ser feita
via `PUT /profile/:id`, e não mais via `PUT /user-bff`.

---

## Checklist

- [ ] Atualizar `src/Pages/Users/EditUser/index.tsx`
  - Substituir `reapplicators[0]`/`coordinators[0]` por `profile`
  - Substituir `user_social_technology` por `profile.profile_social_technology`
  - Separar chamada de update: dados de auth → `PUT /user-bff`, dados pessoais → `PUT /profile/:id`
- [ ] Verificar `src/Pages/Users/EditUser/index.tsx:128` (`selectTs`)

---

## 1. Substituir acesso ao perfil operacional

**Linhas 97–101:**

```typescript
// ANTES — escolhe entre arrays separados baseado no role
const profile =
  project?.role === ROLE.REAPPLICATORS
    ? project?.reapplicators?.[0]
    : project?.role === ROLE.COORDINATORS
    ? project?.coordinators?.[0]
    : null;

// DEPOIS — objeto único
const profile = project?.profile ?? null;
```

---

## 2. Determinar se usuário tem perfil operacional

**Linha 105:**

```typescript
// ANTES
const hasOperationalProfile =
  project?.role === ROLE.REAPPLICATORS || project?.role === ROLE.COORDINATORS;

// DEPOIS
const hasOperationalProfile = !!project?.profile;
```

---

## 3. Substituir leitura de user_social_technology

**Linha 128:**

```typescript
// ANTES
selectTs(project.user_social_technology);

// DEPOIS
selectTs(project.profile?.profile_social_technology);
```

> **Verificar:** a função `selectTs` recebe qual formato?
> Se esperava `user_social_technology[].usersocialtechnology`, agora receberá
> `profile_social_technology[].social_technology` — confirmar que o mapeamento interno
> da função também é atualizado se necessário.

---

## 4. Separar atualização de dados

**Situação atual:** `PUT /user-bff` atualizava dados de auth + dados pessoais + tecnologias sociais.

**Nova separação:**
- Dados de auth (name, username, active, role) → `PUT /user-bff` (ou endpoint simplificado de usuário)
- Dados pessoais (birthday, phone, email, sex, color_race, initial_date) → `PUT /profile/:id`
- Tecnologias sociais → gerenciado pelo user-bff (ou remover desta tela e deixar para /perfis)

```typescript
// No submit do EditUser, determinar o que vai para cada endpoint:

const handleSubmit = async (values: any) => {
  // 1. Atualizar dados do usuário (sempre)
  await requestUpdateUser(values.id, {
    name:     values.name,
    username: values.username,
    active:   values.active,
    role:     values.role,
  });

  // 2. Se tem perfil, atualizar dados pessoais separadamente
  if (profile?.id) {
    await requestUpdateProfile(profile.id, {
      phone:       values.phone || undefined,
      email:       values.email || undefined,
      birthday:    values.birthday ? converterData(values.birthday) : undefined,
      initial_date: values.initial_date ? converterData(values.initial_date) : undefined,
      sex:         values.sex,
      color_race:  values.color_race,
    });
  }
};
```

> **Alternativa mais simples:** se o `PUT /user-bff` ainda aceitar os dados pessoais
> e os repassar para o profile, pode continuar usando um único endpoint.
> **Confirmar com o backend** qual é o comportamento atual do `PUT /user-bff` após a migração.

---

## 5. Campos a remover do formulário de edição

Quando o usuário **não tem perfil** (role: ADMIN ou USER sem profile):

```typescript
// Campos que só fazem sentido para perfis operacionais:
// birthday, phone, email, sex, color_race, initial_date
// NÃO exibir esses campos para usuários sem profile

{hasOperationalProfile && (
  <>
    <TextInput label="E-mail" name="email" ... />
    <MaskInput label="Telefone" name="phone" ... />
    <MaskInput label="Data de Nascimento" name="birthday" ... />
    {/* etc. */}
  </>
)}
```

> **Nota:** se a tela de edição de usuário no projeto atual já fazia isso
> condicionalmente baseado no role, a lógica permanece — só troca
> `isOperationalRole` por `hasOperationalProfile`.

---

## 6. Validação

- [ ] Editar usuário com COORDINATOR: campos pessoais aparecem pré-preenchidos corretamente
- [ ] Editar usuário com REAPPLICATOR: campos pessoais aparecem pré-preenchidos corretamente
- [ ] Editar usuário ADMIN: campos pessoais não aparecem
- [ ] Salvar alterações de dados pessoais: chama o endpoint correto (`PUT /profile/:id`)
- [ ] Salvar alterações de dados de auth: chama o endpoint correto (`PUT /user-bff`)
- [ ] Nenhum `TypeError` por acessar `reapplicators[0]` ou `coordinators[0]`
