# Documentação Técnica — Módulo de Perfis
## `br.ipti.form` — Implementação

---

## 1. Visão Geral

Este documento descreve **como implementar** o módulo de perfis seguindo os padrões
arquiteturais já estabelecidos no projeto (mesmo padrão da tela de reaplicadores e usuários).

**Duas frentes de trabalho:**
1. **Tela de Perfis** — módulo novo (`/perfis`)
2. **Tela de Usuários** — adaptação do módulo existente (`/users`)

**Rotas novas:**
- `/perfis` — listagem
- `/perfis/criar` — formulário de criação
- `/perfis/:id` — detalhe
- `/perfis/:id/editar` — formulário de edição

**Dependência obrigatória antes de qualquer implementação:**
> Migração do `AplicationContext` — seção 2 abaixo.

---

## 2. Pré-requisito: Migração do Contexto de Autenticação

> **Fazer isso primeiro.** O JWT agora retorna `profileId` e `profileType`.
> Sem atualizar o contexto, nenhuma verificação de permissão funcionará.

### 2.1 Atualizar interface do usuário autenticado

**Arquivo:** `src/Context/Users/type.tsx` (ou onde estiver a interface `User`)

```typescript
// ANTES
export interface User {
  id: number;
  name: string;
  username: string;
  active: boolean;
  role: string; // 'ADMIN' | 'USER' | 'REAPPLICATORS' | 'COORDINATORS'
}

// DEPOIS
export interface User {
  id: number;
  name: string;
  username: string;
  active: boolean;
  role: 'ADMIN' | 'USER';
  profileId?: number;
  profileType?: 'COORDINATOR' | 'REAPPLICATOR';
}
```

### 2.2 Atualizar `AplicationContext` para expor os novos campos

O contexto precisa decodificar/expor `profileId` e `profileType` do JWT.
O comportamento depende de como o token é armazenado (localStorage/sessionStorage).

```typescript
// Onde o usuário é montado a partir do token (src/Context/Aplication/state.tsx ou similar):
// Garantir que profileId e profileType do payload JWT sejam mapeados para o objeto user.

// Se o user é buscado via API após login, verificar que a resposta
// do POST /auth/login retorna esses campos no payload do token
// e que o estado de contexto os inclui.
```

### 2.3 Atualizar constantes de ROLE

**Arquivo:** `src/Controller/controllerGlobal.tsx`

```typescript
// ANTES
export const ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
  REAPPLICATORS: "REAPPLICATORS",
  COORDINATORS: "COORDINATORS",
};

// DEPOIS — remover REAPPLICATORS e COORDINATORS (não existem mais no JWT)
export const ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

// Adicionar constante de tipo de perfil:
export const PROFILE_TYPE = {
  COORDINATOR: "COORDINATOR",
  REAPPLICATOR: "REAPPLICATOR",
} as const;

export type ProfileType = keyof typeof PROFILE_TYPE;

export const profileTypeLabel: Record<string, string> = {
  COORDINATOR: "Coordenador",
  REAPPLICATOR: "Reaplicador",
};
```

### 2.4 Migrar verificações de role no código existente

Buscar e substituir em todos os arquivos:

| Antes | Depois |
|---|---|
| `role === ROLE.COORDINATORS` | `profileType === 'COORDINATOR'` |
| `role === ROLE.REAPPLICATORS` | `profileType === 'REAPPLICATOR'` |
| `role === 'COORDINATORS'` | `profileType === 'COORDINATOR'` |
| `role === 'REAPPLICATORS'` | `profileType === 'REAPPLICATOR'` |

`profileType` é acessado via `propsAplication.user?.profileType`.

**Arquivos afetados (levantamento):**
- `src/Components/Menu/index.tsx` — guards de itens do menu
- `src/Components/Card/CardClassroom/index.tsx`
- `src/Components/Card/CardRegistration/index.tsx`
- `src/Components/Card/CardMeeting/index.tsx`
- `src/Pages/Reapplicators/ReapplicatorsList/index.tsx`
- `src/Pages/Reapplicators/ReapplicatorView/index.tsx`
- `src/Pages/Classroom/ClassroomOne/index.tsx`
- `src/Pages/Classroom/ClassroomOne/MeetingList/Meeting/index.tsx`
- `src/Pages/Projects/ProjectOne/index.tsx`
- `src/Pages/Projects/ProjectsList/index.tsx`
- `src/Pages/Users/ListUsers.tsx`
- `src/Controller/controllerGlobal.tsx`

---

## 3. Estrutura de Arquivos a Criar

```
src/
├── Context/
│   └── Profile/
│       ├── context.tsx          ← Provider do contexto
│       ├── state.tsx            ← Estado e React Query hooks
│       └── type.tsx             ← Interfaces TypeScript
│
├── Services/
│   └── Profile/
│       ├── request.tsx          ← Funções de chamada à API (axios)
│       ├── query.tsx            ← useFetch hooks (React Query)
│       └── controller.tsx       ← useMutation hooks + SweetAlert + navegação
│
└── Pages/
    └── Profiles/
        ├── ProfileList/
        │   └── index.tsx        ← Página de listagem
        ├── ProfileView/
        │   └── index.tsx        ← Página de detalhe
        ├── ProfileCreate/
        │   └── index.tsx        ← Formulário de criação
        ├── ProfileEdit/
        │   └── index.tsx        ← Formulário de edição
        └── Inputs/
            └── index.tsx        ← Campos compartilhados (create + edit)
```

---

## 4. Types — `src/Context/Profile/type.tsx`

```typescript
import { Dispatch, SetStateAction } from 'react';

export interface ProfileSocialTechnology {
  social_technology_fk: number;
  profile_fk: number;
  social_technology?: {
    id: number;
    name: string;
  };
}

export interface ProfileTypeLogEntry {
  id: number;
  profile_fk: number;
  previous_type: 'COORDINATOR' | 'REAPPLICATOR' | null; // null = criação inicial
  new_type: 'COORDINATOR' | 'REAPPLICATOR';
  reason?: string;
  changed_by_fk?: number;
  changed_by?: {
    id: number;
    name: string;
    username: string;
  };
  createdAt: string;
}

export interface LinkedUser {
  id: number;
  name: string;
  username: string;
  active: boolean;
  role: 'ADMIN' | 'USER';
}

export interface Profile {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  color_race: number;
  sex: number;
  birthday: string;
  initial_date?: string;
  active: boolean;
  current_type: 'COORDINATOR' | 'REAPPLICATOR';
  user_fk?: number;
  user?: LinkedUser;
  profile_social_technology: ProfileSocialTechnology[];
  profile_type_log?: ProfileTypeLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfilesResponse {
  data: Profile[];
  total: number;
  page: number;
  perPage: number;
}

export interface CreateProfileDto {
  name: string;
  current_type: 'COORDINATOR' | 'REAPPLICATOR';
  phone?: string;
  email?: string;
  color_race: number;
  sex: number;
  birthday: string;       // formato: YYYY-MM-DD
  initial_date?: string;  // formato: YYYY-MM-DD
  active?: boolean;
  user_fk?: number | null; // null para desvincular
  reason?: string;         // ao alterar current_type no edit
}

// Para criar perfil + usuário numa única chamada (POST /user-bff)
export interface CreateUserWithProfile {
  name: string;
  username: string;
  password: string;
  role?: 'USER';
  current_type: 'COORDINATOR' | 'REAPPLICATOR';
  project?: number[];     // IDs de social_technology
  email?: string;
  phone?: string;
  sex?: number;
  color_race?: number;
  initial_date?: string;  // formato DD/MM/YYYY
  birthday?: string;      // formato DD/MM/YYYY
}

export interface ProfileFilters {
  page: number;
  perPage: number;
  name?: string;
  current_type?: 'COORDINATOR' | 'REAPPLICATOR';
  active?: boolean;
}

export interface ProfileContextTypes {
  profiles?: ProfilesResponse;
  profile?: Profile;
  typeLog?: ProfileTypeLogEntry[];
  isLoading: boolean;
  isLoadingOne: boolean;
  isLoadingLog: boolean;
  page: number;
  perPage: number;
  nameSearch: string;
  currentTypeFilter?: 'COORDINATOR' | 'REAPPLICATOR';
  setPage: Dispatch<SetStateAction<number>>;
  setPerPage: Dispatch<SetStateAction<number>>;
  setNameSearch: Dispatch<SetStateAction<string>>;
  setCurrentTypeFilter: Dispatch<SetStateAction<'COORDINATOR' | 'REAPPLICATOR' | undefined>>;
  loadOne: (id: number) => void;
  loadTypeLog: (id: number) => void;
}
```

