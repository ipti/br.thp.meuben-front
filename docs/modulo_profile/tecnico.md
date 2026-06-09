# Documentação Técnica — Módulo de Perfis
## `br.ipti.form` — Implementação da Tela de Gerenciamento de Perfis

---

## 1. Visão Geral

Este documento descreve **como implementar** o módulo de perfis seguindo os padrões
arquiteturais já estabelecidos no projeto (mesmo padrão da tela de reaplicadores e usuários).

**Rotas novas:**
- `/perfis` — listagem
- `/perfis/:id` — detalhe
- `/perfis/criar` — formulário de criação
- `/perfis/:id/editar` — formulário de edição

---

## 2. Estrutura de Arquivos a Criar

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
│       └── controller.tsx       ← useMutation hooks + navegação + SweetAlert
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
            └── index.tsx        ← Campos compartilhados entre create/edit
```

---

## 3. Types — `src/Context/Profile/type.tsx`

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
  previous_type: 'COORDINATOR' | 'REAPPLICATOR' | null;  // null = criação inicial
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
  birthday: string;          // formato: YYYY-MM-DD
  initial_date?: string;     // formato: YYYY-MM-DD
  active?: boolean;
  user_fk?: number;
  reason?: string;           // usado ao alterar current_type no edit
}

// Para criar perfil + usuário numa única chamada (POST /user-bff)
export interface CreateUserWithProfile {
  name: string;
  username: string;
  password: string;
  role?: 'ADMIN' | 'USER';
  current_type: 'COORDINATOR' | 'REAPPLICATOR';
  project?: number[];        // array de social_technology IDs
  email?: string;
  phone?: string;
  sex?: number;
  color_race?: number;
  initial_date?: string;
  birthday?: string;
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

## 4. Services — Requests

### `src/Services/Profile/request.tsx`

```typescript
import http from '../axios';
import { CreateProfileDto, ProfileFilters } from '../../Context/Profile/type';

// Listar perfis com filtros
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

// Buscar perfil único
export const requestGetProfileOne = async (id: number) => {
  const response = await http.get(`/profile/${id}`);
  return response.data;
};

// Buscar histórico de tipo
export const requestGetProfileTypeLog = async (id: number) => {
  const response = await http.get(`/profile/${id}/type-log`);
  return response.data;
};

// Criar perfil (sem usuário ou com user_fk)
export const requestCreateProfile = async (data: CreateProfileDto) => {
  const response = await http.post('/profile', data);
  return response.data;
};

// Editar perfil
export const requestUpdateProfile = async (id: number, data: Partial<CreateProfileDto>) => {
  const response = await http.put(`/profile/${id}`, data);
  return response.data;
};

// Excluir perfil
export const requestDeleteProfile = async (id: number) => {
  const response = await http.delete(`/profile/${id}`);
  return response.data;
};
```

### `src/Services/Profile/query.tsx`

```typescript
import { useQuery } from 'react-query';
import {
  requestGetProfiles,
  requestGetProfileOne,
  requestGetProfileTypeLog,
} from './request';
import { ProfileFilters } from '../../Context/Profile/type';

export const useFetchProfiles = (params: ProfileFilters) => {
  return useQuery(
    ['useRequestsProfiles', params],
    () => requestGetProfiles(params),
    { keepPreviousData: true }
  );
};

export const useFetchProfileOne = (id: number) => {
  return useQuery(
    ['useRequestsProfileOne', id],
    () => requestGetProfileOne(id),
    { enabled: id > 0 }
  );
};

export const useFetchProfileTypeLog = (id: number) => {
  return useQuery(
    ['useRequestsProfileTypeLog', id],
    () => requestGetProfileTypeLog(id),
    { enabled: id > 0 }
  );
};
```

### `src/Services/Profile/controller.tsx`

```typescript
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from '../../Styles';
import {
  requestCreateProfile,
  requestUpdateProfile,
  requestDeleteProfile,
} from './request';
import { CreateProfileDto } from '../../Context/Profile/type';

