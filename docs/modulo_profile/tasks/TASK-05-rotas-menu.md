# TASK-05 — Rotas e Menu

**Depende de:** TASK-04 (páginas), TASK-01 (hook de permissões)  
**Esforço:** Baixo  
**Arquivos alterados:** 2  

---

## Checklist

- [ ] Adicionar rotas em `src/Router/router.tsx`
- [ ] Atualizar `src/Components/Menu/index.tsx`

---

## 1. Rotas — `src/Router/router.tsx`

Localizar o bloco de rotas privadas existente e adicionar as 4 rotas do módulo.

**Ordem importa:** `/perfis/criar` deve vir **antes** de `/perfis/:id`
para que "criar" não seja interpretado como um ID pelo React Router.

```typescript
// Adicionar imports:
import ProfileList   from '../Pages/Profiles/ProfileList';
import ProfileCreate from '../Pages/Profiles/ProfileCreate';
import ProfileView   from '../Pages/Profiles/ProfileView';
import ProfileEdit   from '../Pages/Profiles/ProfileEdit';

// Adicionar rotas (na ordem correta, antes de /:id):
<Route element={<PrivateRoute Component={<ProfileList />} />}   path="/perfis" />
<Route element={<PrivateRoute Component={<ProfileCreate />} />} path="/perfis/criar" />
<Route element={<PrivateRoute Component={<ProfileView />} />}   path="/perfis/:id" />
<Route element={<PrivateRoute Component={<ProfileEdit />} />}   path="/perfis/:id/editar" />
```

---

## 2. Menu — `src/Components/Menu/index.tsx`

### 2.1 Substituir item "Reaplicadores" por "Perfis"

Localizar o bloco que renderiza o item "Reaplicadores" (em torno da linha 151) e substituir:

```typescript
// ANTES
{(props.user?.role === ROLE.ADMIN || props.user?.role === ROLE.COORDINATORS) && (
  <Item
    text="Reaplicadores"
    path="/reaplicadores"
    icon={...}
    active={active === '/reaplicadores'}
    funcActiv={setActive}
  />
)}

// DEPOIS — usar o hook de permissões
// Importar no topo do arquivo:
import { usePermissions } from '../../hooks/usePermissions';

// Dentro do componente:
const { can } = usePermissions();

// Item de menu:
{can('menu.profiles') && (
  <Item
    text="Perfis"
    path="/perfis"
    icon={...}          // manter o mesmo ícone ou usar um novo (pi-id-card)
    active={active === '/perfis'}
    funcActiv={setActive}
  />
)}
```

### 2.2 Atualizar item "Usuários"

Localizar o bloco do item "Usuários" (em torno da linha 168) e atualizar:

```typescript
// ANTES
{(props.user?.role === ROLE.ADMIN || props.user?.role === ROLE.COORDINATORS) && (
  <Item text="Usuários" path="/users" ... />
)}

// DEPOIS
{can('menu.users') && (
  <Item text="Usuários" path="/users" ... />
)}
```

### 2.3 Item "Logs" (sem mudança necessária, mas padronizar)

```typescript
// ANTES
{props.user?.role === ROLE.ADMIN && (
  <Item text="Logs" ... />
)}

// DEPOIS — padronizar com o hook (opcional nesta task, obrigatório na TASK-06)
{can('menu.logs') && (
  <Item text="Logs" ... />
)}
```

---

## 3. Validação

- [ ] Acessar `/perfis` → página de listagem carrega
- [ ] Acessar `/perfis/criar` → formulário de criação carrega (não confunde com `:id = "criar"`)
- [ ] Acessar `/perfis/1` → detalhe do perfil carrega
- [ ] Acessar `/perfis/1/editar` → formulário de edição carrega
- [ ] Menu exibe "Perfis" para ADMIN e COORDINATOR, não exibe para REAPPLICATOR
- [ ] Menu exibe "Usuários" para ADMIN e COORDINATOR, não exibe para REAPPLICATOR
- [ ] Menu **não** exibe mais "Reaplicadores" (rota antiga removida daqui)
- [ ] A rota `/reaplicadores` ainda funciona (não remover ainda — só na TASK-11)