---

## 5. Services

### `src/Services/Profile/request.tsx`

```typescript
import http from '../axios';
import { CreateProfileDto, CreateUserWithProfile, ProfileFilters } from '../../Context/Profile/type';

export const requestGetProfiles = async (params: ProfileFilters) => {
  const query = new URLSearchParams();
  query.append('page', String(params.page));
  query.append('perPage', String(params.perPage));
  if (params.name?.trim()) query.append('name', params.name.trim());
  if (params.current_type) query.append('current_type', params.current_type);
  if (params.active !== undefined) query.append('active', String(params.active));
  const response = await http.get(`/profile?${query.toString()}`);
  return response.data;
};

export const requestGetProfileOne = async (id: number) => {
  const response = await http.get(`/profile/${id}`);
  return response.data;
};

export const requestGetProfileTypeLog = async (id: number) => {
  const response = await http.get(`/profile/${id}/type-log`);
  return response.data;
};

export const requestCreateProfile = async (data: CreateProfileDto) => {
  const response = await http.post('/profile', data);
  return response.data;
};

// Criar perfil + usuário juntos (usa user-bff)
export const requestCreateUserWithProfile = async (data: CreateUserWithProfile) => {
  const response = await http.post('/user-bff', data);
  return response.data;
};

export const requestUpdateProfile = async (id: number, data: Partial<CreateProfileDto>) => {
  const response = await http.put(`/profile/${id}`, data);
  return response.data;
};

export const requestDeleteProfile = async (id: number) => {
  const response = await http.delete(`/profile/${id}`);
  return response.data;
};

// Buscar usuários sem perfil vinculado (para o modal de vincular)
// Filtra client-side: GET /users retorna user com profile (null se não vinculado)
export const requestGetUsersWithoutProfile = async () => {
  const response = await http.get('/users');
  return (response.data?.data ?? response.data ?? []).filter(
    (u: any) => !u.profile
  );
};
```

### `src/Services/Profile/query.tsx`

```typescript
import { useQuery } from 'react-query';
import {
  requestGetProfiles,
  requestGetProfileOne,
  requestGetProfileTypeLog,
  requestGetUsersWithoutProfile,
} from './request';
import { ProfileFilters } from '../../Context/Profile/type';

export const useFetchProfiles = (params: ProfileFilters) =>
  useQuery(['useRequestsProfiles', params], () => requestGetProfiles(params), {
    keepPreviousData: true,
  });

export const useFetchProfileOne = (id: number) =>
  useQuery(['useRequestsProfileOne', id], () => requestGetProfileOne(id), {
    enabled: id > 0,
  });

export const useFetchProfileTypeLog = (id: number) =>
  useQuery(['useRequestsProfileTypeLog', id], () => requestGetProfileTypeLog(id), {
    enabled: id > 0,
  });

export const useFetchUsersWithoutProfile = () =>
  useQuery(['useRequestsUsersWithoutProfile'], requestGetUsersWithoutProfile);
```

### `src/Services/Profile/controller.tsx`

```typescript
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from '../../Styles';
import {
  requestCreateProfile,
  requestCreateUserWithProfile,
  requestUpdateProfile,
  requestDeleteProfile,
} from './request';
import { CreateProfileDto, CreateUserWithProfile } from '../../Context/Profile/type';

export const ControllerProfile = () => {
  const history = useNavigate();
  const queryClient = useQueryClient();

  const invalidate = (profileId?: number) => {
    queryClient.refetchQueries('useRequestsProfiles');
    if (profileId) {
      queryClient.refetchQueries(['useRequestsProfileOne', profileId]);
      queryClient.refetchQueries(['useRequestsProfileTypeLog', profileId]);
    }
    queryClient.refetchQueries('useRequestsUsersWithoutProfile');
  };

  const createProfileMutation = useMutation(
    (data: CreateProfileDto) => requestCreateProfile(data),
    {
      onError: (error: any) =>
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao criar perfil',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }),
      onSuccess: (data) =>
        Swal.fire({
          icon: 'success',
          title: 'Perfil criado com sucesso!',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => {
          invalidate();
          history('/perfis/' + data.id);
        }),
    }
  );

  const createUserWithProfileMutation = useMutation(
    (data: CreateUserWithProfile) => requestCreateUserWithProfile(data),
    {
      onError: (error: any) =>
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao criar perfil com login',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }),
      onSuccess: (data) =>
        Swal.fire({
          icon: 'success',
          title: 'Perfil e conta criados com sucesso!',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => {
          invalidate();
          // data.profile.id ou data.id dependendo do que /user-bff retorna
          history('/perfis/' + (data.profile?.id ?? data.id));
        }),
    }
  );

  const updateProfileMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<CreateProfileDto> }) =>
      requestUpdateProfile(id, data),
    {
      onError: (error: any) =>
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao atualizar perfil',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }),
      onSuccess: (data) => {
        const msg =
          data.current_type !== undefined
            ? 'Tipo de perfil atualizado. O acesso será atualizado no próximo login do usuário.'
            : 'Perfil atualizado com sucesso!';
        Swal.fire({
          icon: 'success',
          title: msg,
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => {
          invalidate(data.id);
          history('/perfis/' + data.id);
        });
      },
    }
  );

  const linkUserMutation = useMutation(
    ({ profileId, userId }: { profileId: number; userId: number }) =>
      requestUpdateProfile(profileId, { user_fk: userId }),
    {
      onError: (error: any) =>
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao vincular usuário',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }),
      onSuccess: (_, vars) =>
        Swal.fire({
          icon: 'success',
          title: 'Usuário vinculado com sucesso ao perfil.',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => invalidate(vars.profileId)),
    }
  );

  const unlinkUserMutation = useMutation(
    (profileId: number) => requestUpdateProfile(profileId, { user_fk: null }),
    {
      onError: (error: any) =>
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao desvincular usuário',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }),
      onSuccess: (_, profileId) =>
        Swal.fire({
          icon: 'success',
          title: 'Vínculo removido. O usuário não foi excluído.',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => invalidate(profileId)),
    }
  );

  const deleteProfileMutation = useMutation(
    (id: number) => requestDeleteProfile(id),
    {
      onError: (error: any) =>
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao excluir perfil',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }),
      onSuccess: () =>
        Swal.fire({
          icon: 'success',
          title: 'Perfil excluído. O usuário vinculado não foi excluído.',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then(() => {
          invalidate();
          history('/perfis');
        }),
    }
  );

  const confirmDelete = (id: number) =>
    Swal.fire({
      icon: 'warning',
      title: 'Excluir perfil?',
      text: 'Tem certeza? Esta ação não pode ser desfeita.',
      showCancelButton: true,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: styles.colors.colorsBaseProductNormal,
    }).then((result) => {
      if (result.isConfirmed) deleteProfileMutation.mutate(id);
    });

  const confirmUnlink = (profileId: number) =>
    Swal.fire({
      icon: 'warning',
      title: 'Desvincular usuário?',
      text: 'Ao desvincular, o usuário perderá o acesso operacional. Deseja continuar?',
      showCancelButton: true,
      confirmButtonText: 'Desvincular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: styles.colors.colorsBaseProductNormal,
    }).then((result) => {
      if (result.isConfirmed) unlinkUserMutation.mutate(profileId);
    });

  return {
    createProfileMutation,
    createUserWithProfileMutation,
    updateProfileMutation,
    linkUserMutation,
    unlinkUserMutation,
    deleteProfileMutation,
    confirmDelete,
    confirmUnlink,
  };
};
```

---

## 6. Context

### `src/Context/Profile/state.tsx`

