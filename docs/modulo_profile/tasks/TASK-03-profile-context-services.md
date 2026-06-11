# TASK-03 — Módulo Profile: Context + Services

**Depende de:** TASK-02  
**Esforço:** Médio  
**Arquivos novos:** 6  

---

## Contexto

Criar toda a camada de dados do módulo Profile: tipos, contexto, queries e mutations.
Esta task cria a infraestrutura usada pelas páginas (TASK-04).

Seguir exatamente o padrão de 3 arquivos em Context e 3 em Services já usado em
`src/Context/Reapplicators/` e `src/Services/Users/`.

---

## Checklist

- [ ] Criar `src/Context/Profile/type.tsx`
- [ ] Criar `src/Context/Profile/state.tsx`
- [ ] Criar `src/Context/Profile/context.tsx`
- [ ] Criar `src/Services/Profile/request.tsx`
- [ ] Criar `src/Services/Profile/query.tsx`
- [ ] Criar `src/Services/Profile/controller.tsx`

---

## 1. `src/Context/Profile/type.tsx`

Ver código completo em `tecnico.md` — Seção 4.

Interfaces a criar:
- `ProfileSocialTechnology`
- `ProfileTypeLogEntry`
- `LinkedUser`
- `Profile`
- `ProfilesResponse`
- `CreateProfileDto`
- `CreateUserWithProfile`
- `ProfileFilters`
- `ProfileContextTypes`

---

## 2. `src/Context/Profile/state.tsx`

Ver código completo em `tecnico.md` — Seção 6 (`ProfileState`).

Estado gerenciado:
- `page`, `perPage` — paginação
- `nameSearch`, `currentTypeFilter` — filtros
- `selectedId` — para buscar um perfil específico
- `logProfileId` — para buscar o histórico de tipo

Queries ativas: `useFetchProfiles`, `useFetchProfileOne`, `useFetchProfileTypeLog`.

---

## 3. `src/Context/Profile/context.tsx`

Ver código completo em `tecnico.md` — Seção 6 (`ProfileProvider`, `useProfileContext`).

---

## 4. `src/Services/Profile/request.tsx`

Ver código completo em `tecnico.md` — Seção 5.

Funções a criar:

| Função | Endpoint | Método |
|---|---|---|
| `requestGetProfiles` | `/profile` | GET |
| `requestGetProfileOne` | `/profile/:id` | GET |
| `requestGetProfileTypeLog` | `/profile/:id/type-log` | GET |
| `requestCreateProfile` | `/profile` | POST |
| `requestCreateUserWithProfile` | `/user-bff` | POST |
| `requestUpdateProfile` | `/profile/:id` | PUT |
| `requestDeleteProfile` | `/profile/:id` | DELETE |
| `requestGetUsersWithoutProfile` | `/users` (filtrado client-side) | GET |

**Detalhe de `requestGetUsersWithoutProfile`:**

```typescript
// Chama GET /users e filtra quem não tem profile vinculado
export const requestGetUsersWithoutProfile = async () => {
  const response = await http.get('/users');
  // A resposta de GET /users retorna { data: User[], total, ... }
  // ou apenas User[] — verificar o shape real antes de implementar
  const list = response.data?.data ?? response.data ?? [];
  return list.filter((u: any) => !u.profile);
};
```

> **Verificar:** chamar `GET /users` e confirmar o shape da resposta
> (paginado com `{ data, total }` ou array direto).

---

## 5. `src/Services/Profile/query.tsx`

Ver código completo em `tecnico.md` — Seção 5.

Hooks a criar:
- `useFetchProfiles(params)` — com `keepPreviousData: true`
- `useFetchProfileOne(id)` — com `enabled: id > 0`
- `useFetchProfileTypeLog(id)` — com `enabled: id > 0`
- `useFetchUsersWithoutProfile()` — sem parâmetros

---

## 6. `src/Services/Profile/controller.tsx`

Ver código completo em `tecnico.md` — Seção 5.

Mutations a criar:

| Mutation | Endpoint | Ação após sucesso |
|---|---|---|
| `createProfileMutation` | POST /profile | Invalida queries + navega para `/perfis/:id` |
| `createUserWithProfileMutation` | POST /user-bff | Invalida queries + navega para `/perfis/:id` |
| `updateProfileMutation` | PUT /profile/:id | Invalida queries + navega para `/perfis/:id` |
| `linkUserMutation` | PUT /profile/:id `{user_fk}` | Invalida profile + usersWithoutProfile |
| `unlinkUserMutation` | PUT /profile/:id `{user_fk: null}` | Invalida profile + usersWithoutProfile |
| `deleteProfileMutation` | DELETE /profile/:id | Invalida lista + navega para `/perfis` |

Funções de confirmação (SweetAlert):
- `confirmDelete(id)` — abre modal antes de chamar deleteProfileMutation
- `confirmUnlink(profileId)` — abre modal antes de chamar unlinkUserMutation

**Nota sobre `user_fk: null` (desvincular):**
Antes de implementar `unlinkUserMutation`, confirmar com o backend que o
`PUT /profile/:id` aceita `{ user_fk: null }`. Se não aceitar, criar um
endpoint dedicado ou ajustar o DTO do backend.

---

## 7. Validação

- [ ] `useFetchProfiles({ page: 1, perPage: 10 })` retorna lista paginada
- [ ] `useFetchProfileOne(1)` retorna perfil com `user`, `profile_social_technology` e `profile_type_log`
- [ ] `useFetchProfileTypeLog(1)` retorna array de logs ordenado por data desc
- [ ] `useFetchUsersWithoutProfile()` retorna apenas usuários sem profile
- [ ] `createProfileMutation` cria perfil e invalida a query de listagem
- [ ] `updateProfileMutation` com `current_type` diferente exibe mensagem sobre próximo login
- [ ] `linkUserMutation` vincula usuário e invalida `useFetchUsersWithoutProfile`
- [ ] `unlinkUserMutation` desvincula usuário (confirmar comportamento no backend primeiro)
- [ ] `deleteProfileMutation` abre confirmação antes de excluir
