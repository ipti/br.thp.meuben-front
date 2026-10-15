import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TagImage from "../../../Assets/images/logo.svg";
import {
  requestCreateAccessRequest,
  requestGetAccessRequestOptions,
  requestGetMicrosoftContext,
  requestLinkMicrosoft,
} from "../../../Services/AccessRequest/request";
import {
  AccessRequestOptions,
  AccessRequestType,
  CreateAccessRequestPayload,
  CreateAccessRequestResponse,
  MicrosoftIdentityContext,
  ProfileType,
} from "../../../Services/AccessRequest/types";
import { idUser, login, logout } from "../../../Services/localstorage";
import {
  createTrackingCode,
  saveAccessRequest,
} from "../../../Services/AccessRequest/storage";
import {
  Actions,
  Alert,
  Card,
  CardHeader,
  CheckList,
  Choice,
  ChoiceGrid,
  Content,
  Field,
  FormGrid,
  Header,
  IdentityBox,
  Page,
  Progress,
  Review,
  Secret,
  Shell,
} from "./styles";

type Situation = "LINK" | "PASSWORD_RESET" | "ACCOUNT_RECOVERY" | "NEW_ACCESS";
type FormStep = 0 | 1 | 2 | 3;

interface FormValues {
  fullName: string;
  usernameHint: string;
  institutionalEmail: string;
  phone: string;
  profileType: ProfileType | "";
  profileTypeUnknown: boolean;
  birthday: string;
  sex: string;
  colorRace: string;
  socialTechnologyIds: number[];
  socialTechnologyUnknown: boolean;
  requesterNote: string;
}

const initialValues: FormValues = {
  fullName: "",
  usernameHint: "",
  institutionalEmail: "",
  phone: "",
  profileType: "",
  profileTypeUnknown: false,
  birthday: "",
  sex: "",
  colorRace: "",
  socialTechnologyIds: [],
  socialTechnologyUnknown: false,
  requesterNote: "",
};

const situationCopy: Record<Situation, { title: string; detail: string }> = {
  LINK: {
    title: "Tenho usuário e senha no MeuBen",
    detail: "Vincular esta conta Microsoft ao meu acesso existente.",
  },
  PASSWORD_RESET: {
    title: "Sei meu usuário, mas esqueci a senha",
    detail: "Pedir ao administrador a recuperação do acesso.",
  },
  ACCOUNT_RECOVERY: {
    title: "Acredito que já tive acesso",
    detail: "Não lembro meu usuário ou minha senha.",
  },
  NEW_ACCESS: {
    title: "Ainda não tenho acesso",
    detail: "Solicitar a criação de um usuário e perfil.",
  },
};

const requestTypeBySituation: Record<Exclude<Situation, "LINK">, AccessRequestType> = {
  PASSWORD_RESET: "PASSWORD_RESET",
  ACCOUNT_RECOVERY: "ACCOUNT_RECOVERY",
  NEW_ACCESS: "NEW_ACCESS",
};

const getErrorMessage = (error: any) => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? "Revise os dados informados.";
  return message || "Não foi possível concluir agora. Tente novamente.";
};

const isEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