```typescript
import { useState, useEffect } from 'react';
import {
  useFetchProfiles,
  useFetchProfileOne,
  useFetchProfileTypeLog,
} from '../../Services/Profile/query';

export const ProfileState = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [nameSearch, setNameSearch] = useState('');
  const [currentTypeFilter, setCurrentTypeFilter] = useState<'COORDINATOR' | 'REAPPLICATOR' | undefined>();
  const [selectedId, setSelectedId] = useState(0);
  const [logProfileId, setLogProfileId] = useState(0);

  // Reseta para pág 1 ao filtrar
  useEffect(() => { setPage(1); }, [nameSearch, currentTypeFilter]);

  const { data: profiles, isLoading } = useFetchProfiles({
    page,
    perPage,
    name: nameSearch || undefined,
    current_type: currentTypeFilter,
  });

  const { data: profile, isLoading: isLoadingOne } = useFetchProfileOne(selectedId);
  const { data: typeLog, isLoading: isLoadingLog } = useFetchProfileTypeLog(logProfileId);

  const loadOne = (id: number) => setSelectedId(id);
  const loadTypeLog = (id: number) => setLogProfileId(id);

  return {
    profiles, profile, typeLog,
    isLoading, isLoadingOne, isLoadingLog,
    page, perPage, nameSearch, currentTypeFilter,
    setPage, setPerPage, setNameSearch, setCurrentTypeFilter,
    loadOne, loadTypeLog,
  };
};
```

### `src/Context/Profile/context.tsx`

```typescript
import { createContext, useContext } from 'react';
import { ProfileState } from './state';
import { ProfileContextTypes } from './type';

export const ProfileContext = createContext<ProfileContextTypes | null>(null);

const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const state = ProfileState();
  return (
    <ProfileContext.Provider value={state}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfileContext fora do ProfileProvider');
  return ctx;
};

export default ProfileProvider;
```

---

## 7. Páginas

### 7.1 Listagem — `src/Pages/Profiles/ProfileList/index.tsx`

```typescript
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import ProfileProvider, { ProfileContext } from '../../../Context/Profile/context';
import { ProfileContextTypes, Profile } from '../../../Context/Profile/type';
import { ControllerProfile } from '../../../Services/Profile/controller';
import { AplicationContext } from '../../../Context/Aplication/context';
import ContentPage from '../../../Components/ContentPage';
import Loading from '../../../Components/Loading';
import TextInput from '../../../Components/Form/TextInput';
import DropdownComponent from '../../../Components/Form/Dropdown';
import { ROLE, PROFILE_TYPE } from '../../../Controller/controllerGlobal';

const ProfileList = () => (
  <ProfileProvider>
    <ProfileListPage />
  </ProfileProvider>
);

const ProfileListPage = () => {
  const props = useContext(ProfileContext) as ProfileContextTypes;
  const propsAplication = useContext(AplicationContext);
  const history = useNavigate();
  const { confirmDelete } = ControllerProfile();

  const isAdmin = propsAplication.user?.role === ROLE.ADMIN;
  const isCoordinator = propsAplication.user?.profileType === PROFILE_TYPE.COORDINATOR;

  // Acesso: somente admin e coordenador
  if (!isAdmin && !isCoordinator) {
    return (
      <ContentPage title="Perfis" description="Acesso restrito.">
        <p>Você não tem permissão para acessar esta página.</p>
      </ContentPage>
    );
  }

  const typeOptions = [
    { id: undefined, name: 'Todos' },
    { id: 'COORDINATOR', name: 'Coordenador' },
    { id: 'REAPPLICATOR', name: 'Reaplicador' },
  ];

  const typeBody = (row: Profile) => (
    <Tag
      value={row.current_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador'}
      severity={row.current_type === 'COORDINATOR' ? 'info' : 'warning'}
    />
  );

  const activeBody = (row: Profile) => (
    <Tag value={row.active ? 'Ativo' : 'Inativo'} severity={row.active ? 'success' : 'danger'} />
  );

  const userBody = (row: Profile) => (
    <Tag
      value={row.user ? 'Vinculado' : '—'}
      severity={row.user ? 'success' : undefined}
    />
  );

  const socialTechBody = (row: Profile) => (
    <span>
      {row.profile_social_technology
        ?.map((s) => s.social_technology?.name ?? `ST-${s.social_technology_fk}`)
        .join(', ') || '—'}
    </span>
  );

  const actionsBody = (row: Profile) => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button icon="pi pi-eye" rounded text onClick={() => history(`/perfis/${row.id}`)} />
      {isAdmin && (
        <>
          <Button
            icon="pi pi-pencil"
            rounded text severity="info"
            onClick={() => history(`/perfis/${row.id}/editar`)}
          />
          <Button
            icon="pi pi-trash"
            rounded text severity="danger"
            onClick={() => confirmDelete(row.id)}
          />
        </>
      )}
    </div>
  );

  return (
    <ContentPage title="Perfis" description="Gerenciamento de coordenadores e reaplicadores">
      <div className="grid mb-3">
        <div className="col-12 md:col-6">
          <TextInput
            placeholder="Buscar por nome…"
            value={props.nameSearch}
            onChange={(e) => props.setNameSearch(e.target.value)}
          />
        </div>
        <div className="col-12 md:col-4">
          <DropdownComponent
            options={typeOptions}
            value={typeOptions.find((o) => o.id === props.currentTypeFilter)}
            optionLabel="name"
            onChange={(e) => props.setCurrentTypeFilter(e.value?.id)}
            placeholder="Tipo"
          />
        </div>
        {isAdmin && (
          <div className="col-12 md:col-2">
            <Button
              label="Novo Perfil"
              icon="pi pi-plus"
              onClick={() => history('/perfis/criar')}
            />
          </div>
        )}
      </div>

      {props.isLoading ? (
        <Loading />
      ) : (
        <>
          <DataTable value={props.profiles?.data ?? []} emptyMessage="Nenhum perfil encontrado">
            <Column field="name" header="Nome" />
            <Column header="Tipo" body={typeBody} />
            <Column field="email" header="E-mail" />
            <Column field="phone" header="Telefone" />
            <Column header="Tec. Sociais" body={socialTechBody} />
            <Column header="Usuário" body={userBody} />
            <Column header="Status" body={activeBody} />
            <Column header="Ações" body={actionsBody} />
          </DataTable>
          <Paginator
            first={(props.page - 1) * props.perPage}
            rows={props.perPage}
            totalRecords={props.profiles?.total ?? 0}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={(e) => {
              props.setPage(e.page + 1);
              props.setPerPage(e.rows);
            }}
          />
        </>
      )}
    </ContentPage>
  );
};

export default ProfileList;
```

---

### 7.2 Detalhe — `src/Pages/Profiles/ProfileView/index.tsx`

