# TASK-07 — Relacionamentos de Reunião (meeting_user → meeting_profile)

**Depende de:** TASK-02 (tipos)  
**Esforço:** Alto  
**Arquivos alterados:** 6  

---

## Contexto

A tabela `meeting_user` (participantes de reunião) foi substituída por `meeting_profile`.
O participante deixou de ser um `user` e passou a ser um `profile`.

**Impacto:**
- A resposta da API de reunião retorna `meeting_profile[].profile` em vez de `meeting_user[].users`
- O endpoint `PUT /meeting-bff/update-members` agora recebe `profiles: number[]` em vez de `users: number[]`
- PDFs e relatórios que listavam participantes precisam ler da nova estrutura

---

## Checklist

- [ ] Atualizar tipos: `MeetingListRegistration/type.tsx` e `Services/Classroom/type.tsx`
- [ ] Atualizar DTO de criação/edição: `Classroom/Meeting/Create/type.tsx`
- [ ] Atualizar `DataMeeting/index.tsx` (envio + exibição de participantes)
- [ ] Atualizar `Meeting/Beneficiarios/index.tsx` (nome dos facilitadores no PDF)
- [ ] Atualizar `ClassroomOne/Report/Pdf/index.tsx` (facilitadores no relatório de turma)
- [ ] Atualizar `Services/Meeting/request.tsx` (parâmetro do update-members)

---

## 1. Tipos de reunião

### `src/Context/Classroom/Meeting/MeetingListRegistration/type.tsx` — linha 25

```typescript
// ANTES
meeting_user: MeetingUser[];

interface MeetingUser {
  users: {
    id: number;
    name: string;
    username: string;
    password: string;
    active: boolean;
    role: string;
  };
}

// DEPOIS
meeting_profile: MeetingProfile[];

interface MeetingProfile {
  profile: {
    id: number;
    name: string;
    current_type: 'COORDINATOR' | 'REAPPLICATOR';
  };
}
```

### `src/Services/Classroom/type.tsx` — linha 28

```typescript
// ANTES
meeting_user: MeetingUser[];
// (mesma estrutura MeetingUser acima)

// DEPOIS
meeting_profile: MeetingProfile[];
// (mesma estrutura MeetingProfile acima)
```

---

## 2. DTO de criação/edição de reunião

### `src/Context/Classroom/Meeting/Create/type.tsx`

```typescript
// ANTES
interface CreateMeeting {
  // ...
  users?: Array<number>;   // IDs de usuários participantes
}

interface EditMeetingUser {
  users: number[];
  id: number;
}

// DEPOIS
interface CreateMeeting {
  // ...
  profiles?: Array<number>;  // IDs de perfis participantes
}

interface EditMeetingMembers {
  profiles: number[];
  id: number;
}
```

---

## 3. `Services/Meeting/request.tsx` — função de update-members

Localizar a função que chama `PUT /meeting-bff/update-members`.

```typescript
// ANTES
export const requestUpdateMeetingMembers = (data: { id: number; users: number[] }) => {
  return http.put('/meeting-bff/update-members', data);
};

// DEPOIS
export const requestUpdateMeetingMembers = (data: { id: number; profiles: number[] }) => {
  return http.put('/meeting-bff/update-members', data);
};
```

---

## 4. `DataMeeting/index.tsx` — linha 234 e 257

### Linha 234 — montar lista de participantes para envio

```typescript
// ANTES
users: props.meeting?.meeting_user.map((item) => item.users.id) ?? []

// DEPOIS
profiles: props.meeting?.meeting_profile.map((item) => item.profile.id) ?? []
```

### Linha 257 — lista de responsáveis (fallback de exibição)

```typescript
// ANTES
const fallbackResponsibles = props.meeting?.meeting_user?.map((item) => item.users) ?? [];
// Acessado depois como: fallbackResponsibles.map(u => u.name)

// DEPOIS
const fallbackResponsibles = props.meeting?.meeting_profile?.map((item) => item.profile) ?? [];
// Acessado depois como: fallbackResponsibles.map(p => p.name)
```

> **Verificar:** se existe outro ponto no mesmo arquivo que acessa `item.users`
> e atualizar também.

---

## 5. `Meeting/Beneficiarios/index.tsx` — linha 224

```typescript
// ANTES
`Facilitador: ${props.meeting?.meeting_user
  .map((user) => user.users.name)
  .join(", ")
  .substring(0, 40)
  + ((props.meeting?.meeting_user.map((u) => u.users.name).join(", ").length ?? 0) > 39 ? '...' : '')
}`

// DEPOIS
`Facilitador: ${props.meeting?.meeting_profile
  .map((mp) => mp.profile.name)
  .join(", ")
  .substring(0, 40)
  + ((props.meeting?.meeting_profile.map((mp) => mp.profile.name).join(", ").length ?? 0) > 39 ? '...' : '')
}`
```

---

## 6. `ClassroomOne/Report/Pdf/index.tsx` — linhas 139–146

```typescript
// ANTES
report?.meeting?.forEach((meeting: any) => {
  meeting?.meeting_user?.forEach((entry: any) => {
    const user = entry.users;
    if (!uniqueUsersMap.has(user.id)) {
      uniqueUsersMap.set(user.id, user);
    }
  });
});
// Depois usa: Array.from(uniqueUsersMap.values()).map(u => u.name)

// DEPOIS
report?.meeting?.forEach((meeting: any) => {
  meeting?.meeting_profile?.forEach((entry: any) => {
    const profile = entry.profile;
    if (!uniqueProfilesMap.has(profile.id)) {
      uniqueProfilesMap.set(profile.id, profile);
    }
  });
});
// Depois usa: Array.from(uniqueProfilesMap.values()).map(p => p.name)
```

> **Verificar:** renomear `uniqueUsersMap` para `uniqueProfilesMap` e garantir que todos
> os pontos do arquivo que referenciam o mapa antigo sejam atualizados.

---

## 7. Validação

- [ ] Abrir uma reunião existente: lista de participantes carrega corretamente
- [ ] Editar participantes de uma reunião: seletor mostra perfis (não usuários)
- [ ] Salvar participantes: `PUT /meeting-bff/update-members` enviado com `profiles: []`
- [ ] PDF da reunião exibe nomes dos facilitadores corretamente (seção Beneficiarios)
- [ ] Relatório PDF da turma exibe facilitadores únicos corretamente
- [ ] Verificar no Network tab que o body do update-members é `{ id, profiles: [...] }` e não `{ id, users: [...] }`
