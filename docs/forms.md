# Padrão de Implementação de Formulários

> **Projeto:** Meuben — `br.ipti.form`
> **Stack:** React 18 · TypeScript · Formik · Yup · PrimeReact · Styled-Components

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack e Dependências](#2-stack-e-dependências)
3. [Arquitetura de um Formulário](#3-arquitetura-de-um-formulário)
4. [Componentes de Input](#4-componentes-de-input)
5. [Validação com Yup + Formik](#5-validação-com-yup--formik)
6. [Tratamento de Erros](#6-tratamento-de-erros)
7. [Estilos e Design System](#7-estilos-e-design-system)
8. [Formulários Multi-Step](#8-formulários-multi-step)
9. [Diretrizes de UX](#9-diretrizes-de-ux)
10. [Checklist de Entrega](#10-checklist-de-entrega)

---

## 1. Visão Geral

Este documento define os padrões de implementação de formulários no projeto. Toda feature que envolva entrada de dados deve seguir estas diretrizes, garantindo consistência visual, acessibilidade e qualidade de código.

### Princípios-base

| Princípio | O que significa na prática |
|---|---|
| **Feedback imediato** | O usuário sabe o que errou no momento em que erra |
| **Estado claro** | Loading, erro, sucesso — sempre comunicados |
| **Mínimo de atrito** | Só pedir o que é estritamente necessário |
| **Recuperação fácil** | Nunca limpar campos preenchidos após um erro |
| **Consistência** | Mesmo componente, mesma validação, mesmo layout em todo o sistema |

---

## 2. Stack e Dependências

```
Formik   2.4.5   — gerenciamento de estado do formulário
Yup      1.3.3   — schema de validação
PrimeReact 10.0.0 — componentes de input
PrimeFlex 3.3.1  — utilitários de layout CSS
Styled-Components 6.1.8 — estilos customizados
```

### Importações padrão para qualquer formulário

```typescript
import { useFormik } from 'formik'
import * as Yup from 'yup'

// Componentes base
import { Button }      from 'primereact/button'
import { InputText }   from 'primereact/inputtext'
import { Calendar }    from 'primereact/calendar'
import { Dropdown }    from 'primereact/dropdown'
import { InputMask }   from 'primereact/inputmask'
import { InputNumber } from 'primereact/inputnumber'
import { MultiSelect } from 'primereact/multiselect'
import { Checkbox }    from 'primereact/checkbox'
import { RadioButton } from 'primereact/radiobutton'
```

---

## 3. Arquitetura de um Formulário

Um formulário bem estruturado no projeto segue esta separação de responsabilidades:

```
MyForm/
├── index.tsx          ← JSX + Formik (UI layer)
├── schema.ts          ← Yup schema (validation layer)
├── types.ts           ← TypeScript interfaces
├── context.tsx        ← Estado externo, se necessário
└── MyForm.css         ← Estilos específicos, se necessário
```

### Template mínimo

```typescript
// schema.ts
import * as Yup from 'yup'

export const MyFormSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
})

export type MyFormValues = Yup.InferType<typeof MyFormSchema>
```

```typescript
// index.tsx
import { useFormik } from 'formik'
import { MyFormSchema, type MyFormValues } from './schema'

const INITIAL_VALUES: MyFormValues = {
  name: '',
  email: '',
}

export function MyForm() {
  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema: MyFormSchema,
    validateOnBlur: true,
    validateOnChange: false, // valida só no blur para não poluir a UX
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await submit(values)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const fieldError = (field: keyof MyFormValues) =>
    formik.touched[field] && formik.errors[field]
      ? formik.errors[field]
      : undefined

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="name">Nome *</label>
        <InputText
          id="name"
          {...formik.getFieldProps('name')}
          className={fieldError('name') ? 'p-invalid' : ''}
          aria-describedby="name-error"
        />
        {fieldError('name') && (
          <small id="name-error" className="p-error">
            {fieldError('name')}
          </small>
        )}
      </div>

      <Button
        type="submit"
        label="Salvar"
        loading={formik.isSubmitting}
        disabled={formik.isSubmitting || !formik.dirty}
      />
    </form>
  )
}
```

> **Regra:** Nunca colocar a lógica de validação diretamente no `index.tsx`. O schema Yup fica sempre em `schema.ts`.

---

## 4. Componentes de Input

### 4.1 Mapeamento: tipo de dado → componente

| Tipo de dado | Componente | Quando usar |
|---|---|---|
| Texto curto | `TextInput` (`InputText`) | Nome, e-mail, endereço |
| Texto longo | `TextArea` | Descrição, observações |
| CPF / Telefone | `InputMask` | Dados com máscara fixa |
| Número | `InputNumber` | Quantidades, valores monetários |
| Data | `Calendar` | Datas de nascimento, prazos |
| Seleção única | `Dropdown` | Listas com 5+ opções |
| Seleção única (≤4) | `RadioButton` | Gênero, tipo, status |
| Seleção múltipla | `MultiSelect` ou `Checkbox` | Categorias, permissões |
| Booleano | `InputSwitch` ou `Checkbox` | Ativo/inativo, aceitar termos |

### 4.2 Wrappers do projeto

Sempre use os wrappers em `src/Components/` — **nunca** use o componente PrimeReact diretamente na página:

```typescript
// ✅ Correto — usa o wrapper do projeto
import TextInput from 'Components/TextInput'
import Calendar  from 'Components/Calendar'

// ❌ Errado — importação direta sem wrapper
import { InputText } from 'primereact/inputtext'
```

Os wrappers garantem estilos consistentes e podem receber melhorias globais sem alterar cada página.

### 4.3 Props obrigatórias de acessibilidade

Todo input **deve** ter:

```typescript
<InputText
  id="field-id"           // sempre presente
  name="fieldName"        // para o formik.getFieldProps()
  aria-label="Rótulo"     // se não houver <label> visível
  aria-describedby="id-do-erro"  // apontando para o <small> de erro
  aria-invalid={!!fieldError('fieldName')}
/>
```

### 4.4 Campos com máscara (InputMask)

```typescript
// CPF
<InputMask mask="999.999.999-99" placeholder="000.000.000-00" />

// Telefone (fixo ou celular)
<InputMask mask="(99) 9999-9999? 9" placeholder="(00) 00000-0000" />

// Data manual
<InputMask mask="99/99/9999" placeholder="DD/MM/AAAA" />
```

---

## 5. Validação com Yup + Formik

### 5.1 Padrões de validators reutilizáveis

Defina validators reutilizáveis em `src/Utils/validators.ts`:

```typescript
// src/Utils/validators.ts

export const cpfValidator = Yup.string().test(
  'cpf-valido',
  'CPF inválido',
  (value) => !value || value.trim() === '' || validaCPF(value)
)

export const phoneValidator = Yup.string().matches(
  /^\(\d{2}\) \d{4,5}-\d{4}$/,
  'Telefone inválido'
)

export const cepValidator = Yup.string().matches(
  /^\d{5}-\d{3}$/,
  'CEP inválido'
)

export const requiredString = (label: string) =>
  Yup.string().required(`${label} é obrigatório`)

export const requiredDate = (label: string) =>
  Yup.string().nullable().required(`${label} é obrigatória`)
```

### 5.2 Validação condicional

Use `.when()` para campos que dependem de outros:

```typescript
const schema = Yup.object().shape({
  birthday: Yup.string().nullable().required('Data de nascimento é obrigatória'),

  // Responsável só é obrigatório se o beneficiário for menor de 18
  responsible_name: Yup.string().when('birthday', {
    is: (birthday: string) => isUnder18ByBirthDate(birthday),
    then: (schema) => schema.required('Nome do responsável é obrigatório'),
    otherwise: (schema) => schema.optional(),
  }),

  responsible_cpf: Yup.string().when('birthday', {
    is: (birthday: string) => isUnder18ByBirthDate(birthday),
    then: (schema) =>
      schema
        .test('cpf-valido', 'CPF inválido', (value) => !value || validaCPF(value))
        .required('CPF do responsável é obrigatório'),
    otherwise: (schema) => schema.optional(),
  }),
})
```

### 5.3 Validação cross-field

```typescript
// Confirmar senha
const schema = Yup.object().shape({
  password: Yup.string().min(8, 'Mínimo 8 caracteres').required(),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'As senhas não coincidem')
    .required('Confirmação é obrigatória'),
})
```

### 5.4 Configuração de comportamento de validação

```typescript
const formik = useFormik({
  validateOnBlur: true,   // ✅ valida quando o campo perde foco
  validateOnChange: false, // ❌ não validar a cada keystroke (evita ruído)
  validateOnMount: false,  // ❌ não mostrar erros antes de interagir
})
```

> **Exceção:** Use `validateOnChange: true` somente em campos de confirmação de senha, onde feedback instantâneo é esperado.

---

## 6. Tratamento de Erros

### 6.1 Erro individual por campo

```typescript
// Helper reutilizável — declarar dentro do componente
const fieldError = (field: keyof FormValues) =>
  formik.touched[field] && formik.errors[field]
    ? String(formik.errors[field])
    : undefined

// No JSX
<div className="field">
  <label htmlFor="cpf">CPF</label>
  <InputMask
    id="cpf"
    mask="999.999.999-99"
    className={fieldError('cpf') ? 'p-invalid' : ''}
    {...formik.getFieldProps('cpf')}
  />
  {fieldError('cpf') && (
    <small className="p-error flex align-items-center gap-1">
      <i className="pi pi-exclamation-circle" />
      {fieldError('cpf')}
    </small>
  )}
</div>
```

### 6.2 Sumário de erros (formulários longos)

Para formulários com 6+ campos, exiba um sumário no topo ao tentar submeter com erros:

```typescript
import ErrorSummary from 'Components/ErrorSummary'
import { getErrorsAsArray } from 'Utils/formErrors'

// No JSX — visível apenas após primeira tentativa de submit
{formik.submitCount > 0 && Object.keys(formik.errors).length > 0 && (
  <ErrorSummary errors={getErrorsAsArray(formik.errors)} />
)}
```

### 6.3 Erros de API (server-side)

```typescript
onSubmit: async (values, { setErrors, setSubmitting }) => {
  try {
    await api.post('/endpoint', values)
  } catch (err) {
    if (isApiValidationError(err)) {
      // Mapeia erros do servidor para campos do Formik
      setErrors({
        cpf: err.response.data.errors?.cpf,
        email: err.response.data.errors?.email,
      })
    } else {
      // Erro genérico — SweetAlert2
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Tente novamente.' })
    }
  } finally {
    setSubmitting(false)
  }
}
```

---

## 7. Estilos e Design System

### 7.1 Paleta de cores

```javascript
// src/Styles/colors.js — referência obrigatória
primary:   '#B06FF1'   // ação principal, foco
secondary: '#9F5FDE'   // hover de primary
blue:      '#336AE9'   // links, ações secundárias
danger:    '#ED5A68'   // erros, deletar
success:   '#28A138'   // sucesso, confirmação
text:      '#333333'   // texto principal
muted:     '#6C757D'   // placeholder, label inativo
border:    '#DEE2E6'   // borda de inputs
```

### 7.2 Tipografia

```javascript
// src/Styles/typography.js — referência obrigatória
extraSmall: '14px'    // label, mensagem de erro
small:      '16px'    // input, texto corrido
medium:     '20px'    // subtítulo de seção
extraMedium:'24px'    // título de formulário
```

### 7.3 Layout de campo (padrão)

Todo campo segue a estrutura:

```
┌─────────────────────────────────────┐
│  Label *                            │  ← 14px, color: text, margin-bottom: 4px
│ ┌─────────────────────────────────┐ │
│ │  Input                          │ │  ← height: 44px (definido em index.css)
│ └─────────────────────────────────┘ │
│  ⚠ Mensagem de erro                 │  ← 12px, color: danger, margin-top: 4px
└─────────────────────────────────────┘
  margin-bottom: 24px
```

```css
/* Regra global — não alterar (src/index.css) */
.p-inputtext,
.p-inputmask,
.p-dropdown,
.p-calendar .p-inputtext {
  height: 44px;
  border-radius: 6px;
}
```

### 7.4 Grid de formulário

Use o sistema de grid do PrimeFlex:

```tsx
// Duas colunas em desktop, uma em mobile
<div className="grid">
  <div className="col-12 md:col-6">
    {/* Campo 1 */}
  </div>
  <div className="col-12 md:col-6">
    {/* Campo 2 */}
  </div>
</div>

// Três colunas iguais
<div className="grid">
  <div className="col-12 md:col-4"> ... </div>
  <div className="col-12 md:col-4"> ... </div>
  <div className="col-12 md:col-4"> ... </div>
</div>
```

### 7.5 Botões de ação

```tsx
// Posicionamento padrão: alinhado à direita, cancelar à esquerda do confirmar
<div className="flex justify-content-end gap-2 mt-4">
  <Button
    label="Cancelar"
    type="button"
    className="p-button-outlined p-button-secondary"
    onClick={onCancel}
    disabled={formik.isSubmitting}
  />
  <Button
    label="Salvar"
    type="submit"
    icon="pi pi-check"
    loading={formik.isSubmitting}
    disabled={formik.isSubmitting || !formik.dirty}
  />
</div>
```

> **Regra:** O botão de submit **sempre** exibe o estado `loading` durante o envio. Nunca desabilitar sem feedback visual.

### 7.6 Label de campos obrigatórios

```tsx
// Asterisco vermelho para campo obrigatório
<label htmlFor="name">
  Nome <span style={{ color: colors.danger }}>*</span>
</label>
```

---

## 8. Formulários Multi-Step

### 8.1 Quando usar

Use o `StepsNavigator` quando o formulário tiver mais de 5 campos **ou** quando os campos puderem ser agrupados logicamente em etapas distintas.

### 8.2 Definição de steps

```typescript
// types.ts
import type { StepItem } from 'Components/StepsNavigator'

export const FORM_STEPS: StepItem[] = [
  {
    key: 'personal',
    label: 'Dados Pessoais',
    description: 'Nome, CPF e data de nascimento',
  },
  {
    key: 'contact',
    label: 'Contato',
    description: 'E-mail e telefone',
  },
  {
    key: 'address',
    label: 'Endereço',
    description: 'CEP, logradouro e número',
  },
  {
    key: 'review',
    label: 'Revisão',
    description: 'Confirme os dados antes de enviar',
  },
]
```

### 8.3 Padrão de implementação

```typescript
// index.tsx
import StepsNavigator from 'Components/StepsNavigator'
import { FORM_STEPS } from './types'

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0)

  const handleStepChange = async (nextStep: number) => {
    // Valida apenas os campos do step atual antes de avançar
    const stepFields = getFieldsForStep(currentStep)
    const errors = await formik.validateForm()
    const stepErrors = stepFields.some((field) => errors[field])

    if (stepErrors) {
      // Marca os campos do step atual como touched para exibir erros
      const touched = stepFields.reduce((acc, f) => ({ ...acc, [f]: true }), {})
      formik.setTouched(touched)
      return
    }

    setCurrentStep(nextStep)
  }

  return (
    <div>
      <StepsNavigator
        steps={FORM_STEPS}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        showActions
        nextLabel="Próximo"
        previousLabel="Anterior"
        finishLabel="Enviar"
      />

      <form onSubmit={formik.handleSubmit}>
        {currentStep === 0 && <StepPersonal formik={formik} />}
        {currentStep === 1 && <StepContact formik={formik} />}
        {currentStep === 2 && <StepAddress formik={formik} />}
        {currentStep === 3 && <StepReview values={formik.values} />}
      </form>
    </div>
  )
}
```

### 8.4 Regras de navegação entre steps

| Ação | Comportamento |
|---|---|
| **Avançar** | Valida campos do step atual. Bloqueia se houver erros. |
| **Voltar** | Livre — nunca bloquear retorno |
| **Clicar no step** | Permite ir a qualquer step já visitado (`step-done`) |
| **Step futuro** | Bloqueado até o anterior ser validado |
| **Último step** | Exibe botão "Enviar" no lugar de "Próximo" |

### 8.5 Persistência de dados entre steps

```typescript
// Nunca reinicializar o formik ao mudar de step
// Os values do formik persistem enquanto o componente pai estiver montado

// Para rascunho (opcional), use sessionStorage
useEffect(() => {
  const draft = sessionStorage.getItem('form-draft')
  if (draft) formik.setValues(JSON.parse(draft))
}, [])

useEffect(() => {
  sessionStorage.setItem('form-draft', JSON.stringify(formik.values))
}, [formik.values])
```

---

## 9. Diretrizes de UX

### 9.1 Ordem dos campos

Siga a ordem cognitiva natural do usuário:

```
1. Identificação      → Nome, CPF, data de nascimento
2. Contato            → E-mail, telefone
3. Localização        → Endereço
4. Dados secundários  → Informações complementares
5. Revisão e confirmação
```

### 9.2 Placeholder vs Label

| Situação | Usar |
|---|---|
| Sempre | `<label>` visível e descritiva |
| Formato esperado | Placeholder (`Ex: 000.000.000-00`) |
| Nunca usar placeholder como substituto da label | — |

### 9.3 Campos opcionais

Marque campos **opcionais** explicitamente, não os obrigatórios (menos poluição visual quando a maioria é obrigatória):

```tsx
// Se a maioria dos campos é obrigatória
<label htmlFor="complement">Complemento <span className="text-muted">(opcional)</span></label>

// Se a maioria dos campos é opcional → marque os obrigatórios com *
<label htmlFor="name">Nome <span style={{ color: colors.danger }}>*</span></label>
```

### 9.4 Loading e estados de submit

```
Idle      → Botão "Salvar" habilitado
Loading   → Botão com spinner + label "Salvando..." + form desabilitado
Sucesso   → SweetAlert2 success → redirect ou reset de form
Erro API  → SweetAlert2 error + erros mapeados nos campos
```

```typescript
// Nunca submitar duas vezes — desabilitar form durante loading
<fieldset disabled={formik.isSubmitting} style={{ border: 'none', padding: 0 }}>
  {/* Todos os campos aqui */}
</fieldset>
```

### 9.5 Mensagens de erro úteis

| ❌ Vago | ✅ Específico e acionável |
|---|---|
| "Campo inválido" | "CPF inválido — verifique os dígitos" |
| "Obrigatório" | "Nome completo é obrigatório" |
| "Erro" | "E-mail já cadastrado. Use outro ou faça login." |
| "Formato incorreto" | "Telefone deve estar no formato (00) 00000-0000" |

### 9.6 Autocompletar e acessibilidade

```tsx
// Atributos de autocompletar do browser
<InputText autoComplete="given-name"   id="first_name" />
<InputText autoComplete="family-name"  id="last_name" />
<InputText autoComplete="email"        id="email" type="email" />
<InputText autoComplete="tel"          id="phone" />
<InputText autoComplete="postal-code"  id="cep" />
<InputText autoComplete="street-address" id="address" />
```

### 9.7 Feedback de progresso (multi-step)

- Exibir sempre: `Passo X de N`
- Exibir barra de progresso com percentual
- Indicar visualmente steps concluídos, atual e futuros
- Não ocultar steps futuros — dar ao usuário visão do todo

---

## 10. Checklist de Entrega

Antes de abrir PR com um formulário novo ou alterado, valide cada item:

### Código

- [ ] Schema Yup em arquivo separado (`schema.ts`)
- [ ] Tipos TypeScript deduzidos do schema (`Yup.InferType<typeof Schema>`)
- [ ] `validateOnBlur: true` e `validateOnChange: false`
- [ ] `loading` prop no botão de submit durante `formik.isSubmitting`
- [ ] Formulário desabilitado (`fieldset disabled`) durante submit
- [ ] Erros de API mapeados via `setErrors()` ou `setFieldError()`
- [ ] `formik.dirty` usado para desabilitar submit sem alterações

### Componentes

- [ ] Wrappers de `src/Components/` usados (não PrimeReact direto)
- [ ] Todo input com `id`, `name` e `aria-describedby`
- [ ] Label visível para todo campo (`htmlFor` apontando para o `id`)
- [ ] Campos obrigatórios marcados com `*`
- [ ] Campos opcionais marcados com `(opcional)`

### Validação

- [ ] Todos os campos obrigatórios validados no schema
- [ ] CPF validado com `validaCPF()` via `.test()`
- [ ] Telefone com formato validado via `.matches()`
- [ ] Datas validadas como não-nulas e com formato correto
- [ ] Validações condicionais usando `.when()` quando necessário

### UX e Estilo

- [ ] Erros exibidos por campo (abaixo do input, com `p-error`)
- [ ] Sumário de erros para formulários com 6+ campos
- [ ] Ordem dos campos segue fluxo cognitivo natural
- [ ] Formulário responsivo (grid col-12 md:col-6)
- [ ] Botões alinhados à direita com espaçamento `gap-2`
- [ ] Feedback de sucesso com SweetAlert2 (`icon: 'success'`)
- [ ] Feedback de erro com SweetAlert2 (`icon: 'error'`)
- [ ] Autocompletar (`autoComplete`) configurado nos campos relevantes

### Multi-Step (se aplicável)

- [ ] Steps definidos em `types.ts` com `key`, `label` e `description`
- [ ] Avanço bloqueado se o step atual tem erros
- [ ] Retorno livre (nunca bloquear)
- [ ] Steps concluídos marcados como `step-done`
- [ ] Último step com botão "Enviar" em vez de "Próximo"

---

*Dúvidas ou sugestões de melhoria neste documento? Abra uma issue ou PR na pasta `docs/`.*
