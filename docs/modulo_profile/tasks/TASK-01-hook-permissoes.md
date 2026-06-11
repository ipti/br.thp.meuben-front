# TASK-01 — Hook Centralizado de Permissões

**Depende de:** —  
**Esforço:** Baixo  
**Arquivos novos:** 2  
**Arquivos alterados:** 1  

---

## Contexto

Hoje as verificações de permissão estão espalhadas em 17 arquivos, cada uma com sua
própria expressão (`role === ROLE.COORDINATORS`, etc.). Isso torna a mudança cara e frágil.

Esta task cria **um único lugar** onde as regras de acesso são definidas.
Toda a aplicação passa a usar `can('nome.da.permissao')` em vez de comparações diretas.
Para mudar uma regra, basta editar o arquivo de configuração.

---

## Checklist

- [ ] Criar `src/permissions/config.ts`
- [ ] Criar `src/hooks/usePermissions.ts`
- [ ] Atualizar `src/Controller/controllerGlobal.tsx` (adicionar `PROFILE_TYPE`)

---

## 1. Criar `src/permissions/config.ts`

Este arquivo é a **fonte da verdade** de todas as regras de acesso.
Para alterar quem pode fazer o quê, edite apenas este arquivo.

```typescript
import { User } from '../Context/Users/type';

// Tipo de uma regra: recebe o usuário logado e retorna true/false
type PermissionRule = (user: User | undefined) => boolean;

// Helpers internos — não exportar
const isAdmin       = (u: User | undefined) => u?.role === 'ADMIN';
const isCoordinator = (u: User | undefined) => u?.profileType === 'COORDINATOR';
const isReapplicator= (u: User | undefined) => u?.profileType === 'REAPPLICATOR';
const adminOrCoord  = (u: User | undefined) => isAdmin(u) || isCoordinator(u);

// ─── CONFIGURAÇÃO DE PERMISSÕES ───────────────────────────────────────────────
// Para adicionar ou alterar uma regra: editar aqui e só aqui.
export const PermissionsConfig: Record<string, PermissionRule> = {

  // ── Perfis ────────────────────────────────────────────────────────────────
  'profile.view':          adminOrCoord,   // ver listagem e detalhe
  'profile.create':        isAdmin,        // criar perfil
  'profile.edit':          isAdmin,        // editar dados do perfil
  'profile.delete':        isAdmin,        // excluir perfil
  'profile.linkUser':      isAdmin,        // vincular/desvincular usuário

  // ── Usuários ──────────────────────────────────────────────────────────────
  'user.view':             adminOrCoord,
  'user.create':           isAdmin,
  'user.edit':             isAdmin,
  'user.delete':           isAdmin,
  'user.changePassword':   isAdmin,

  // ── Turmas ────────────────────────────────────────────────────────────────
  'classroom.create':      adminOrCoord,
  'classroom.edit':        adminOrCoord,
  'classroom.delete':      adminOrCoord,
  'classroom.actions':     adminOrCoord,   // menu de ações (download, transferir, reutilizar)

  // ── Reuniões ──────────────────────────────────────────────────────────────
  'meeting.delete':        adminOrCoord,
  'meeting.editStatus':    adminOrCoord,   // aprovar / reprovar / pendente
  'meeting.viewJustification': isReapplicator, // campo de justificativa
  'meeting.uploadFiles':   isReapplicator, // upload de arquivos (quando não aprovada)
  'meeting.editMembers':   adminOrCoord,

  // ── Projetos ──────────────────────────────────────────────────────────────
  'project.create':        adminOrCoord,
  'project.edit':          adminOrCoord,
  'project.delete':        adminOrCoord,

  // ── Matrículas ────────────────────────────────────────────────────────────
  'registration.view':     adminOrCoord,
  'registration.delete':   adminOrCoord,

  // ── Tecnologias Sociais ───────────────────────────────────────────────────
  'socialTechnology.create': isAdmin,
  'socialTechnology.edit':   isAdmin,

  // ── Logs ──────────────────────────────────────────────────────────────────
  'logs.view':             isAdmin,

  // ── Menu (visibilidade de itens) ──────────────────────────────────────────
  'menu.profiles':         adminOrCoord,
  'menu.users':            adminOrCoord,
  'menu.logs':             isAdmin,
};
```

