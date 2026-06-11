# Tasks — Migração para o Módulo de Perfis
## `br.ipti.form`

---

## Ordem de execução obrigatória

```
TASK-01 (hook de permissões)
    └── TASK-02 (tipos + auth context)
            ├── TASK-03 (profile: context + services)
            │       └── TASK-04 (profile: páginas CRUD)
            │               └── TASK-05 (rotas + menu)
            ├── TASK-06 (substituição de permissões — usa hook da TASK-01)
            ├── TASK-07 (relacionamentos de reunião)
            ├── TASK-08 (login: projeto padrão)
            ├── TASK-09 (EditUser: dados do perfil)
            └── TASK-10 (CreateUser + ListUsers: simplificação)
                    └── TASK-11 (limpeza final — só após todas validadas)
```

> **Regra:** nunca executar TASK-11 antes de todas as tasks de 01 a 10 estarem
> concluídas e validadas em homologação.

---

## Índice

| Task | Título | Depende de | Esforço |
|---|---|---|---|
| [TASK-01](TASK-01-hook-permissoes.md) | Hook centralizado de permissões | — | Baixo |
| [TASK-02](TASK-02-tipos-auth-context.md) | Tipos, constants e AplicationContext | TASK-01 | Médio |
| [TASK-03](TASK-03-profile-context-services.md) | Módulo Profile — Context + Services | TASK-02 | Médio |
| [TASK-04](TASK-04-profile-paginas.md) | Módulo Profile — Páginas (CRUD) | TASK-03 | Alto |
| [TASK-05](TASK-05-rotas-menu.md) | Rotas + Menu (usa hook) | TASK-04, TASK-01 | Baixo |
| [TASK-06](TASK-06-permissoes-componentes.md) | Substituir verificações de permissão | TASK-01, TASK-02 | Médio |
| [TASK-07](TASK-07-relacionamentos-reuniao.md) | Relacionamentos de reunião (meeting_user → meeting_profile) | TASK-02 | Alto |
| [TASK-08](TASK-08-login-social-technology.md) | Login: projeto padrão via profile | TASK-02 | Baixo |
| [TASK-09](TASK-09-edituser-dados-perfil.md) | EditUser: dados do perfil | TASK-02 | Médio |
| [TASK-10](TASK-10-createuser-listusers.md) | CreateUser + ListUsers: simplificação | TASK-02 | Médio |
| [TASK-11](TASK-11-limpeza-final.md) | Limpeza final | TASK-01 a 10 | Médio |

---

## Contexto

Ver documentação completa em:
- `../funcional.md` — fluxos, permissões e relacionamentos por tela
- `../tecnico.md` — código completo de cada peça + auditoria (seção 15)