```typescript
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import ProfileProvider, { ProfileContext } from '../../../Context/Profile/context';
import { ProfileContextTypes, ProfileTypeLogEntry } from '../../../Context/Profile/type';
import { AplicationContext } from '../../../Context/Aplication/context';
import { ControllerProfile } from '../../../Services/Profile/controller';
import { useFetchUsersWithoutProfile } from '../../../Services/Profile/query';
import ContentPage from '../../../Components/ContentPage';
import Loading from '../../../Components/Loading';
import { formatarData, VerifySex, VerifyColor, ROLE, PROFILE_TYPE } from '../../../Controller/controllerGlobal';

const ProfileView = () => (
  <ProfileProvider>
    <ProfileViewPage />
  </ProfileProvider>
);

const ProfileViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const props = useContext(ProfileContext) as ProfileContextTypes;
  const propsAplication = useContext(AplicationContext);
  const history = useNavigate();
  const { confirmDelete, confirmUnlink, linkUserMutation } = ControllerProfile();
  const { data: usersWithoutProfile } = useFetchUsersWithoutProfile();

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();

  const isAdmin = propsAplication.user?.role === ROLE.ADMIN;

  useEffect(() => {
    if (id) {
      props.loadOne(parseInt(id));
      props.loadTypeLog(parseInt(id));
    }
  }, [id]);

  if (props.isLoadingOne) return <Loading />;
  if (!props.profile) return null;

  const p = props.profile;

  const handleLink = () => {
    if (!selectedUserId) return;
    linkUserMutation.mutate({ profileId: p.id, userId: selectedUserId });
    setShowLinkModal(false);
    setSelectedUserId(undefined);
  };

  return (
    <ContentPage title={p.name} description="Detalhe do perfil">

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button label="← Voltar" text onClick={() => history('/perfis')} />
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button label="Editar" icon="pi pi-pencil" onClick={() => history(`/perfis/${id}/editar`)} />
            <Button label="Excluir" icon="pi pi-trash" severity="danger" outlined onClick={() => confirmDelete(p.id)} />
          </div>
        )}
      </div>

      <div className="grid">

        {/* Dados pessoais */}
        <div className="col-12 md:col-6">
          <h4>Dados Pessoais</h4>
          <p><strong>Tipo:</strong> <Tag
            value={p.current_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador'}
            severity={p.current_type === 'COORDINATOR' ? 'info' : 'warning'}
          /></p>
          <p><strong>E-mail:</strong> {p.email ?? '—'}</p>
          <p><strong>Telefone:</strong> {p.phone ?? '—'}</p>
          <p><strong>Nascimento:</strong> {formatarData(p.birthday)}</p>
          <p><strong>Data de início:</strong> {p.initial_date ? formatarData(p.initial_date) : '—'}</p>
          <p><strong>Sexo:</strong> {VerifySex(p.sex)?.type ?? '—'}</p>
          <p><strong>Cor/Raça:</strong> {VerifyColor(p.color_race)?.name ?? '—'}</p>
          <p><strong>Status:</strong> <Tag value={p.active ? 'Ativo' : 'Inativo'} severity={p.active ? 'success' : 'danger'} /></p>
        </div>

        {/* Conta de login + tecnologias */}
        <div className="col-12 md:col-6">
          <h4>Conta de Login</h4>
          {p.user ? (
            <>
              <p><strong>Nome:</strong> {p.user.name}</p>
              <p><strong>Usuário:</strong> {p.user.username}</p>
              <p><strong>Status:</strong> <Tag value={p.user.active ? 'Ativo' : 'Inativo'} severity={p.user.active ? 'success' : 'danger'} /></p>
              <Button label="Ver usuário →" text onClick={() => history(`/users/${p.user_fk}`)} />
              {isAdmin && (
                <Button
                  label="Desvincular"
                  icon="pi pi-times"
                  severity="danger"
                  text
                  onClick={() => confirmUnlink(p.id)}
                  style={{ marginLeft: 8 }}
                />
              )}
            </>
          ) : (
            <>
              <p style={{ color: '#888' }}>Sem conta de login vinculada</p>
              {isAdmin && !showLinkModal && (
                <Button label="Vincular usuário" icon="pi pi-link" onClick={() => setShowLinkModal(true)} />
              )}
              {isAdmin && showLinkModal && (
                <div style={{ marginTop: 8 }}>
                  <Dropdown
                    value={selectedUserId}
                    options={usersWithoutProfile ?? []}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Selecionar usuário…"
                    onChange={(e) => setSelectedUserId(e.value)}
                    filter
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button label="Cancelar" outlined onClick={() => { setShowLinkModal(false); setSelectedUserId(undefined); }} />
                    <Button label="Vincular" disabled={!selectedUserId} loading={linkUserMutation.isLoading} onClick={handleLink} />
                  </div>
                </div>
              )}
            </>
          )}

          <h4 style={{ marginTop: 24 }}>Tecnologias Sociais</h4>
          {p.profile_social_technology?.length ? (
            <ul>
              {p.profile_social_technology.map((s) => (
                <li key={s.social_technology_fk}>
                  {s.social_technology?.name ?? `ID ${s.social_technology_fk}`}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#888' }}>Nenhuma tecnologia vinculada</p>
          )}
        </div>
      </div>

      {/* Histórico de tipo */}
      <div style={{ marginTop: 24 }}>
        <h4>Histórico de Tipo</h4>
        {props.isLoadingLog ? (
          <Loading />
        ) : props.typeLog?.length ? (
          <div>
            {props.typeLog.map((log: ProfileTypeLogEntry) => (
              <div key={log.id} style={{ borderLeft: '3px solid #ccc', paddingLeft: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {formatarData(log.createdAt)} — {log.changed_by?.username ?? 'sistema'}
                </div>
                <div>
                  <strong>
                    {log.previous_type
                      ? (log.previous_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador')
                      : '—'}
                  </strong>
                  {' → '}
                  <strong>
                    {log.new_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador'}
                  </strong>
                </div>
                {log.reason && (
                  <div style={{ fontSize: 13, color: '#555' }}>Motivo: {log.reason}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#888' }}>Nenhum histórico disponível</p>
        )}
      </div>

    </ContentPage>
  );
};

export default ProfileView;
```

---

### 7.3 Inputs compartilhados — `src/Pages/Profiles/Inputs/index.tsx`

```typescript
import { FormikProps } from 'formik';
import TextInput from '../../../Components/Form/TextInput';
import MaskInput from '../../../Components/Form/MaskInput';
import DropdownComponent from '../../../Components/Form/Dropdown';
import { typesex, color_race } from '../../../Controller/controllerGlobal';

interface Props {
  formik: FormikProps<any>;
  isEditing?: boolean;
  originalType?: 'COORDINATOR' | 'REAPPLICATOR';
}

const ProfileInputs = ({ formik, isEditing, originalType }: Props) => {
  const typeOptions = [
    { id: 'COORDINATOR', name: 'Coordenador' },
    { id: 'REAPPLICATOR', name: 'Reaplicador' },
  ];

  const typeChanged = isEditing && originalType && formik.values.current_type !== originalType;

  return (
    <div className="grid">

      <div className="col-12 md:col-6">
        <TextInput
          label="Nome *"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && formik.errors.name as string}
        />
      </div>

      <div className="col-12 md:col-6">
        <DropdownComponent
          label="Tipo *"
          options={typeOptions}
          value={typeOptions.find((o) => o.id === formik.values.current_type)}
          optionLabel="name"
          onChange={(e) => formik.setFieldValue('current_type', e.value?.id)}
          error={formik.touched.current_type && formik.errors.current_type as string}
        />
      </div>

      {/* Motivo: aparece SOMENTE ao editar quando o tipo muda */}
      {typeChanged && (
        <div className="col-12">
          <TextInput
            label="Motivo da alteração de tipo (opcional)"
            name="reason"
            value={formik.values.reason ?? ''}
            onChange={formik.handleChange}
            placeholder="Ex: Promovido a coordenador"
          />
        </div>
      )}

      <div className="col-12 md:col-6">
        <TextInput
          label="E-mail"
          name="email"
          value={formik.values.email ?? ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && formik.errors.email as string}
        />
      </div>

      <div className="col-12 md:col-6">
        <MaskInput
          label="Telefone"
          name="phone"
          mask="(99) 9 9999-9999"
          value={formik.values.phone ?? ''}
          onChange={formik.handleChange}
        />
      </div>

      <div className="col-12 md:col-6">
        <MaskInput
          label="Data de Nascimento *"
          name="birthday"
          mask="99/99/9999"
          value={formik.values.birthday ?? ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.birthday && formik.errors.birthday as string}
        />
      </div>

      <div className="col-12 md:col-6">
        <MaskInput
          label="Data de Início"
          name="initial_date"
          mask="99/99/9999"
          value={formik.values.initial_date ?? ''}
          onChange={formik.handleChange}
        />
      </div>

      <div className="col-12 md:col-6">
        <DropdownComponent
          label="Sexo *"
          options={typesex}
          value={typesex.find((s) => s.id === formik.values.sex)}
          optionLabel="type"
          onChange={(e) => formik.setFieldValue('sex', e.value?.id)}
          error={formik.touched.sex && formik.errors.sex as string}
        />
      </div>

      <div className="col-12 md:col-6">
        <DropdownComponent
          label="Cor/Raça *"
          options={color_race}
          value={color_race.find((c) => c.id === formik.values.color_race)}
          optionLabel="name"
          onChange={(e) => formik.setFieldValue('color_race', e.value?.id)}
          error={formik.touched.color_race && formik.errors.color_race as string}
        />
      </div>

    </div>
  );
};

export default ProfileInputs;
```

---

### 7.4 Criação — `src/Pages/Profiles/ProfileCreate/index.tsx`

