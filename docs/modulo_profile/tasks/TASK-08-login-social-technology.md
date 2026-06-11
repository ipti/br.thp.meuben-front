# TASK-08 — Login: Projeto Padrão via Profile

**Depende de:** TASK-02  
**Esforço:** Baixo  
**Arquivos alterados:** 1  

---

## Contexto

Ao fazer login, o sistema lê a primeira tecnologia social do usuário para definir
qual projeto será exibido por padrão. Hoje isso é feito lendo `user_social_technology`
diretamente do objeto do usuário retornado pelo login.

Com a migração, os vínculos de tecnologia social estão em `profile.profile_social_technology`.

---

## Checklist

- [ ] Atualizar `src/Services/Login/controller.tsx` — linhas 28–29

---

## 1. A mudança

**Arquivo:** `src/Services/Login/controller.tsx`

```typescript
// ANTES — linhas 28–29
if (data.data.userRegistered.user_social_technology[0]?.social_technology_fk) {
  idProject(data.data.userRegistered.user_social_technology[0]?.social_technology_fk);
}

// DEPOIS
const firstSocialTech =
  data.data.userRegistered.profile?.profile_social_technology?.[0]?.social_technology_fk;

if (firstSocialTech) {
  idProject(firstSocialTech);
}
```

---

## 2. O que verificar antes

**Passo 1:** Fazer login com um usuário que tem perfil com tecnologias sociais e inspecionar
`data.data.userRegistered` no console (ou no Network tab).

Confirmar que a resposta do `POST /auth/login` retorna:

```typescript
{
  userRegistered: {
    id: number,
    name: string,
    // ...
    profile: {
      id: number,
      current_type: 'COORDINATOR' | 'REAPPLICATOR',
      profile_social_technology: [
        { social_technology_fk: number, social_technology: { ... } },
        ...
      ]
    }
  },
  access_token: string,
  refresh_token: string
}
```

Se `profile_social_technology` não estiver vindo no login response, verificar com o backend
se o `auth.service.ts` inclui esse dado no `include` da query de login.

**Passo 2:** Se `profile` vier como `null` ou `undefined`, garantir que o fallback
`firstSocialTech` seja `undefined` — e não lançar erro de `Cannot read property of null`.
O código acima já usa optional chaining (`?.`) para isso.

---

## 3. Caso de borda: usuário sem perfil

Usuários ADMIN ou usuários sem perfil vinculado não têm `profile_social_technology`.
Nesses casos, `firstSocialTech` será `undefined` e `idProject` não será chamado.
Este é o comportamento correto — sem perfil, sem projeto padrão.

---

## 4. Validação

- [ ] Login com usuário que tem perfil com tecnologia social → projeto padrão é carregado corretamente
- [ ] Login com ADMIN sem perfil → não lança erro, projeto padrão não é definido (comportamento esperado)
- [ ] Login com usuário sem perfil (role: USER sem profile) → não lança erro
- [ ] Inspecionar Network: `POST /auth/login` retorna `profile.profile_social_technology`
