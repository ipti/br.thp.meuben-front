# TASK-11 — Limpeza Final

**Depende de:** TASK-01 a TASK-10 (todas validadas em homologação)  
**Esforço:** Médio  

---

## ⚠️ ATENÇÃO

**Executar esta task somente quando:**
1. Todas as tasks de 01 a 10 estiverem concluídas
2. O ambiente de homologação estiver validado por pelo menos 1 ciclo de uso real
3. O backend TASK-11 (remoção da estrutura antiga) já tiver sido executado em produção
4. Nenhuma chamada aos endpoints antigos (`/reapplicators`, `role=COORDINATORS`) aparecer nos logs

---

## Checklist

- [ ] Remover `src/Pages/Reapplicators/` (toda a pasta)
- [ ] Remover `src/Context/Reapplicators/` (toda a pasta)
- [ ] Remover `src/Services/Reapplicators/` (toda a pasta)
- [ ] Remover `src/Pages/Coordinators/` (pasta vazia)
- [ ] Remover `ROLE.REAPPLICATORS` e `ROLE.COORDINATORS` de `src/Controller/controllerGlobal.tsx`
- [ ] Remover rotas antigas (`/reaplicadores`) de `src/Router/router.tsx`
- [ ] Verificar e remover importações órfãs

---

## 1. Remover módulo de reaplicadores

```bash
# Verificar antes de remover: nenhum arquivo importa de Reapplicators
grep -r "Reapplicators\|reapplicators" src/ --include="*.tsx" --include="*.ts" -l

# Se a lista mostrar SOMENTE os arquivos dentro de src/Pages/Reapplicators/,
# src/Context/Reapplicators/ e src/Services/Reapplicators/, é seguro remover.
# Se aparecer qualquer outro arquivo, resolver as referências antes.
```

Pastas a remover:
- `src/Pages/Reapplicators/`
- `src/Context/Reapplicators/`
- `src/Services/Reapplicators/`
- `src/Pages/Coordinators/` (estava vazia — confirmar)

---

## 2. Remover ROLE.REAPPLICATORS e ROLE.COORDINATORS

**Arquivo:** `src/Controller/controllerGlobal.tsx`

```typescript
// ANTES (temporariamente mantido desde a TASK-01)
export const ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
  REAPPLICATORS: "REAPPLICATORS",   // ← remover
  COORDINATORS: "COORDINATORS",     // ← remover
} as const;

// DEPOIS
export const ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type Role = typeof ROLE[keyof typeof ROLE];
```

**Verificar** que nenhum arquivo ainda usa `ROLE.REAPPLICATORS` ou `ROLE.COORDINATORS`:

```bash
grep -r "ROLE\.REAPPLICATORS\|ROLE\.COORDINATORS\|'REAPPLICATORS'\|'COORDINATORS'" src/ \
  --include="*.tsx" --include="*.ts"
```

Se o grep retornar resultados, resolver cada ocorrência antes de remover do enum.

---

## 3. Remover rota antiga

**Arquivo:** `src/Router/router.tsx`

```typescript
// Localizar e remover:
import ReapplicatorsList from '../Pages/Reapplicators/ReapplicatorsList';
import ReapplicatorsView from '../Pages/Reapplicators/ReapplicatorView';

// E as rotas correspondentes:
<Route element={<PrivateRoute Component={<ReapplicatorsList />} />} path="/reaplicadores" />
<Route element={<PrivateRoute Component={<ReapplicatorsView />} />} path="/reaplicadores/:id" />
```

---

## 4. Verificar importações órfãs

Após remover os módulos, o TypeScript vai apontar erros de importação em qualquer
arquivo que ainda importe de Reapplicators. Resolver cada erro.

```bash
# Compilar para verificar:
npx tsc --noEmit
```

---

## 5. Verificar uso de `user_social_technology` e `meeting_user`

```bash
# Não deve existir nenhuma ocorrência:
grep -r "user_social_technology\|meeting_user\|reapplicators\[0\]\|coordinators\[0\]" \
  src/ --include="*.tsx" --include="*.ts"
```

Se aparecer qualquer resultado, corrigir antes de considerar a limpeza concluída.

---

## 6. Validação final pós-limpeza

- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm start` sem erros de console
- [ ] Login funciona para todos os tipos de usuário (ADMIN, COORDINATOR, REAPPLICATOR)
- [ ] Menu não exibe mais "Reaplicadores"
- [ ] `/reaplicadores` retorna 404 ou redireciona para `/perfis`
- [ ] `/perfis` funciona com CRUD completo
- [ ] Reuniões carregam e atualizam participantes corretamente
- [ ] PDFs de reunião e turma exibem nomes corretamente
- [ ] EditUser não tem mais referências a `reapplicators` ou `coordinators`
- [ ] `grep -r "REAPPLICATORS\|COORDINATORS" src/` retorna zero resultados (exceto comentários históricos)