```typescript
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import ContentPage from '../../../Components/ContentPage';
import ProfileInputs from '../Inputs';
import TextInput from '../../../Components/Form/TextInput';
import { ControllerProfile } from '../../../Services/Profile/controller';
import { converterData } from '../../../Controller/controllerGlobal';
import { CreateProfileDto, CreateUserWithProfile } from '../../../Context/Profile/type';

const profileBaseSchema = {
  name: Yup.string().min(3, 'Mínimo 3 caracteres').required('Nome obrigatório'),
  current_type: Yup.string().oneOf(['COORDINATOR', 'REAPPLICATOR']).required('Tipo obrigatório'),
  birthday: Yup.string().required('Data de nascimento obrigatória'),
  sex: Yup.number().required('Sexo obrigatório').typeError('Sexo obrigatório'),
  color_race: Yup.number().required('Cor/raça obrigatória').typeError('Cor/raça obrigatória'),
};

const ProfileCreate = () => {
  const history = useNavigate();
  const [searchParams] = useSearchParams();
  const { createProfileMutation, createUserWithProfileMutation } = ControllerProfile();
  const [withLogin, setWithLogin] = useState(false);

  // Suporta pré-preencher user_fk via query string: /perfis/criar?user_fk=42
  const prefilledUserFk = searchParams.get('user_fk') ? parseInt(searchParams.get('user_fk')!) : undefined;

  const validationSchema = Yup.object({
    ...profileBaseSchema,
    ...(withLogin
      ? {
          username: Yup.string().required('Nome de usuário obrigatório'),
          password: Yup.string().min(8, 'Mínimo 8 caracteres').required('Senha obrigatória'),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'As senhas não coincidem')
            .required('Confirmação obrigatória'),
        }
      : {}),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      current_type: '',
      email: '',
      phone: '',
      birthday: '',
      initial_date: '',
      sex: undefined as number | undefined,
      color_race: undefined as number | undefined,
      active: true,
      username: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: (values) => {
      const birthdayISO = converterData(values.birthday);
      const initialDateISO = values.initial_date ? converterData(values.initial_date) : undefined;

      if (withLogin && values.username) {
        const dto: CreateUserWithProfile = {
          name: values.name,
          username: values.username,
          password: values.password,
          role: 'USER',
          current_type: values.current_type as 'COORDINATOR' | 'REAPPLICATOR',
          email: values.email || undefined,
          phone: values.phone || undefined,
          sex: values.sex,
          color_race: values.color_race,
          // user-bff espera DD/MM/YYYY
          birthday: values.birthday,
          initial_date: values.initial_date || undefined,
        };
        createUserWithProfileMutation.mutate(dto);
      } else {
        const dto: CreateProfileDto = {
          name: values.name,
          current_type: values.current_type as 'COORDINATOR' | 'REAPPLICATOR',
          email: values.email || undefined,
          phone: values.phone || undefined,
          birthday: birthdayISO,
          initial_date: initialDateISO,
          sex: values.sex!,
          color_race: values.color_race!,
          active: values.active,
          user_fk: prefilledUserFk,
        };
        createProfileMutation.mutate(dto);
      }
    },
  });

  const isLoading = createProfileMutation.isLoading || createUserWithProfileMutation.isLoading;

  return (
    <ContentPage title="Novo Perfil" description="Criar um novo perfil operacional">
      <form onSubmit={formik.handleSubmit}>
        <ProfileInputs formik={formik} />

        {!prefilledUserFk && (
          <div style={{ marginTop: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox
              inputId="withLogin"
              checked={withLogin}
              onChange={(e) => setWithLogin(e.checked ?? false)}
            />
            <label htmlFor="withLogin">Criar conta de login para este perfil</label>
          </div>
        )}

        {withLogin && (
          <div className="grid" style={{ marginTop: 8 }}>
            <div className="col-12 md:col-4">
              <TextInput
                label="Nome de usuário *"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && formik.errors.username as string}
              />
            </div>
            <div className="col-12 md:col-4">
              <TextInput
                label="Senha *"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && formik.errors.password as string}
              />
            </div>
            <div className="col-12 md:col-4">
              <TextInput
                label="Confirmar senha *"
                name="confirmPassword"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && formik.errors.confirmPassword as string}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button type="button" label="Cancelar" outlined onClick={() => history('/perfis')} />
          <Button type="submit" label="Criar Perfil" loading={isLoading} />
        </div>
      </form>
    </ContentPage>
  );
};

export default ProfileCreate;
```

---

### 7.5 Edição — `src/Pages/Profiles/ProfileEdit/index.tsx`

```typescript
import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useFetchProfileOne } from '../../../Services/Profile/query';
import ContentPage from '../../../Components/ContentPage';
import ProfileInputs from '../Inputs';
import Loading from '../../../Components/Loading';
import { ControllerProfile } from '../../../Services/Profile/controller';
import { converterData, formatarData } from '../../../Controller/controllerGlobal';

const ProfileEdit = () => {
  const { id } = useParams<{ id: string }>();
  const history = useNavigate();
  const { data: profile, isLoading } = useFetchProfileOne(parseInt(id!));
  const { updateProfileMutation } = ControllerProfile();

  const formik = useFormik({
    initialValues: {
      name: '',
      current_type: '' as 'COORDINATOR' | 'REAPPLICATOR' | '',
      email: '',
      phone: '',
      birthday: '',
      initial_date: '',
      sex: undefined as number | undefined,
      color_race: undefined as number | undefined,
      active: true,
      reason: '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().min(3).required('Nome obrigatório'),
      current_type: Yup.string().oneOf(['COORDINATOR', 'REAPPLICATOR']).required('Tipo obrigatório'),
    }),
    onSubmit: (values) => {
      updateProfileMutation.mutate({
        id: parseInt(id!),
        data: {
          name: values.name,
          current_type: values.current_type as 'COORDINATOR' | 'REAPPLICATOR',
          email: values.email || undefined,
          phone: values.phone || undefined,
          birthday: converterData(values.birthday),
          initial_date: values.initial_date ? converterData(values.initial_date) : undefined,
          sex: values.sex,
          color_race: values.color_race,
          active: values.active,
          reason: values.reason || undefined,
        },
      });
    },
  });

  useEffect(() => {
    if (profile) {
      formik.setValues({
        name: profile.name,
        current_type: profile.current_type,
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        birthday: profile.birthday ? formatarData(profile.birthday) : '',
        initial_date: profile.initial_date ? formatarData(profile.initial_date) : '',
        sex: profile.sex,
        color_race: profile.color_race,
        active: profile.active,
        reason: '',
      });
    }
  }, [profile]);

  if (isLoading) return <Loading />;

  return (
    <ContentPage title={`Editar: ${profile?.name}`} description="Atualizar dados do perfil">
      <form onSubmit={formik.handleSubmit}>
        <ProfileInputs formik={formik} isEditing originalType={profile?.current_type} />
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button type="button" label="Cancelar" outlined onClick={() => history(`/perfis/${id}`)} />
          <Button type="submit" label="Salvar" loading={updateProfileMutation.isLoading} />
        </div>
      </form>
    </ContentPage>
  );
};

export default ProfileEdit;
```

---

## 8. Roteamento — `src/Router/router.tsx`

Adicionar as rotas seguindo o padrão `<PrivateRoute>` existente.
`/perfis/criar` deve vir **antes** de `/perfis/:id`:

```typescript
import ProfileList   from '../Pages/Profiles/ProfileList';
import ProfileCreate from '../Pages/Profiles/ProfileCreate';
import ProfileView   from '../Pages/Profiles/ProfileView';
import ProfileEdit   from '../Pages/Profiles/ProfileEdit';

// Dentro do Routes (na ordem correta):
<Route element={<PrivateRoute Component={<ProfileList />} />}   path="/perfis" />
<Route element={<PrivateRoute Component={<ProfileCreate />} />} path="/perfis/criar" />
<Route element={<PrivateRoute Component={<ProfileView />} />}   path="/perfis/:id" />
<Route element={<PrivateRoute Component={<ProfileEdit />} />}   path="/perfis/:id/editar" />
```

---

## 9. Menu — `src/Components/Menu/index.tsx`

Adicionar item "Perfis" visível para ADMIN e COORDINATOR.
Substituir o item "Reaplicadores" (que passa a ser gerenciado via /perfis com filtro de tipo).

```typescript
// Antes:
{(props.user?.role === ROLE.ADMIN || props.user?.role === ROLE.COORDINATORS) && (
  <Item text="Reaplicadores" path="/reaplicadores" ... />
)}

// Depois:
{(props.user?.role === ROLE.ADMIN || props.user?.profileType === PROFILE_TYPE.COORDINATOR) && (
  <Item text="Perfis" path="/perfis" icon={...} ... />
)}
```

