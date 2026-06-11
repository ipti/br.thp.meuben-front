# TASK-04 — Módulo Profile: Páginas (CRUD)

**Depende de:** TASK-03 (context + services), TASK-01 (hook de permissões)  
**Esforço:** Alto  
**Arquivos novos:** 5  

---

## Contexto

Criar as 5 páginas do módulo de perfis usando a infra criada na TASK-03.
Todas usam `usePermissions` (TASK-01) para controle de acesso.

---

## Checklist

- [ ] Criar `src/Pages/Profiles/Inputs/index.tsx`
- [ ] Criar `src/Pages/Profiles/ProfileList/index.tsx`
- [ ] Criar `src/Pages/Profiles/ProfileView/index.tsx`
- [ ] Criar `src/Pages/Profiles/ProfileCreate/index.tsx`
- [ ] Criar `src/Pages/Profiles/ProfileEdit/index.tsx`

---

## 1. `src/Pages/Profiles/Inputs/index.tsx` — campos compartilhados

Ver código completo em `tecnico.md` — Seção 7.3.

Campos renderizados:
- Nome* (TextInput)
- Tipo* (Dropdown: Coordenador / Reaplicador)
- Motivo da alteração (TextInput — **aparece somente** quando `isEditing && current_type mudou`)
- E-mail (TextInput)
- Telefone (MaskInput `(99) 9 9999-9999`)
- Data de Nascimento* (MaskInput `99/99/9999`)
- Data de Início (MaskInput `99/99/9999`)
- Sexo* (Dropdown — usar `typesex` do controllerGlobal)
- Cor/Raça* (Dropdown — usar `color_race` do controllerGlobal)

**Props do componente:**
```typescript
interface Props {
  formik: FormikProps<any>;
  isEditing?: boolean;        // se true, pode exibir campo de motivo
  originalType?: 'COORDINATOR' | 'REAPPLICATOR'; // tipo antes de editar
}
```

---

## 2. `src/Pages/Profiles/ProfileList/index.tsx` — listagem

Ver código completo em `tecnico.md` — Seção 7.1.

**Controle de acesso:**
```typescript
const { can } = usePermissions();
if (!can('profile.view')) return <AccessDenied />;
```

**Filtros:**
- Busca por nome (TextInput com debounce ou onChange direto)
- Dropdown de tipo (Todos / Coordenador / Reaplicador)
- Botão "Novo Perfil" — visível somente se `can('profile.create')`

**Colunas da DataTable:**
- Nome
- Tipo (Tag: `info` para COORDINATOR, `warning` para REAPPLICATOR)
- E-mail
- Tecnologias Sociais (join de `profile_social_technology[].social_technology.name`)
- Usuário (Tag: "Vinculado" / "—")
- Status (Tag: "Ativo" / "Inativo")
- Ações: Ver (sempre) | Editar (se `can('profile.edit')`) | Excluir (se `can('profile.delete')`)

**Paginação:** usar `Paginator` do PrimeReact.

---

## 3. `src/Pages/Profiles/ProfileView/index.tsx` — detalhe

Ver código completo em `tecnico.md` — Seção 7.2.

**Seções da página:**

**Cabeçalho:**
- Botão Voltar
- Botão Editar (se `can('profile.edit')`)
- Botão Excluir (se `can('profile.delete')`)

**Grid (2 colunas):**

*Coluna esquerda — Dados Pessoais:*
- Tipo (Tag), E-mail, Telefone, Nascimento, Início, Sexo, Cor/Raça, Status

*Coluna direita — Conta de Login:*
- Se tem usuário: nome, username, status, link "Ver usuário →", botão "Desvincular" (se `can('profile.linkUser')`)
- Se não tem usuário: texto "Sem conta de login", botão "Vincular usuário" (se `can('profile.linkUser')`)

**Modal de vínculo (inline):**
- Aparece quando "Vincular usuário" é clicado
- Dropdown com `useFetchUsersWithoutProfile` (filter habilitado)
- Botões Cancelar / Vincular
- Usar `linkUserMutation` do controller

