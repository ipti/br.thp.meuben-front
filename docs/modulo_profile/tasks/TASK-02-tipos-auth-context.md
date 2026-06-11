# TASK-02 — Tipos, Constants e AplicationContext

**Depende de:** TASK-01  
**Esforço:** Médio  
**Arquivos alterados:** 3–4  

---

## Contexto

O JWT agora retorna `profileId` e `profileType`. O `AplicationContext` precisa expor esses
campos para que o hook `usePermissions` (TASK-01) funcione com dados reais.

Além disso, a interface `User` precisa incluir o campo `profile` retornado pelo
`GET /user-bff/one`, que é o endpoint que o contexto usa para hidratar o usuário logado.

---

## Checklist

- [ ] Atualizar `src/Context/Users/type.tsx` (interface `User` + `CreateUser`)
- [ ] Atualizar `src/Context/Aplication/state.tsx` (enriquecer user com `profileId`/`profileType`)
- [ ] Verificar e atualizar `src/Types/types.tsx` (tipo do contexto de aplicação)
- [ ] Verificar `src/Context/Login/state.tsx` (se usa campos do JWT diretamente)

---

## 1. Atualizar `src/Context/Users/type.tsx`

### Interface `User` (atualizar)

```typescript
// Perfil aninhado no objeto do usuário (retornado pelo GET /user-bff/one)
export interface UserProfileSummary {
  id: number;
  name: string;
  current_type: 'COORDINATOR' | 'REAPPLICATOR';
}

// ANTES
export interface User {
  id: number;
  name: string;
  username: string;
  active: boolean;
  role: string;
}

// DEPOIS
export interface User {
  id: number;
  name: string;
  username: string;
  active: boolean;
  role: 'ADMIN' | 'USER';
  // Campos novos — populados a partir do profile vinculado
  profileId?: number;
  profileType?: 'COORDINATOR' | 'REAPPLICATOR';
  profile?: UserProfileSummary;
}
```

### Interface `CreateUser` (simplificar)

```typescript
// ANTES — incluía dados pessoais e roles operacionais
export interface CreateUser {
  name: string;
  username: string;
  password?: string;
  project: number[];
  role?: string;
  email?: string;
  phone?: string;
  sex?: number;
  color_race?: number;
  initial_date?: string;
  birthday?: string;
}

// DEPOIS — somente dados de autenticação
// Dados pessoais + tipo operacional vão para Profile (src/Context/Profile/type.tsx)
export interface CreateUser {
  name: string;
  username: string;
  password?: string;
  role?: 'ADMIN' | 'USER';
  active?: boolean;
}
```

> **Atenção:** `CreateUserWithProfile` (criar usuário + perfil juntos via `/user-bff`)
> já está definido em `src/Context/Profile/type.tsx` — não duplicar aqui.

---

## 2. Atualizar `src/Context/Aplication/state.tsx`

O objetivo é garantir que o objeto `user` no contexto sempre tenha
`profileId` e `profileType` populados quando o usuário tiver perfil vinculado.

```typescript
// src/Context/Aplication/state.tsx

// Localizar onde o userRequest é aplicado ao state (aproximadamente linha 16-30)
// e enriquecer o objeto antes de setar:

// ANTES (aproximadamente)
if (userRequest) {
  setuser(userRequest);
}

// DEPOIS
if (userRequest) {
  const enrichedUser = {
    ...userRequest,
    // Extrair profileId e profileType do profile vinculado
    // O GET /user-bff/one retorna o user com profile aninhado
    profileId:   userRequest.profile?.id,
    profileType: userRequest.profile?.current_type,
  };
  setuser(enrichedUser);
}
```

> **Verificar antes de implementar:** chamar `GET /user-bff/one?userId=:id` manualmente
> (ou via Swagger) e confirmar que a resposta inclui o campo `profile` com `id` e `current_type`.
> Se não estiver vindo, verificar se o endpoint está retornando o include de profile.

---

## 3. Verificar `src/Types/types.tsx`

Localizar onde o tipo de `user` é definido no contexto de aplicação e garantir
que aceita os novos campos:

```typescript
// Verificar o tipo PropsAplicationContext (ou equivalente)
// O campo user deve usar a interface User atualizada

// Se estiver tipado como:
user: User | undefined

// Está correto — só precisa que User seja a interface atualizada acima.
```

---

## 4. Verificar `src/Context/Login/state.tsx`

Verificar se o login salva campos do JWT diretamente no localStorage/sessionStorage.
Se sim, esses campos precisam incluir `profileId` e `profileType`:

```typescript
// Confirmar que o payload decodificado do token é propagado corretamente.
// O backend já inclui profileId e profileType no JWT quando o usuário tem perfil.
// Verificar se o front extrai e usa esses campos ou se só usa o endpoint /user-bff/one.
```

> Se o app usa **somente** o endpoint para hidratar o user (padrão atual),
> a alteração no state.tsx (item 2 acima) é suficiente.
> Se o app lê o JWT diretamente, garantir que `profileId`/`profileType` sejam mapeados.

---

## 5. Validação

- [ ] Fazer login com um usuário que tem perfil COORDINATOR
  - `user.profileType` deve ser `'COORDINATOR'`
  - `user.profileId` deve ser um número
  - `can('profile.view')` (TASK-01) deve retornar `true`
- [ ] Fazer login com um usuário que tem perfil REAPPLICATOR
  - `user.profileType` deve ser `'REAPPLICATOR'`
  - `can('meeting.viewJustification')` deve retornar `true`
  - `can('profile.view')` deve retornar `false`
- [ ] Fazer login com ADMIN sem perfil
  - `user.profileType` deve ser `undefined`
  - `can('logs.view')` deve retornar `true`
- [ ] Fazer login com USER sem perfil
  - `user.profileType` deve ser `undefined`
  - `can('profile.view')` deve retornar `false`