---

## 10. Alterações na Tela de Usuários

> Estas mudanças tornam a tela de usuários focada em gestão de acesso,
> movendo dados pessoais/operacionais para a tela de perfis.

### 10.1 `src/Pages/Users/CreateUser/index.tsx` — simplificar formulário

**Remover do formulário:**
- `birthday`, `phone`, `email`, `sex`, `color_race`, `initial_date`
- Tecnologias sociais (project[])
- role options `REAPPLICATORS` e `COORDINATORS`

**Manter:**
- `name`, `username`, `password`, `confirmPassword`
- `role`: somente `ADMIN` ou `USER`
- `active`

```typescript
// Opções de role no formulário de usuário:
const roleOptions = [
  { id: 'USER', name: 'Usuário' },
  { id: 'ADMIN', name: 'Administrador' },
];
```

### 10.2 `src/Pages/Users/EditUser/index.tsx` — simplificar

Mesma remoção de campos. O EditUser passa a editar só:
- `name`, `username`, `active`, `role` (ADMIN | USER)

### 10.3 `src/Pages/Users/ListUsers.tsx` — filtro e colunas

```typescript
// Remover do filtro de role as opções antigas:
const roleOptions = [
  { id: 'TODOS', name: 'Todos' },
  { id: 'ADMIN', name: 'Admin' },
  { id: 'USER', name: 'Usuário' },
  // REMOVER: { id: 'REAPPLICATORS', ... } e { id: 'COORDINATORS', ... }
];
```

Adicionar coluna "Perfil" com badge e link:

```typescript
const profileBody = (row: User) =>
  row.profile ? (
    <Button
      label={row.profile.current_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador'}
      text
      size="small"
      onClick={() => history(`/perfis/${row.profile.id}`)}
    />
  ) : (
    <Button
      label="Criar perfil"
      text
      size="small"
      severity="secondary"
      onClick={() => history(`/perfis/criar?user_fk=${row.id}`)}
    />
  );
```

### 10.4 Adicionar seção de perfil na tela de detalhe do usuário

Em qualquer tela de detalhe/edição de usuário (ex: `EditUser/index.tsx` ou uma `UserView` se existir), adicionar bloco:

```typescript
{user?.profile ? (
  <div style={{ marginTop: 16 }}>
    <h4>Perfil Operacional</h4>
    <p>
      <strong>Nome:</strong> {user.profile.name}{' '}
      <Tag
        value={user.profile.current_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador'}
        severity={user.profile.current_type === 'COORDINATOR' ? 'info' : 'warning'}
      />
    </p>
    <Button
      label="Ver perfil →"
      text
      onClick={() => history(`/perfis/${user.profile.id}`)}
    />
  </div>
) : (
  <div style={{ marginTop: 16 }}>
    <h4>Perfil Operacional</h4>
    <p style={{ color: '#888' }}>Sem perfil vinculado</p>
    <Button
      label="Criar perfil para este usuário"
      text
      onClick={() => history(`/perfis/criar?user_fk=${user.id}`)}
    />
  </div>
)}
```

### 10.5 Tipo User atualizado (`src/Context/Users/type.tsx`)

```typescript
export interface UserProfile {
  id: number;
  name: string;
  current_type: 'COORDINATOR' | 'REAPPLICATOR';
}

export interface User {
  id: number;
  name: string;
  username: string;
  active: boolean;
  role: 'ADMIN' | 'USER';
  profile?: UserProfile; // campo novo — retornado pelo GET /users
}
```

---

## 11. Nota sobre `user_fk: null` (desvincular)

O endpoint `PUT /profile/:id` com `{ user_fk: null }` requer que o backend
aceite `null` explicitamente no `UpdateProfileDto`. Confirmar com o backend
antes de implementar o desvincular se este campo está configurado para aceitar null.

Se não estiver, a alternativa é o backend criar um endpoint dedicado:
`DELETE /profile/:id/user` que seta `user_fk = null`.

---

## 12. API — Contrato Resumido

| Endpoint | Método | Descrição |
|---|---|---|
| `/profile` | GET | Listar com filtros (page, perPage, name, current_type, active) |
| `/profile/:id` | GET | Detalhe com user, profile_social_technology, profile_type_log |
| `/profile/:id/type-log` | GET | Histórico de tipo (ordenado por createdAt DESC) |
| `/profile` | POST | Criar perfil (user_fk opcional) |
| `/profile/:id` | PUT | Atualizar (parcial — inclui user_fk para vincular/desvincular) |
| `/profile/:id` | DELETE | Excluir perfil (não exclui usuário vinculado) |
| `/user-bff` | POST | Criar perfil + usuário em transação única |
| `/users` | GET | Listar usuários (resposta inclui profile se vinculado) |

---

## 13. Checklist de Implementação

### Pré-requisito (fazer primeiro)
- [ ] Atualizar interface `User` com `profileId` e `profileType`
- [ ] Atualizar `AplicationContext` para expor `profileId` e `profileType`
- [ ] Atualizar constante `ROLE` (remover REAPPLICATORS/COORDINATORS)
- [ ] Adicionar constante `PROFILE_TYPE`
- [ ] Migrar todas as verificações `role === ROLE.COORDINATORS/REAPPLICATORS` para `profileType`

### Módulo Profile (novo)
- [ ] `src/Context/Profile/type.tsx`
- [ ] `src/Context/Profile/state.tsx`
- [ ] `src/Context/Profile/context.tsx`
- [ ] `src/Services/Profile/request.tsx`
- [ ] `src/Services/Profile/query.tsx`
- [ ] `src/Services/Profile/controller.tsx`
- [ ] `src/Pages/Profiles/ProfileList/index.tsx`
- [ ] `src/Pages/Profiles/ProfileView/index.tsx`
- [ ] `src/Pages/Profiles/ProfileCreate/index.tsx`
- [ ] `src/Pages/Profiles/ProfileEdit/index.tsx`
- [ ] `src/Pages/Profiles/Inputs/index.tsx`
- [ ] Adicionar rotas em `src/Router/router.tsx`
- [ ] Atualizar item de menu (Perfis no lugar de Reaplicadores)

### Tela de Usuários (adaptação)
- [ ] Simplificar `CreateUser` (remover campos pessoais e roles antigos)
- [ ] Simplificar `EditUser` (idem)
- [ ] Atualizar filtros de role em `ListUsers`
- [ ] Adicionar coluna "Perfil" na lista de usuários
- [ ] Adicionar seção de perfil no detalhe/edição do usuário
- [ ] Atualizar tipo `User` em `src/Context/Users/type.tsx`

### Limpeza final (após validação em homologação)
- [ ] Remover `src/Pages/Reapplicators/` (substituído por /perfis com filtro de tipo)
- [ ] Remover `src/Context/Reapplicators/`
- [ ] Remover `src/Services/Reapplicators/`
- [ ] Remover chamadas a `/reapplicators` em qualquer ponto do código
- [ ] Remover `src/Pages/Coordinators/` se vazio/não utilizado

---

## 14. Referências

- Documentação funcional: `docs/modulo_profile/funcional.md`
- Padrão seguido: `src/Pages/Reapplicators/` e `src/Pages/Users/`
- Contrato completo do backend: `br.ipti.beneficiarios/docs/profile/tecnica-profile.md`

---

## 15. Auditoria Completa — O que Muda e Onde

> Resultado da varredura de todo o código existente.
> Cada item tem: arquivo, linha, código atual, o que controla, e o que deve ser.

---

### 15.1 Verificações de Permissão (role → profileType)

**47 ocorrências em 17 arquivos. Todas as que envolvem COORDINATORS/REAPPLICATORS precisam mudar.**

#### `src/Components/Menu/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 151–152 | `role === ROLE.ADMIN \|\| role === ROLE.COORDINATORS` | Exibe item "Reaplicadores" (→ passa a ser "Perfis") | `role === ROLE.ADMIN \|\| user?.profileType === PROFILE_TYPE.COORDINATOR` |
| 168–169 | `role === ROLE.ADMIN \|\| role === ROLE.COORDINATORS` | Exibe item "Usuários" | `role === ROLE.ADMIN \|\| user?.profileType === PROFILE_TYPE.COORDINATOR` |