*Coluna direita (embaixo) — Tecnologias Sociais:*
- Lista `profile_social_technology[].social_technology.name`

**Histórico de Tipo (full width, abaixo do grid):**
- Lista de `ProfileTypeLogEntry` com timeline visual (border-left colorida)
- Cada item: data, responsável, tipo anterior → tipo novo, motivo
- `previous_type === null` → exibir "—" (atribuição inicial)
- Usar `useFetchProfileTypeLog`

---

## 4. `src/Pages/Profiles/ProfileCreate/index.tsx` — criação

Ver código completo em `tecnico.md` — Seção 7.4.

**Validação Yup:**
```typescript
const requiredFields = {
  name:         Yup.string().min(3).required('Nome obrigatório'),
  current_type: Yup.string().oneOf(['COORDINATOR','REAPPLICATOR']).required('Tipo obrigatório'),
  birthday:     Yup.string().required('Data de nascimento obrigatória'),
  sex:          Yup.number().required().typeError('Sexo obrigatório'),
  color_race:   Yup.number().required().typeError('Cor/raça obrigatória'),
};
```

**Toggle "Criar conta de login":**
- Oculto se `?user_fk=:id` estiver na query string (criação já com usuário pré-definido)
- Ao ativar: exibe campos username, password, confirmPassword
- Ao ativar: schema Yup adiciona validação nesses campos
- Ao submeter com toggle ativo: chama `createUserWithProfileMutation` (`POST /user-bff`)
- Ao submeter sem toggle: chama `createProfileMutation` (`POST /profile`)

**Conversão de data:**
- Input: `DD/MM/YYYY` (MaskInput)
- Envio para API: `YYYY-MM-DD` (usar `converterData` do controllerGlobal)
- Exceção: `POST /user-bff` espera `DD/MM/YYYY` — **não converter** para esse endpoint

---

## 5. `src/Pages/Profiles/ProfileEdit/index.tsx` — edição

Ver código completo em `tecnico.md` — Seção 7.5.

**Pré-preenchimento:**
```typescript
// Usar enableReinitialize: true no useFormik
// Pré-preencher quando profile carregar via useFetchProfileOne(id)
useEffect(() => {
  if (profile) {
    formik.setValues({
      ...
      // Datas: converter de YYYY-MM-DD para DD/MM/YYYY para exibir no input
      birthday:     formatarData(profile.birthday),
      initial_date: profile.initial_date ? formatarData(profile.initial_date) : '',
    });
  }
}, [profile]);
```

**Campo de motivo:**
- Passado para `ProfileInputs` via props `isEditing` e `originalType`
- Visível somente se `formik.values.current_type !== originalType`
- Enviado ao backend via `data.reason`

**Sem campo de usuário no edit:**
- Vincular/desvincular é feito na tela de detalhe (`ProfileView`)

---

## 6. Validação das páginas

- [ ] `/perfis` carrega lista com paginação funcional
- [ ] Filtro por nome filtra enquanto digita (ou ao submeter)
- [ ] Filtro por tipo filtra por COORDINATOR/REAPPLICATOR/Todos
- [ ] Botões de ação aparecem/ocultam conforme permissões (TASK-01)
- [ ] `/perfis/criar` valida campos obrigatórios antes de submeter
- [ ] Toggle "Criar conta de login" exibe e valida os campos extras
- [ ] Criação com toggle ativo chama `/user-bff`, sem toggle chama `/profile`
- [ ] Após criar, redireciona para `/perfis/:id`
- [ ] `/perfis/:id` exibe todos os dados do perfil
- [ ] Vincular usuário filtra somente usuários sem perfil
- [ ] Ao vincular, seção "Conta de Login" atualiza sem recarregar página
- [ ] Ao desvincular, abre confirmação antes de executar
- [ ] Histórico de tipo exibe em ordem decrescente (mais recente primeiro)
- [ ] `/perfis/:id/editar` pré-preenche form com dados atuais
- [ ] Campo motivo aparece ao alterar o tipo e some ao voltar ao tipo original
- [ ] Após salvar edição, redireciona para `/perfis/:id`