---

## 2. Criar `src/hooks/usePermissions.ts`

```typescript
import { useContext } from 'react';
import { AplicationContext } from '../Context/Aplication/context';
import { PermissionsConfig } from '../permissions/config';
import { User } from '../Context/Users/type';

export type Permission = keyof typeof PermissionsConfig;

export interface UsePermissionsReturn {
  /** Verifica se o usuário tem uma permissão específica */
  can: (permission: Permission) => boolean;
  /** Verifica se tem QUALQUER uma das permissões da lista */
  canAny: (permissions: Permission[]) => boolean;
  /** Verifica se tem TODAS as permissões da lista */
  canAll: (permissions: Permission[]) => boolean;
  /** Atalhos de perfil */
  isAdmin: boolean;
  isCoordinator: boolean;
  isReapplicator: boolean;
  hasProfile: boolean;
  /** Usuário atual */
  user: User | undefined;
}

export const usePermissions = (): UsePermissionsReturn => {
  // Adaptar para o nome real do contexto de aplicação do projeto
  const context = useContext(AplicationContext);
  const user = context?.user;

  const can = (permission: Permission): boolean => {
    const rule = PermissionsConfig[permission];
    if (!rule) {
      console.warn(`[usePermissions] Permissão desconhecida: "${permission}"`);
      return false;
    }
    return rule(user);
  };

  const canAny = (permissions: Permission[]): boolean =>
    permissions.some((p) => can(p));

  const canAll = (permissions: Permission[]): boolean =>
    permissions.every((p) => can(p));

  return {
    can,
    canAny,
    canAll,
    isAdmin:        user?.role === 'ADMIN',
    isCoordinator:  user?.profileType === 'COORDINATOR',
    isReapplicator: user?.profileType === 'REAPPLICATOR',
    hasProfile:     !!user?.profileId,
    user,
  };
};
```

---

## 3. Atualizar `src/Controller/controllerGlobal.tsx`

Adicionar a constante `PROFILE_TYPE` logo após a definição de `ROLE`:

```typescript
// ANTES
export const ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
  REAPPLICATORS: "REAPPLICATORS",
  COORDINATORS: "COORDINATORS",
};

// DEPOIS — manter ROLE inalterado por ora (remoção de REAPPLICATORS/COORDINATORS
// só na TASK-11, para não quebrar código antigo antes de migrar)
export const ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
  REAPPLICATORS: "REAPPLICATORS",  // manter temporariamente
  COORDINATORS: "COORDINATORS",    // manter temporariamente
} as const;

// ADICIONAR — novo enum de tipo de perfil
export const PROFILE_TYPE = {
  COORDINATOR: "COORDINATOR",
  REAPPLICATOR: "REAPPLICATOR",
} as const;

export type ProfileType = typeof PROFILE_TYPE[keyof typeof PROFILE_TYPE];

export const profileTypeLabel: Record<string, string> = {
  COORDINATOR: "Coordenador",
  REAPPLICATOR: "Reaplicador",
};
```

---

## 4. Como usar nas tasks seguintes

Após esta task, **qualquer verificação de permissão** no projeto usa:

```typescript
import { usePermissions } from '../../../hooks/usePermissions';

// Dentro do componente:
const { can, isAdmin, isCoordinator } = usePermissions();

// Exibir/ocultar elemento:
{can('classroom.create') && <Button label="Nova Turma" />}

// Guard de página inteira:
if (!can('profile.view')) {
  return <ContentPage title="Acesso restrito"><p>Sem permissão.</p></ContentPage>;
}

// Múltiplas permissões:
{canAny(['project.edit', 'project.delete']) && <ActionMenu />}
```

---

## 5. Validação

- [ ] `can('profile.view')` retorna `true` para ADMIN e COORDINATOR, `false` para REAPPLICATOR
- [ ] `can('meeting.viewJustification')` retorna `true` para REAPPLICATOR, `false` para ADMIN e COORDINATOR
- [ ] `can('logs.view')` retorna `true` somente para ADMIN
- [ ] `can('permissao.inexistente')` loga warning no console e retorna `false`
- [ ] Alterar uma regra em `config.ts` afeta todos os componentes sem alterar nenhum outro arquivo