export const ControllerProfile = () => {
  const history = useNavigate();
  const queryClient = useQueryClient();

  const createProfileMutation = useMutation(
    (data: CreateProfileDto) => requestCreateProfile(data),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao criar perfil',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
      onSuccess: (data) => {
        Swal.fire({
          icon: 'success',
          title: 'Perfil criado com sucesso!',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then((result) => {
          if (result.isConfirmed) {
            history('/perfis/' + data.id);
            queryClient.refetchQueries('useRequestsProfiles');
          }
        });
      },
    }
  );

  const updateProfileMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<CreateProfileDto> }) =>
      requestUpdateProfile(id, data),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao atualizar perfil',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
      onSuccess: (data) => {
        Swal.fire({
          icon: 'success',
          title: 'Perfil atualizado com sucesso!',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then((result) => {
          if (result.isConfirmed) {
            history('/perfis/' + data.id);
            queryClient.refetchQueries('useRequestsProfiles');
            queryClient.refetchQueries(['useRequestsProfileOne', data.id]);
          }
        });
      },
    }
  );

  const deleteProfileMutation = useMutation(
    (id: number) => requestDeleteProfile(id),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response?.data?.message ?? 'Erro ao excluir perfil',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Perfil excluído. O usuário vinculado não foi excluído.',
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then((result) => {
          if (result.isConfirmed) {
            history('/perfis');
            queryClient.refetchQueries('useRequestsProfiles');
          }
        });
      },
    }
  );

  const confirmDelete = (id: number) => {
    Swal.fire({
      icon: 'warning',
      title: 'Excluir perfil?',
      text: 'Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.',
      showCancelButton: true,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: styles.colors.colorsBaseProductNormal,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProfileMutation.mutate(id);
      }
    });
  };

  return {
    createProfileMutation,
    updateProfileMutation,
    deleteProfileMutation,
    confirmDelete,
  };
};
```

---

## 5. Context

### `src/Context/Profile/state.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useFetchProfiles, useFetchProfileOne, useFetchProfileTypeLog } from '../../Services/Profile/query';

export const ProfileState = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [nameSearch, setNameSearch] = useState('');
  const [currentTypeFilter, setCurrentTypeFilter] = useState<'COORDINATOR' | 'REAPPLICATOR' | undefined>();
  const [selectedId, setSelectedId] = useState(0);
  const [logProfileId, setLogProfileId] = useState(0);

  // Reset para pág 1 ao filtrar
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
    profiles,
    profile,
    typeLog,
    isLoading,
    isLoadingOne,
    isLoadingLog,
    page,
    perPage,
    nameSearch,
    currentTypeFilter,
    setPage,
    setPerPage,
    setNameSearch,
    setCurrentTypeFilter,
    loadOne,
    loadTypeLog,
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
  if (!ctx) throw new Error('useProfileContext must be used within ProfileProvider');
  return ctx;
};