const AccessRequestCreate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const contextId = searchParams.get("context")?.trim() || undefined;
  const [options, setOptions] = useState<AccessRequestOptions | null>(null);
  const [identity, setIdentity] = useState<MicrosoftIdentityContext | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [step, setStep] = useState<FormStep>(0);
  const [situation, setSituation] = useState<Situation | "">("");
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<CreateAccessRequestResponse | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [linkCredentials, setLinkCredentials] = useState({ username: "", password: "" });
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const trackingCode = success
    ? createTrackingCode(success.protocol, success.trackingKey)
    : "";

  const loadPage = async () => {
    setLoadingPage(true);
    setPageError(null);
    try {
      const [loadedOptions, loadedIdentity] = await Promise.all([
        requestGetAccessRequestOptions(),
        contextId ? requestGetMicrosoftContext(contextId) : Promise.resolve(null),
      ]);
      setOptions(loadedOptions);
      setIdentity(loadedIdentity);
      if (loadedIdentity) {
        setValues((current) => ({
          ...current,
          fullName: current.fullName || loadedIdentity.displayName || "",
          institutionalEmail: loadedIdentity.email,
        }));
      }
    } catch (error) {
      setPageError(
        contextId
          ? "Sua identificação Microsoft expirou ou não está mais disponível. Entre novamente para continuar."
          : getErrorMessage(error),
      );
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    loadPage();
    // O contexto muda apenas quando a URL muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextId]);

  const selectedProfile = useMemo(
    () => options?.profileTypes.find((item) => item.value === values.profileType),
    [options, values.profileType],
  );

  const setValue = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validateSituation = () => {
    if (!situation) {
      setErrors({ situation: "Selecione a opção que melhor descreve sua situação." });
      return false;
    }
    return true;
  };

  const validateIdentification = () => {
    const next: Record<string, string> = {};
    if (values.fullName.trim().length < 3) next.fullName = "Informe seu nome completo.";
    if (values.usernameHint && values.usernameHint.trim().length < 5) {
      next.usernameHint = "O usuário deve ter pelo menos 5 caracteres.";
    }
    if (values.institutionalEmail && !isEmail(values.institutionalEmail)) {
      next.institutionalEmail = "Informe um e-mail válido.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateProfile = () => {
    const next: Record<string, string> = {};
    if (!values.profileType && !values.profileTypeUnknown) {
      next.profileType = "Selecione um tipo de atuação ou marque que não sabe informar.";
    }
    if (!values.socialTechnologyIds.length && !values.socialTechnologyUnknown) {
      next.socialTechnologyIds = "Selecione uma tecnologia ou marque que não sabe informar.";
    }
    if (selectedProfile?.institutionalEmailRequired && !values.institutionalEmail) {
      next.institutionalEmail = "O e-mail institucional é obrigatório para este perfil.";
    }
    if (
      (selectedProfile?.phoneRequired ||
        (selectedProfile?.phoneRequiredWhenInstitutionalEmailMissing && !values.institutionalEmail)) &&
      !values.phone.trim()
    ) {
      next.phone = "O telefone é obrigatório para este perfil.";
    }
    if (selectedProfile?.birthdayRequired && !values.birthday) {
      next.birthday = "Informe a data de nascimento.";
    }
    if (selectedProfile?.sexRequired && values.sex === "") {
      next.sex = "Informe o gênero.";
    }
    if (selectedProfile?.colorRaceRequired && values.colorRace === "") {
      next.colorRace = "Informe a cor/raça.";
    }
    if (values.profileTypeUnknown && !values.institutionalEmail && !values.phone.trim()) {
      next.phone = "Informe pelo menos um e-mail ou telefone para contato.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (step === 0 && !validateSituation()) return;
    if (step === 1 && !validateIdentification()) return;
    if (step === 2 && !validateProfile()) return;
    setErrors({});
    setStep((current) => Math.min(3, current + 1) as FormStep);
  };

  const handleLink = async (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    const minUsername = options?.username.minLength ?? 5;
    if (linkCredentials.username.trim().length < minUsername) {
      next.username = `Informe seu usuário com pelo menos ${minUsername} caracteres.`;
    }
    if (linkCredentials.password.length < 5) next.password = "Informe sua senha do MeuBen.";
    if (!contextId) next.situation = "Entre novamente com a Microsoft para fazer o vínculo.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const auth = await requestLinkMicrosoft({
        contextId: contextId!,
        username: linkCredentials.username.trim(),
        password: linkCredentials.password,
      });
      setLinkCredentials((current) => ({ ...current, password: "" }));
      logout();
      login(auth.access_token);
      try {
        const payload = JSON.parse(atob(auth.access_token.split(".")[1]));
        if (payload?.sub) idUser(String(payload.sub));
      } catch {
        // O token ainda é tratado pelo fluxo autenticado existente.
      }
      window.location.replace("/");
    } catch {
      setLinkCredentials((current) => ({ ...current, password: "" }));
      setErrors({
        link: "Não foi possível vincular os dados informados. Confira seu acesso ou continue abrindo uma solicitação.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const buildPayload = (): CreateAccessRequestPayload => ({
    type: requestTypeBySituation[situation as Exclude<Situation, "LINK">],
    origin: contextId ? "MICROSOFT" : "LOCAL",
    microsoftContext: contextId,
    fullName: values.fullName.trim(),
    usernameHint: values.usernameHint.trim() || undefined,
    believesExistingAccess: situation === "PASSWORD_RESET" || situation === "ACCOUNT_RECOVERY",
    institutionalEmail: contextId ? undefined : values.institutionalEmail.trim() || undefined,
    phone: values.phone.trim() || undefined,
    profileType: values.profileType || undefined,
    profileTypeUnknown: values.profileTypeUnknown,
    birthday: values.birthday || undefined,
    sex: values.sex === "" ? undefined : Number(values.sex),
    colorRace: values.colorRace === "" ? undefined : Number(values.colorRace),
    socialTechnologyIds: values.socialTechnologyIds.length
      ? values.socialTechnologyIds
      : undefined,
    socialTechnologyUnknown: values.socialTechnologyUnknown,
    requesterNote: values.requesterNote.trim() || undefined,
  });

  const handleSubmit = async () => {
    if (!confirmed) {
      setErrors({ confirmation: "Confirme que as informações são verdadeiras." });
      return;
    }
    if (!validateIdentification() || !validateProfile()) return;
    setSubmitting(true);
    setErrors({});
    try {
      const created = await requestCreateAccessRequest(buildPayload());
      saveAccessRequest(created.protocol, created.trackingKey);
      setSuccess(created);
    } catch (error: any) {
      const fieldErrors = error?.response?.data?.fields;
      setErrors({
        ...(fieldErrors && typeof fieldErrors === "object" ? fieldErrors : {}),
        submit: getErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${label} copiado.`);
    } catch {
      setCopyFeedback("Não foi possível copiar automaticamente. Selecione o texto abaixo.");
    }
  };

  const toggleTechnology = (id: number) => {
    setValue(
      "socialTechnologyIds",
      values.socialTechnologyIds.includes(id)
        ? values.socialTechnologyIds.filter((item) => item !== id)
        : [...values.socialTechnologyIds, id],
    );
  };

  const retryMicrosoftUrl = `${process.env.REACT_APP_API_PATH}auth/microsoft`;

  if (loadingPage) {
    return (
      <Page>
        <Shell>
          <Header><img src={TagImage} alt="MeuBen" /><Link to="/login">← Voltar para o login</Link></Header>
          <Card><Content><p role="status">Validando sua identificação e preparando o formulário...</p></Content></Card>
        </Shell>
      </Page>
    );
  }

  if (pageError || !options) {
    return (
      <Page>
        <Shell>
          <Header><img src={TagImage} alt="MeuBen" /><Link to="/login">← Voltar para o login</Link></Header>
          <Card>
            <CardHeader>
              <span className="eyebrow">Solicitação de acesso</span>
              <h1>Não foi possível abrir o formulário</h1>
              <p>{pageError || "As opções do formulário não estão disponíveis."}</p>
            </CardHeader>
            <Content>
              <Alert $tone="error" role="alert">{pageError}</Alert>
              <Actions>
                <button type="button" onClick={loadPage}>Tentar carregar novamente</button>
                <div className="right">
                  {contextId && <a className="primary" href={retryMicrosoftUrl}>Entrar novamente com Microsoft</a>}
                  {!contextId && <Link className="primary" to="/login">Ir para o login</Link>}
                </div>
              </Actions>
            </Content>
          </Card>
        </Shell>
      </Page>
    );
  }

  if (success) {
    return (
      <Page>
        <Shell>
          <Header><img src={TagImage} alt="MeuBen" /><Link to="/login">← Voltar para o login</Link></Header>
          <Card>
            <CardHeader>
              <span className="eyebrow">Solicitação enviada</span>
              <h1>Recebemos sua solicitação</h1>
              <p>O administrador poderá analisar os dados informados. Nenhum e-mail automático será enviado nesta etapa.</p>
            </CardHeader>
            <Content>
              <Alert $tone="success">Esta solicitação foi salva neste dispositivo. Para consultar em outro aparelho, guarde o código único abaixo.</Alert>
              <Secret>
                <strong>Código de acompanhamento</strong>
                <code>{trackingCode}</code>
              </Secret>
              {copyFeedback && <Alert $tone="info" role="status">{copyFeedback}</Alert>}
              <Actions>
                <button type="button" onClick={() => copyText("Código", trackingCode)}>Copiar código</button>
                <div className="right">
                  <Link className="primary" to="/acompanhar-solicitacao">Acompanhar solicitação</Link>
                </div>
              </Actions>
            </Content>
          </Card>
        </Shell>
      </Page>
    );
  }

  const renderSituation = () => (
    <>
      <h2>Como podemos ajudar?</h2>
      <p className="lead">Escolha a situação mais próxima da sua. Isso ajuda o administrador a tomar a ação correta.</p>
      {identity && (
        <IdentityBox>
          <span className="mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <div>
            <strong>Conta Microsoft confirmada</strong>
            <small>{identity.email}</small>
          </div>
        </IdentityBox>
      )}
      {errors.situation && <Alert $tone="error" role="alert">{errors.situation}</Alert>}
      <ChoiceGrid>
        {(Object.keys(situationCopy) as Situation[])
          .filter((item) => item !== "LINK" || !!contextId)
          .map((item) => (
            <Choice key={item} $selected={situation === item}>
              <input type="radio" name="situation" value={item} checked={situation === item} onChange={() => { setSituation(item); setErrors({}); }} />
              <span><strong>{situationCopy[item].title}</strong><small>{situationCopy[item].detail}</small></span>
            </Choice>
          ))}
      </ChoiceGrid>
      {situation === "LINK" && (
        <form onSubmit={handleLink} style={{ marginTop: 24 }}>
          {errors.link && <Alert $tone="error" role="alert">{errors.link}</Alert>}
          <FormGrid>
            <Field>
              <label htmlFor="link-username">Usuário MeuBen</label>
              <input id="link-username" autoComplete="username" value={linkCredentials.username} onChange={(event) => setLinkCredentials((current) => ({ ...current, username: event.target.value }))} />
              {errors.username && <small className="hint" role="alert">{errors.username}</small>}
            </Field>
            <Field>
              <label htmlFor="link-password">Senha MeuBen</label>
              <input id="link-password" type="password" autoComplete="current-password" value={linkCredentials.password} onChange={(event) => setLinkCredentials((current) => ({ ...current, password: event.target.value }))} />
              {errors.password && <small className="hint" role="alert">{errors.password}</small>}
            </Field>
          </FormGrid>
          <Actions>
            <button type="button" onClick={() => setSituation("ACCOUNT_RECOVERY")}>Não sei meus dados</button>
            <div className="right"><button className="primary" type="submit" disabled={submitting}>{submitting ? "Vinculando..." : "Vincular e entrar"}</button></div>
          </Actions>
        </form>
      )}
    </>
  );

  const renderIdentification = () => (
    <>
      <h2>Seus dados de identificação</h2>
      <p className="lead">Informe dados que ajudem o administrador a localizar ou criar seu cadastro com segurança.</p>
      {errors.submit && <Alert $tone="error" role="alert">{errors.submit}</Alert>}
      <FormGrid>
        <Field className="full">
          <label htmlFor="fullName">Nome completo *</label>
          <input id="fullName" autoComplete="name" value={values.fullName} onChange={(event) => setValue("fullName", event.target.value)} />
          {errors.fullName && <small className="hint" role="alert">{errors.fullName}</small>}
        </Field>
        <Field>
          <label htmlFor="usernameHint">Usuário, se lembrar</label>
          <input id="usernameHint" autoComplete="username" value={values.usernameHint} onChange={(event) => setValue("usernameHint", event.target.value)} />
          {errors.usernameHint && <small className="hint" role="alert">{errors.usernameHint}</small>}
        </Field>
        <Field>
          <label htmlFor="institutionalEmail">E-mail institucional</label>
          <input id="institutionalEmail" type="email" autoComplete="email" disabled={!!identity} value={values.institutionalEmail} onChange={(event) => setValue("institutionalEmail", event.target.value)} />
          {identity && <small className="hint">Confirmado pela Microsoft e não pode ser alterado.</small>}
          {errors.institutionalEmail && <small className="hint" role="alert">{errors.institutionalEmail}</small>}
        </Field>
        <Field>
          <label htmlFor="phone">Telefone</label>
          <input id="phone" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(event) => setValue("phone", event.target.value)} placeholder="(00) 00000-0000" />
          {errors.phone && <small className="hint" role="alert">{errors.phone}</small>}
        </Field>
        <Field className="full">
          <label htmlFor="requesterNote">Observação</label>
          <textarea id="requesterNote" maxLength={2000} value={values.requesterNote} onChange={(event) => setValue("requesterNote", event.target.value)} placeholder="Conte algo que possa ajudar a localizar ou criar seu acesso." />
        </Field>
      </FormGrid>
    </>
  );

  const renderProfile = () => (
    <>
      <h2>Informações do perfil</h2>
      <p className="lead">Os campos mudam conforme sua atuação e seguem as mesmas regras do cadastro atual do MeuBen.</p>
      <FormGrid>
        <Field>
          <label htmlFor="profileType">Tipo de atuação *</label>
          <select id="profileType" disabled={values.profileTypeUnknown} value={values.profileType} onChange={(event) => setValue("profileType", event.target.value as ProfileType)}>
            <option value="">Selecione</option>
            {options.profileTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          {errors.profileType && <small className="hint" role="alert">{errors.profileType}</small>}
        </Field>
        <Field>
          <span className="label">Não sabe o tipo?</span>
          <Choice $selected={values.profileTypeUnknown} style={{ minHeight: 46, padding: 11 }}>
            <input type="checkbox" checked={values.profileTypeUnknown} onChange={(event) => { setValue("profileTypeUnknown", event.target.checked); if (event.target.checked) setValue("profileType", ""); }} />
            <span><strong>Não sei informar</strong></span>
          </Choice>
        </Field>
        {selectedProfile?.birthdayRequired && (
          <Field>
            <label htmlFor="birthday">Data de nascimento *</label>
            <input id="birthday" type="date" value={values.birthday} onChange={(event) => setValue("birthday", event.target.value)} />
            {errors.birthday && <small className="hint" role="alert">{errors.birthday}</small>}
          </Field>
        )}
        {selectedProfile?.sexRequired && (
          <Field>
            <label htmlFor="sex">Gênero *</label>
            <select id="sex" value={values.sex} onChange={(event) => setValue("sex", event.target.value)}>
              <option value="">Selecione</option>
              {options.sexOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            {errors.sex && <small className="hint" role="alert">{errors.sex}</small>}
          </Field>
        )}
        {selectedProfile?.colorRaceRequired && (
          <Field>
            <label htmlFor="colorRace">Cor/raça *</label>
            <select id="colorRace" value={values.colorRace} onChange={(event) => setValue("colorRace", event.target.value)}>
              <option value="">Selecione</option>
              {options.colorRaceOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            {errors.colorRace && <small className="hint" role="alert">{errors.colorRace}</small>}
          </Field>
        )}
        <Field className="full">
          <span className="label">Tecnologias sociais *</span>
          <CheckList>
            {options.socialTechnologies.map((item) => (
              <label key={item.id}>
                <input type="checkbox" disabled={values.socialTechnologyUnknown} checked={values.socialTechnologyIds.includes(item.id)} onChange={() => toggleTechnology(item.id)} />
                <span>{item.name}</span>
              </label>
            ))}
            <label>
              <input type="checkbox" checked={values.socialTechnologyUnknown} onChange={(event) => { setValue("socialTechnologyUnknown", event.target.checked); if (event.target.checked) setValue("socialTechnologyIds", []); }} />
              <span>Não sei informar</span>
            </label>
          </CheckList>
          {errors.socialTechnologyIds && <small className="hint" role="alert">{errors.socialTechnologyIds}</small>}
        </Field>
      </FormGrid>
      {(selectedProfile?.birthdayRequired || selectedProfile?.sexRequired || selectedProfile?.colorRaceRequired) && (
        <Alert $tone="info" style={{ marginTop: 20 }}>Nascimento, gênero e cor/raça são usados para completar o perfil de Reaplicador ou Oficineiro já previsto no MeuBen.</Alert>
      )}
    </>
  );

  const profileLabel = values.profileTypeUnknown
    ? "Não sei informar"
    : options.profileTypes.find((item) => item.value === values.profileType)?.label || "—";
  const technologyLabel = values.socialTechnologyUnknown
    ? "Não sei informar"
    : options.socialTechnologies.filter((item) => values.socialTechnologyIds.includes(item.id)).map((item) => item.name).join(", ") || "—";

  const renderReview = () => (
    <>
      <h2>Revise sua solicitação</h2>
      <p className="lead">A senha será definida somente depois da análise e aprovação. Como ainda não há envio de e-mails, guarde o protocolo e a chave exibidos no final.</p>
      {errors.submit && <Alert $tone="error" role="alert">{errors.submit}</Alert>}
      <Review>
        <article>
          <h3>Solicitação</h3>
          <dl><div><dt>Situação</dt><dd>{situationCopy[situation as Situation]?.title}</dd></div><div><dt>Origem</dt><dd>{identity ? "Conta Microsoft confirmada" : "Acesso local"}</dd></div></dl>
        </article>
        <article>
          <h3>Identificação</h3>
          <dl><div><dt>Nome</dt><dd>{values.fullName}</dd></div><div><dt>Usuário lembrado</dt><dd>{values.usernameHint || "Não informado"}</dd></div><div><dt>E-mail institucional</dt><dd>{values.institutionalEmail || "Não informado"}</dd></div><div><dt>Telefone</dt><dd>{values.phone || "Não informado"}</dd></div></dl>
        </article>
        <article>
          <h3>Perfil</h3>
          <dl><div><dt>Tipo de atuação</dt><dd>{profileLabel}</dd></div><div><dt>Tecnologias sociais</dt><dd>{technologyLabel}</dd></div></dl>
        </article>
      </Review>
      <Choice $selected={confirmed} style={{ minHeight: 60, marginTop: 18 }}>
        <input type="checkbox" checked={confirmed} onChange={(event) => { setConfirmed(event.target.checked); setErrors((current) => ({ ...current, confirmation: "" })); }} />
        <span><strong>Confirmo que as informações são verdadeiras</strong><small>Estou ciente de que o administrador poderá solicitar complementações.</small></span>
      </Choice>
      {errors.confirmation && <Alert $tone="error" role="alert" style={{ marginTop: 14 }}>{errors.confirmation}</Alert>}
    </>
  );

  return (
    <Page>
      <Shell>
        <Header><img src={TagImage} alt="MeuBen" /><Link to="/login">← Voltar para o login</Link></Header>
        <Card>
          <CardHeader>
            <span className="eyebrow">Acesso ao MeuBen</span>
            <h1>Solicitar ou recuperar acesso</h1>
            <p>Conte sua situação para que o administrador possa localizar seu cadastro, recuperar seu acesso ou criar um novo usuário.</p>
          </CardHeader>
          <Progress aria-label="Etapas da solicitação">
            {["Situação", "Identificação", "Perfil", "Revisão"].map((label, index) => (
              <li key={label} className={step === index ? "active" : step > index ? "done" : ""} aria-current={step === index ? "step" : undefined}><span>{step > index ? "✓" : index + 1}</span><strong>{label}</strong></li>
            ))}
          </Progress>
          <Content>
            {step === 0 && renderSituation()}
            {step === 1 && renderIdentification()}
            {step === 2 && renderProfile()}
            {step === 3 && renderReview()}
            {situation !== "LINK" && (
              <Actions>
                {step > 0 ? <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1) as FormStep)}>Voltar</button> : <button type="button" onClick={() => navigate("/login")}>Cancelar</button>}
                <div className="right">
                  {step < 3 ? <button className="primary" type="button" onClick={goNext}>Continuar</button> : <button className="primary" type="button" disabled={submitting} onClick={handleSubmit}>{submitting ? "Enviando..." : "Enviar solicitação"}</button>}
                </div>
              </Actions>
            )}
          </Content>
        </Card>
      </Shell>
    </Page>
  );
};

export default AccessRequestCreate;