#### `src/Components/Card/CardClassroom/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 61–62 | `role === ROLE.ADMIN \|\| role === ROLE.COORDINATORS` | Botão excluir turma | `role === ROLE.ADMIN \|\| user?.profileType === PROFILE_TYPE.COORDINATOR` |

#### `src/Components/Card/CardMeeting/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 58–59 | `role === ROLE.ADMIN \|\| role === ROLE.COORDINATORS` | Botão excluir reunião | `role === ROLE.ADMIN \|\| user?.profileType === PROFILE_TYPE.COORDINATOR` |

#### `src/Components/Card/CardRegistration/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 49–51 | `role === ROLE.ADMIN \|\| role === ROLE.COORDINATORS` | Clicar na matrícula + botão excluir | `role === ROLE.ADMIN \|\| user?.profileType === PROFILE_TYPE.COORDINATOR` |

#### `src/Pages/Reapplicators/ReapplicatorsList/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 30–32 | `role === ROLE.ADMIN \|\| role === ROLE.COORDINATORS` | Acesso à página inteira | Página será substituída por `/perfis` — remover no final |

#### `src/Pages/Reapplicators/ReapplicatorView/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 36 | `isAdmin \|\| role === ROLE.COORDINATORS` | Acesso à página inteira | Página será substituída por `/perfis/:id` — remover no final |

#### `src/Pages/Classroom/ListClassroom/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 52–54 | `role === ROLE.ADMIN \|\| role === ROLE.COORDINATORS` | Botão "+ Nova Turma" | `role === ROLE.ADMIN \|\| user?.profileType === PROFILE_TYPE.COORDINATOR` |

#### `src/Pages/Classroom/ClassroomOne/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 270–271 | `role === ROLE.ADMIN \|\| role === ROLE.COORDINATORS` | Menu de ações (download, editar, transferir, reutilizar) | `role === ROLE.ADMIN \|\| user?.profileType === PROFILE_TYPE.COORDINATOR` |

#### `src/Pages/Classroom/ClassroomOne/MeetingList/Meeting/DataMeeting/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 167–169 | `role === ROLE.ADMIN \|\| role === ROLE.COORDINATORS` | Editar status da reunião | `role === ROLE.ADMIN \|\| user?.profileType === PROFILE_TYPE.COORDINATOR` |

#### `src/Pages/Classroom/ClassroomOne/MeetingList/Meeting/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 96–97 | `role === ROLE.REAPPLICATORS` | Exibe campo de justificativa | `user?.profileType === PROFILE_TYPE.REAPPLICATOR` |
| 124–126 | `role === ROLE.REAPPLICATORS` | Bloqueia upload quando reunião aprovada | `user?.profileType === PROFILE_TYPE.REAPPLICATOR` |

#### `src/Pages/Projects/ProjectsList/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 35–37 | `role === ROLE.ADMIN \|\| role === ROLE.COORDINATORS` | Botão "+ Novo Projeto" | `role === ROLE.ADMIN \|\| user?.profileType === PROFILE_TYPE.COORDINATOR` |

#### `src/Pages/Projects/ProjectOne/index.tsx` ⚠️ BUG ATIVO

| Linha | Código atual | Problema | Código novo |
|---|---|---|---|
| 158–159 | `role === (ROLE.ADMIN \|\| ROLE.COORDINATORS)` | Avalia como `role === "ADMIN"` — coordenador nunca vê o botão | `role === ROLE.ADMIN \|\| user?.profileType === PROFILE_TYPE.COORDINATOR` |
| 168–169 | `role === (ROLE.ADMIN \|\| ROLE.COORDINATORS)` | Mesmo bug | `role === ROLE.ADMIN \|\| user?.profileType === PROFILE_TYPE.COORDINATOR` |

#### `src/Pages/Users/ListUsers.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 46–52 | `role === ROLE.COORDINATORS ? "Coordenador" : role === ROLE.REAPPLICATORS ? "Reaplicador"` | Exibição do role na tabela | Exibir `profile.current_type` convertido para pt-BR (COORDINATOR → "Coordenador") |
| 88–93 | Options incluem `ROLE.COORDINATORS` e `ROLE.REAPPLICATORS` | Dropdown de filtro de role | Remover essas opções; manter só ADMIN e USER |
| 96–98 | Options `COORDINATORS` e `REAPPLICATORS` para não-admin | Dropdown de role para coordenador criar usuário | Remover; coordenador não cria usuário com tipo operacional |

#### `src/Pages/Users/EditUser/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 98 | `role === ROLE.REAPPLICATORS ? reapplicators[0] : role === ROLE.COORDINATORS ? coordinators[0]` | Escolhe qual perfil pré-preenche o formulário | `user.profile` (objeto único) |
| 105 | `role === ROLE.REAPPLICATORS \|\| role === ROLE.COORDINATORS` | Determina se é perfil operacional (exibe campos extras) | `user.profile !== undefined` |

#### `src/Pages/Users/Inputs/index.tsx`

| Linha | Código atual | O que controla | Código novo |
|---|---|---|---|
| 29–32 | `ADMIN_ROLE_OPTIONS` inclui `COORDINATORS` e `REAPPLICATORS` | Dropdown de role para admin criar usuário | Remover; role só é ADMIN ou USER |
| 35–37 | `COORDINATOR_ROLE_OPTIONS` inclui `COORDINATORS` e `REAPPLICATORS` | Dropdown de role para coordenador criar usuário | Remover completamente |
| 111 | `role === ROLE.ADMIN ? ADMIN_OPTIONS : COORDINATOR_OPTIONS` | Condicional do dropdown | `role === ROLE.ADMIN ? ADMIN_ONLY_OPTIONS : USER_ONLY_OPTIONS` |

---

### 15.2 Tipos TypeScript com estrutura antiga

#### `src/Context/Users/type.tsx` — interface `User`

```typescript
// ANTES
export interface User {
  id: number;
  name: string;
  username: string;
  active: boolean;
  role: string; // 'ADMIN' | 'USER' | 'REAPPLICATORS' | 'COORDINATORS'
}

// DEPOIS
export interface User {
  id: number;
  name: string;
  username: string;
  active: boolean;
  role: 'ADMIN' | 'USER';
  profileId?: number;
  profileType?: 'COORDINATOR' | 'REAPPLICATOR';
  profile?: {
    id: number;
    name: string;
    current_type: 'COORDINATOR' | 'REAPPLICATOR';
  };
}
```

#### `src/Context/Users/type.tsx` — interface `CreateUser`

```typescript
// ANTES — envia role REAPPLICATORS/COORDINATORS + dados pessoais
export interface CreateUser {
  name: string;
  username: string;
  password?: string;
  project: number[];          // social_technology IDs
  role?: string;              // ADMIN | USER | REAPPLICATORS | COORDINATORS
  email?: string;
  phone?: string;
  sex?: number;
  color_race?: number;
  initial_date?: string;
  birthday?: string;
}

// DEPOIS — CreateUser simplificado (dados pessoais vão para profile)
export interface CreateUser {
  name: string;
  username: string;
  password?: string;
  role?: 'ADMIN' | 'USER';
  active?: boolean;
}

// NOVO — criar usuário + perfil via /user-bff (já está em Profile/type.tsx)
// Usar CreateUserWithProfile de src/Context/Profile/type.tsx
```

#### `src/Context/Classroom/Meeting/MeetingListRegistration/type.tsx` — linha 25

```typescript
// ANTES
meeting_user: MeetingUser[];
interface MeetingUser {
  users: { id: number; name: string; username: string; active: boolean; role: string; };
}

// DEPOIS
meeting_profile: MeetingProfile[];
interface MeetingProfile {
  profile: { id: number; name: string; current_type: 'COORDINATOR' | 'REAPPLICATOR'; };
}
```

#### `src/Services/Classroom/type.tsx` — linha 28

```typescript
// ANTES
meeting_user: MeetingUser[];

// DEPOIS
meeting_profile: MeetingProfile[];
// (mesma estrutura do item acima)
```

#### `src/Context/Classroom/Meeting/Create/type.tsx`

```typescript
// ANTES
interface CreateMeeting { users?: Array<number>; }
interface EditMeetingUser { users: number[]; id: number; }

// DEPOIS
interface CreateMeeting { profiles?: Array<number>; }
interface EditMeetingMembers { profiles: number[]; id: number; }
```