export default ProfileProvider;
```

---

## 6. Páginas

### 6.1 Lista — `src/Pages/Profiles/ProfileList/index.tsx`

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
import ContentPage from '../../../Components/ContentPage';
import Loading from '../../../Components/Loading';
import TextInput from '../../../Components/Form/TextInput';
import DropdownComponent from '../../../Components/Form/Dropdown';
import { ROLE, PROFILE_TYPE } from '../../../Controller/controllerGlobal';

// ─── Wrapper com Provider ────────────────────────────────────────────────────
const ProfileList = () => (
  <ProfileProvider>
    <ProfileListPage />
  </ProfileProvider>
);

// ─── Conteúdo real ───────────────────────────────────────────────────────────
const ProfileListPage = () => {
  const props = useContext(ProfileContext) as ProfileContextTypes;
  const history = useNavigate();
  const { confirmDelete } = ControllerProfile();

  // Acesso — ler do contexto de login (padrão do projeto)
  // const propsAplication = useContext(ApplicationContext);
  // const isAdmin = propsAplication.user?.role === ROLE.ADMIN;

  const typeOptions = [
    { id: undefined, name: 'Todos' },
    { id: 'COORDINATOR', name: 'Coordenador' },
    { id: 'REAPPLICATOR', name: 'Reaplicador' },
  ];

  // ── Bodies das colunas ──────────────────────────────────────────────────
  const typeBody = (row: Profile) => (
    <Tag
      value={row.current_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador'}
      severity={row.current_type === 'COORDINATOR' ? 'info' : 'warning'}
    />
  );

  const activeBody = (row: Profile) => (
    <Tag
      value={row.active ? 'Ativo' : 'Inativo'}
      severity={row.active ? 'success' : 'danger'}
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
      <Button
        icon="pi pi-eye"
        rounded text
        onClick={() => history(`/perfis/${row.id}`)}
      />
      {/* isAdmin && ( */}
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
      {/* ) */}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <ContentPage
      title="Perfis"
      description="Gerenciamento de coordenadores e reaplicadores"
    >
      {/* Filtros */}
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
            value={typeOptions.find(o => o.id === props.currentTypeFilter)}
            optionLabel="name"
            onChange={(e) => props.setCurrentTypeFilter(e.value?.id)}
            placeholder="Tipo"
          />
        </div>
        <div className="col-12 md:col-2">
          <Button
            label="Novo Perfil"
            icon="pi pi-plus"
            onClick={() => history('/perfis/criar')}
          />
        </div>
      </div>

      {/* Tabela */}
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

### 6.2 Detalhe — `src/Pages/Profiles/ProfileView/index.tsx`

```typescript
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import ProfileProvider, { ProfileContext } from '../../../Context/Profile/context';
import { useContext } from 'react';
import { ProfileContextTypes, ProfileTypeLogEntry } from '../../../Context/Profile/type';
import ContentPage from '../../../Components/ContentPage';
import Loading from '../../../Components/Loading';
import { ControllerProfile } from '../../../Services/Profile/controller';
import { formatarData, VerifySex, VerifyColor } from '../../../Controller/controllerGlobal';

const ProfileView = () => (
  <ProfileProvider>
    <ProfileViewPage />
  </ProfileProvider>
);

const ProfileViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const props = useContext(ProfileContext) as ProfileContextTypes;
  const history = useNavigate();
  const { confirmDelete } = ControllerProfile();

  useEffect(() => {
    if (id) {
      props.loadOne(parseInt(id));
      props.loadTypeLog(parseInt(id));
    }
  }, [id]);

  if (props.isLoadingOne) return <Loading />;
  if (!props.profile) return null;

  const p = props.profile;

  return (
    <ContentPage title={p.name} description="Detalhe do perfil">

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button label="← Voltar" text onClick={() => history('/perfis')} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button label="Editar" icon="pi pi-pencil" onClick={() => history(`/perfis/${id}/editar`)} />
          <Button label="Excluir" icon="pi pi-trash" severity="danger" outlined onClick={() => confirmDelete(p.id)} />
        </div>
      </div>

      {/* Grid de dados */}
      <div className="grid">

        {/* Dados pessoais */}
        <div className="col-12 md:col-6">
          <h4>Dados Pessoais</h4>
          <p><strong>Tipo:</strong> <Tag value={p.current_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador'} severity={p.current_type === 'COORDINATOR' ? 'info' : 'warning'} /></p>
          <p><strong>E-mail:</strong> {p.email ?? '—'}</p>
          <p><strong>Telefone:</strong> {p.phone ?? '—'}</p>
          <p><strong>Nascimento:</strong> {formatarData(p.birthday)}</p>
          <p><strong>Data de início:</strong> {p.initial_date ? formatarData(p.initial_date) : '—'}</p>
          <p><strong>Sexo:</strong> {VerifySex(p.sex)?.type ?? '—'}</p>
          <p><strong>Cor/Raça:</strong> {VerifyColor(p.color_race)?.name ?? '—'}</p>
          <p><strong>Status:</strong> <Tag value={p.active ? 'Ativo' : 'Inativo'} severity={p.active ? 'success' : 'danger'} /></p>
        </div>

        {/* Conta de login vinculada */}
        <div className="col-12 md:col-6">
          <h4>Conta de Login</h4>
          {p.user ? (
            <>
              <p><strong>Nome:</strong> {p.user.name}</p>
              <p><strong>Usuário:</strong> {p.user.username}</p>
              <p><strong>Status:</strong> <Tag value={p.user.active ? 'Ativo' : 'Inativo'} severity={p.user.active ? 'success' : 'danger'} /></p>
              <Button label="Ver usuário" text onClick={() => history(`/users/${p.user_fk}`)} />
            </>
          ) : (
            <p style={{ color: '#888' }}>Sem conta de login vinculada</p>
          )}

          <h4 style={{ marginTop: 16 }}>Tecnologias Sociais</h4>
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
                  <strong>{log.previous_type ? (log.previous_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador') : '—'}</strong>
                  {' → '}
                  <strong>{log.new_type === 'COORDINATOR' ? 'Coordenador' : 'Reaplicador'}</strong>
                </div>
                {log.reason && <div style={{ fontSize: 13, color: '#555' }}>Motivo: {log.reason}</div>}
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

### 6.3 Campos compartilhados — `src/Pages/Profiles/Inputs/index.tsx`

```typescript
import { FormikProps } from 'formik';
import TextInput from '../../../Components/Form/TextInput';
import MaskInput from '../../../Components/Form/MaskInput';
import DropdownComponent from '../../../Components/Form/Dropdown';
import MultiSelectComponent from '../../../Components/Form/MultiSelect';
import { CreateProfileDto } from '../../../Context/Profile/type';
import { typesex, color_race } from '../../../Controller/controllerGlobal';

// Buscar social technologies — usar a query que já existe no projeto
// import { useFetchSocialTechnologies } from '../../../Services/SocialTechnology/query';

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
          value={typeOptions.find(o => o.id === formik.values.current_type)}
          optionLabel="name"
          onChange={(e) => formik.setFieldValue('current_type', e.value?.id)}
          error={formik.touched.current_type && formik.errors.current_type as string}
        />
      </div>

      {/* Campo de motivo — aparece SOMENTE ao editar e alterar o tipo */}
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
          value={typesex.find(s => s.id === formik.values.sex)}
          optionLabel="type"
          onChange={(e) => formik.setFieldValue('sex', e.value?.id)}
          error={formik.touched.sex && formik.errors.sex as string}
        />
      </div>

      <div className="col-12 md:col-6">
        <DropdownComponent
          label="Cor/Raça *"
          options={color_race}
          value={color_race.find(c => c.id === formik.values.color_race)}
          optionLabel="name"
          onChange={(e) => formik.setFieldValue('color_race', e.value?.id)}
          error={formik.touched.color_race && formik.errors.color_race as string}
        />
      </div>

      {/* Tecnologias Sociais — usar MultiSelect com dados da API */}
      {/* <div className="col-12">
        <MultiSelectComponent
          label="Tecnologias Sociais"
          options={socialTechs}
          value={...}
          onChange={(e) => formik.setFieldValue('project', e.value.map(v => v.id))}
        />
      </div> */}

    </div>
  );
};

export default ProfileInputs;
```

---

### 6.4 Formulário de criação — `src/Pages/Profiles/ProfileCreate/index.tsx`

```typescript
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import ContentPage from '../../../Components/ContentPage';
import ProfileInputs from '../Inputs';
import { ControllerProfile } from '../../../Services/Profile/controller';
import { converterData } from '../../../Controller/controllerGlobal';
import { CreateProfileDto } from '../../../Context/Profile/type';

// Também usa ControllerUser para o fluxo com criação de login
// import { ControllerUser } from '../../../Services/Users/controller';

const profileSchema = Yup.object({
  name: Yup.string().min(3, 'Mínimo 3 caracteres').required('Nome obrigatório'),
  current_type: Yup.string().oneOf(['COORDINATOR', 'REAPPLICATOR']).required('Tipo obrigatório'),
  birthday: Yup.string().required('Data de nascimento obrigatória'),
  sex: Yup.number().required('Sexo obrigatório'),
  color_race: Yup.number().required('Cor/raça obrigatória'),
});

const ProfileCreate = () => {
  const history = useNavigate();
  const { createProfileMutation } = ControllerProfile();
  const [withLogin, setWithLogin] = useState(false);

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
      reason: '',
      // Campos de login (opcionais)
      username: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: profileSchema,
    onSubmit: (values) => {
      const dto: CreateProfileDto = {
        name: values.name,
        current_type: values.current_type as 'COORDINATOR' | 'REAPPLICATOR',
        email: values.email || undefined,
        phone: values.phone || undefined,
        birthday: converterData(values.birthday),
        initial_date: values.initial_date ? converterData(values.initial_date) : undefined,
        sex: values.sex!,
        color_race: values.color_race!,
        active: values.active,
      };

      if (withLogin && values.username) {
        // Usar POST /user-bff que cria user + profile em uma transação
        // ControllerUser().requestUserMutation.mutate({ ...dto, username: values.username, password: values.password })
      } else {
        createProfileMutation.mutate(dto);
      }
    },
  });

  return (
    <ContentPage title="Novo Perfil" description="Criar um novo perfil operacional">
      <form onSubmit={formik.handleSubmit}>
        <ProfileInputs formik={formik} />

        {/* Toggle: criar conta de login */}
        <div style={{ marginTop: 16, marginBottom: 8 }}>
          <input
            type="checkbox"
            id="withLogin"
            checked={withLogin}
            onChange={(e) => setWithLogin(e.target.checked)}
          />
          <label htmlFor="withLogin" style={{ marginLeft: 8 }}>Criar conta de login para este perfil</label>
        </div>

        {withLogin && (
          <div className="grid">
            {/* TextInput username, PasswordInput password e confirmPassword */}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button type="button" label="Cancelar" outlined onClick={() => history('/perfis')} />
          <Button type="submit" label="Criar Perfil" loading={createProfileMutation.isLoading} />
        </div>
      </form>
    </ContentPage>
  );
};

export default ProfileCreate;
```

---

### 6.5 Formulário de edição — `src/Pages/Profiles/ProfileEdit/index.tsx`

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
      current_type: '',
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

  // Pré-preencher form quando o perfil carrega
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
        <ProfileInputs
          formik={formik}
          isEditing
          originalType={profile?.current_type}
        />
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

## 7. Roteamento — `src/Router/router.tsx`

Adicionar as novas rotas seguindo o padrão existente:

```typescript
import ProfileList from '../Pages/Profiles/ProfileList';
import ProfileView from '../Pages/Profiles/ProfileView';
import ProfileCreate from '../Pages/Profiles/ProfileCreate';
import ProfileEdit from '../Pages/Profiles/ProfileEdit';

// Dentro do Switch/Routes:
<Route element={<PrivateRoute Component={<ProfileList />} />}  path="/perfis" />
<Route element={<PrivateRoute Component={<ProfileCreate />} />} path="/perfis/criar" />
<Route element={<PrivateRoute Component={<ProfileView />} />}  path="/perfis/:id" />
<Route element={<PrivateRoute Component={<ProfileEdit />} />}  path="/perfis/:id/editar" />
```

> **Ordem importante:** `/perfis/criar` deve vir **antes** de `/perfis/:id` para que
> o React Router não interprete "criar" como um ID.

---

## 8. Menu — Link de navegação

Adicionar item no menu lateral seguindo o padrão dos itens existentes
(buscar o componente de menu no projeto — geralmente em `src/Components/Layout/Menu/`):

```typescript
{
  label: 'Perfis',
  icon: 'pi pi-id-card',
  to: '/perfis',
  // Visível para: ADMIN e COORDINATOR
}
```

---

## 9. Constantes a adicionar em `src/Controller/controllerGlobal.tsx`

```typescript
// Adicionar ao arquivo existente:

export const PROFILE_TYPE = {
  COORDINATOR: 'COORDINATOR',
  REAPPLICATOR: 'REAPPLICATOR',
} as const;

export type ProfileType = keyof typeof PROFILE_TYPE;

export const profileTypeLabel: Record<string, string> = {
  COORDINATOR: 'Coordenador',
  REAPPLICATOR: 'Reaplicador',
};
```

---

## 10. API — Contrato Completo

### `GET /profile`

**Query params:**
| Param | Tipo | Obrigatório | Notas |
|---|---|---|---|
| `page` | number | sim | padrão: 1 |
| `perPage` | number | sim | padrão: 10 |
| `name` | string | não | busca parcial |
| `current_type` | `COORDINATOR \| REAPPLICATOR` | não | filtro por tipo |
| `active` | boolean | não | filtro por status |

**Response:**
```typescript
{
  data: Profile[],
  total: number,
  page: number,
  perPage: number
}
```

---

### `GET /profile/:id`

**Response:** `Profile` (com `user`, `profile_social_technology`, `profile_type_log`)

---

### `GET /profile/:id/type-log`

**Response:** `ProfileTypeLogEntry[]` (ordenado por `createdAt DESC`)

```typescript
[
  {
    id: 2,
    profile_fk: 15,
    previous_type: "REAPPLICATOR",
    new_type: "COORDINATOR",
    reason: "Promoção",
    changed_by_fk: 1,
    changed_by: { id: 1, name: "Admin", username: "admin" },
    createdAt: "2026-06-01T14:32:00.000Z"
  },
  {
    id: 1,
    profile_fk: 15,
    previous_type: null,       // null = registro inicial
    new_type: "REAPPLICATOR",
    reason: null,
    changed_by_fk: 1,
    changed_by: { id: 1, name: "Admin", username: "admin" },
    createdAt: "2026-01-15T09:00:00.000Z"
  }
]
```

---

### `POST /profile`

**Body:**
```typescript
{
  name: string;             // obrigatório
  current_type: "COORDINATOR" | "REAPPLICATOR";  // obrigatório
  phone?: string;
  email?: string;
  color_race: number;       // obrigatório
  sex: number;              // obrigatório
  birthday: string;         // obrigatório — formato YYYY-MM-DD
  initial_date?: string;    // formato YYYY-MM-DD
  active?: boolean;         // default: true
  user_fk?: number;         // opcional — vincular a usuário existente
}
```

**Response:** `Profile` criado

---

### `POST /user-bff` — Criar perfil + usuário junto

**Body:** (quando quer criar conta de login ao mesmo tempo)
```typescript
{
  name: string;
  username: string;
  password: string;
  role?: "USER";
  current_type: "COORDINATOR" | "REAPPLICATOR";
  project?: number[];       // IDs de social_technology
  email?: string;
  phone?: string;
  sex?: number;
  color_race?: number;
  initial_date?: string;    // formato DD/MM/YYYY (conversão necessária antes de enviar)
  birthday?: string;        // formato DD/MM/YYYY (conversão necessária antes de enviar)
}
```

---

### `PUT /profile/:id`

**Body:** todos os campos opcionais (PartialType do `POST`)

**Campo especial:** `reason` — se enviado junto com mudança de `current_type`, é registrado no log

---

### `DELETE /profile/:id`

**Response:** `{ id: number }`

> O usuário vinculado **não é excluído**. Apenas `profile.user_fk` é setado para `null`.

---

## 11. Checklist de Implementação

- [ ] Criar `src/Context/Profile/type.tsx`
- [ ] Criar `src/Context/Profile/state.tsx`
- [ ] Criar `src/Context/Profile/context.tsx`
- [ ] Criar `src/Services/Profile/request.tsx`
- [ ] Criar `src/Services/Profile/query.tsx`
- [ ] Criar `src/Services/Profile/controller.tsx`
- [ ] Criar `src/Pages/Profiles/ProfileList/index.tsx`
- [ ] Criar `src/Pages/Profiles/ProfileView/index.tsx`
- [ ] Criar `src/Pages/Profiles/ProfileCreate/index.tsx`
- [ ] Criar `src/Pages/Profiles/ProfileEdit/index.tsx`
- [ ] Criar `src/Pages/Profiles/Inputs/index.tsx`
- [ ] Adicionar rotas em `src/Router/router.tsx`
- [ ] Adicionar item no menu lateral
- [ ] Adicionar `PROFILE_TYPE` em `src/Controller/controllerGlobal.tsx`

---

## Referências

- Documentação funcional: `docs/modulo_profile/funcional.md`
- Padrão seguido: `src/Pages/Reapplicators/` e `src/Pages/Users/`
- Contrato completo do backend: `br.ipti.beneficiarios/docs/tecnica-profile.md`
- Task de migração: `br.ipti.beneficiarios/docs/tasks/TASK-12-frontend-migracao-profile.md`