---

### 15.3 Chamadas de API com parâmetros antigos

#### `src/Services/Users/request.tsx`

| Linha | Endpoint | Parâmetro antigo | Parâmetro novo |
|---|---|---|---|
| 18 | `GET /user-bff` | `role=REAPPLICATORS\|COORDINATORS` | Filtro de tipo operacional não é mais por `role`; usar `GET /profile?current_type=...` separado |
| 64 | `POST /user-bff` | `role: 'REAPPLICATORS'\|'COORDINATORS'` + dados pessoais | `role: 'USER'` + `current_type: 'COORDINATOR'\|'REAPPLICATOR'` + dados pessoais |
| 93 | `PUT /user-bff` | `role: 'REAPPLICATORS'\|'COORDINATORS'` + dados pessoais | Dados do usuário separado de dados do perfil; PUT /profile/:id para dados pessoais |

#### `src/Services/Reapplicators/request.tsx`

| Endpoint | Situação | O que substitui |
|---|---|---|
| `GET /reapplicators` | **Remover** | `GET /profile?current_type=REAPPLICATOR` |
| `GET /reapplicators/:id` | **Remover** | `GET /profile/:id` |
| `POST /reapplicators` | **Remover** | `POST /profile` |
| `PUT /reapplicators/:id` | **Remover** | `PUT /profile/:id` |
| `DELETE /reapplicators/:id` | **Remover** | `DELETE /profile/:id` |

#### `src/Services/Meeting/request.tsx`

| Linha | Endpoint | Parâmetro antigo | Parâmetro novo |
|---|---|---|---|
| 35 | `PUT /meeting-bff/update-members` | `{ id, users: number[] }` | `{ id, profiles: number[] }` |

#### `src/Services/Login/controller.tsx`

| Linha | Código antigo | Código novo |
|---|---|---|
| 28–29 | `userRegistered.user_social_technology[0]?.social_technology_fk` | `userRegistered.profile?.profile_social_technology?.[0]?.social_technology_fk` |

#### `src/Services/SocialTechnology/request.tsx`

| Linha | Endpoint | O que muda |
|---|---|---|
| 7 | `GET /social-technology-bff/user?userId=ID` | Backend já aceita `profileId`; verificar se o frontend precisa passar o profileId do usuário logado junto com userId |

---

### 15.4 Acesso a dados de relacionamento no JSX

#### Participantes de reunião (4 arquivos)

```typescript
// DataMeeting/index.tsx:234 — montar lista para envio ao backend
// ANTES
users: props.meeting?.meeting_user.map((item) => item.users.id) ?? []

// DEPOIS
profiles: props.meeting?.meeting_profile.map((item) => item.profile.id) ?? []

// ──────────────────────────────────────────────────────────────
// DataMeeting/index.tsx:257 — lista de responsáveis (fallback)
// ANTES
const fallbackResponsibles = props.meeting?.meeting_user?.map((item) => item.users) ?? []

// DEPOIS
const fallbackResponsibles = props.meeting?.meeting_profile?.map((item) => item.profile) ?? []

// ──────────────────────────────────────────────────────────────
// Beneficiarios/index.tsx:224 — nomes no PDF
// ANTES
`Facilitador: ${props.meeting?.meeting_user.map((u) => u.users.name).join(", ")}`

// DEPOIS
`Facilitador: ${props.meeting?.meeting_profile.map((mp) => mp.profile.name).join(", ")}`

// ──────────────────────────────────────────────────────────────
// Report/Pdf/index.tsx:139-146 — lista de facilitadores únicos no relatório
// ANTES
meeting?.meeting_user?.forEach((entry: any) => {
  const user = entry.users;
  if (!uniqueUsersMap.has(user.id)) { uniqueUsersMap.set(user.id, user); }
});

// DEPOIS
meeting?.meeting_profile?.forEach((entry: any) => {
  const profile = entry.profile;
  if (!uniqueProfilesMap.has(profile.id)) { uniqueProfilesMap.set(profile.id, profile); }
});
```

#### EditUser — pré-preencher dados do perfil

```typescript
// EditUser/index.tsx:97-101
// ANTES — acessa arrays separados
const profile =
  project?.role === ROLE.REAPPLICATORS
    ? project?.reapplicators?.[0]
    : project?.role === ROLE.COORDINATORS
    ? project?.coordinators?.[0]
    : null;

// DEPOIS — acessa objeto único
const profile = project?.profile ?? null;

// ──────────────────────────────────────────────────────────────
// EditUser/index.tsx:128
// ANTES
selectTs(project.user_social_technology)

// DEPOIS
selectTs(project.profile?.profile_social_technology)
```

#### Login — projeto padrão

```typescript
// Login/controller.tsx:28-29
// ANTES
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

#### Reapplicators — navegação e exibição

```typescript
// ReapplicatorView/index.tsx:82
// ANTES
onClick={() => history("/users/" + reapplicator.users_fk)}

// DEPOIS (profile tem user_fk, não users_fk)
onClick={() => history("/users/" + reapplicator.user_fk)}

// ──────────────────────────────────────────────────────────────
// ReapplicatorsList/index.tsx:73
// ANTES
(rowData.users?.user_social_technology ?? []).map((ust: any) => ust.usersocialtechnology?.name)

// DEPOIS (response de /profile já traz profile_social_technology)
(rowData.profile_social_technology ?? []).map((pst: any) => pst.social_technology?.name)
```

---

### 15.5 Contexto de autenticação — atualização do AplicationContext

O `AplicationContext` lê o usuário via `GET /user-bff/one?userId=ID` (em `src/Context/Aplication/state.tsx`).
A resposta desse endpoint **já retorna `profile`** com os dados do novo modelo.

**O que fazer:**

1. Verificar a resposta atual de `GET /user-bff/one` para confirmar o shape do campo `profile`
2. Atualizar a interface `User` conforme seção 15.2
3. O `profileType` e `profileId` virão de `user.profile.current_type` e `user.profile.id`
4. Expô-los diretamente no objeto `user` do contexto para compatibilidade com todos os checks:

```typescript
// src/Context/Aplication/state.tsx — ao setar o usuário
if (userRequest) {
  const enrichedUser = {
    ...userRequest,
    profileId: userRequest.profile?.id,
    profileType: userRequest.profile?.current_type,
  };
  setUser(enrichedUser);
}
```

> **Alternativa:** se o JWT já retorna `profileId` e `profileType` no payload,
> ler diretamente do token decodificado em vez de fazer outra chamada.
> Verificar o que está implementado em `src/Context/Login/state.tsx`.

---

### 15.6 Ordem de execução das mudanças

Seguir esta ordem para não quebrar nada durante a migração:

```
FASE 1 — Infra (sem afetar comportamento visível)
  1. Atualizar types: User, CreateUser, MeetingProfile, tipos de reunião
  2. Atualizar ROLE enum (adicionar PROFILE_TYPE, manter ROLE.ADMIN/USER)
  3. Atualizar AplicationContext para expor profileId e profileType
  4. Criar módulo Profile (Context + Services + Pages) — seções 3-7 deste doc

FASE 2 — Trocar permissões (paralelo após Fase 1)
  5. Substituir todos os ROLE.COORDINATORS → profileType === COORDINATOR (11 arquivos)
  6. Substituir todos os ROLE.REAPPLICATORS → profileType === REAPPLICATOR (3 arquivos)
  7. Corrigir bug em ProjectOne (linhas 158-159, 168-169)
  8. Atualizar menu (item Reaplicadores → Perfis)

FASE 3 — Trocar relacionamentos (paralelo após Fase 1)
  9. Atualizar chamadas de meeting: users[] → profiles[], meeting_user → meeting_profile
  10. Atualizar login controller (user_social_technology → profile_social_technology)
  11. Atualizar EditUser (reapplicators[0]/coordinators[0] → profile)
  12. Atualizar tela de usuários (remover campos pessoais do CreateUser/EditUser)

FASE 4 — Validar e limpar
  13. Validar em homologação que todos os fluxos funcionam
  14. Remover src/Pages/Reapplicators/
  15. Remover src/Context/Reapplicators/ e src/Services/Reapplicators/
  16. Remover ROLE.REAPPLICATORS e ROLE.COORDINATORS do enum
```
