import type { AccessRequestType } from "./types";

export const ACCESS_REQUEST_TYPE_LABELS: Record<AccessRequestType, string> = {
  MICROSOFT_LINK: "Vinculação de conta Microsoft",
  PASSWORD_RESET: "Redefinição de senha",
  ACCOUNT_RECOVERY: "Recuperação de conta",
  NEW_ACCESS: "Novo acesso",
};

export function accessRequestTypeLabel(type?: string | null): string {
  if (!type) return "—";

  return ACCESS_REQUEST_TYPE_LABELS[type as AccessRequestType] ?? type;
}

export const ACCESS_REQUEST_MATCH_SIGNAL_LABELS: Record<string, string> = {
  EMAIL_EXACT: "Mesmo e-mail institucional",
  USERNAME_EXACT: "Mesmo nome de usuário",
  NAME_PHONE_EXACT: "Mesmo nome e telefone",
  NAME_BIRTHDAY_EXACT: "Mesmo nome e data de nascimento",
  NAME_TYPE_TECHNOLOGY: "Mesmo nome, perfil e tecnologia",
  NAME_SIMILAR: "Nome semelhante",
};

export const ACCESS_REQUEST_CONFLICT_LABELS: Record<string, string> = {
  PROFILE_INACTIVE: "Perfil vinculado inativo",
  PROFILE_ALREADY_HAS_USER: "Perfil já possui usuário",
  MULTIPLE_STRONG_USER_CANDIDATES: "Vários usuários com forte correspondência",
  MULTIPLE_STRONG_PROFILE_CANDIDATES: "Vários perfis com forte correspondência",
  PROFILE_CANDIDATE_ALREADY_HAS_USER: "Perfil encontrado já possui usuário",
};

export const ACCESS_REQUEST_CONFLICT_MESSAGES: Record<string, string> = {
  PROFILE_INACTIVE: "O perfil vinculado a este usuário está inativo.",
  PROFILE_ALREADY_HAS_USER: "Este perfil já possui um usuário vinculado.",
  MULTIPLE_STRONG_USER_CANDIDATES:
    "Foram encontrados vários usuários com dados muito semelhantes. Confirme qual é o cadastro correto.",
  MULTIPLE_STRONG_PROFILE_CANDIDATES:
    "Foram encontrados vários perfis com dados muito semelhantes. Confirme qual é o perfil correto.",
  PROFILE_CANDIDATE_ALREADY_HAS_USER:
    "Um dos perfis encontrados já possui um usuário vinculado.",
};

export const ACCESS_REQUEST_EVENT_LABELS: Record<string, string> = {
  REQUEST_CREATED: "Solicitação criada",
  REVIEW_STARTED: "Análise iniciada",
  ADMIN_DATA_UPDATED: "Dados atualizados pela administração",
  INFORMATION_REQUESTED: "Informações adicionais solicitadas",
  REQUESTER_RESPONDED: "Solicitante respondeu",
  REQUEST_APPROVED: "Solicitação aprovada",
  REQUEST_REJECTED: "Solicitação recusada",
  ADMIN_CANCELLED: "Solicitação cancelada pela administração",
  REQUEST_CANCELLED: "Solicitação cancelada pelo solicitante",
  REQUEST_COMPLETED: "Solicitação concluída",
  ADMIN_COMPLETED_ACCESS: "Acesso concluído pela administração",
  ADMIN_MARKED_COMPLETED: "Solicitação concluída pela administração",
  ACTIVATION_EXPIRED: "Prazo de ativação expirado",
  REQUEST_EXPIRED: "Solicitação expirada",
};

export const ACCESS_REQUEST_FIELD_LABELS: Record<string, string> = {
  fullName: "Nome completo",
  full_name: "Nome completo",
  usernameHint: "Nome de usuário",
  username_hint: "Nome de usuário",
  institutionalEmail: "E-mail institucional",
  institutional_email: "E-mail institucional",
  phone: "Telefone",
  profileType: "Tipo de perfil",
  profile_type: "Tipo de perfil",
  birthday: "Data de nascimento",
  sex: "Sexo",
  colorRace: "Cor/Raça",
  color_race: "Cor/Raça",
  socialTechnologyIds: "Tecnologias sociais",
  social_technologies: "Tecnologias sociais",
};

export function accessRequestMatchSignalLabel(signal: string): string {
  return ACCESS_REQUEST_MATCH_SIGNAL_LABELS[signal] ?? signal;
}

export function accessRequestConflictLabel(conflict: string): string {
  return ACCESS_REQUEST_CONFLICT_LABELS[conflict] ?? conflict;
}

export function accessRequestConflictMessage(conflict: string): string {
  return ACCESS_REQUEST_CONFLICT_MESSAGES[conflict] ?? accessRequestConflictLabel(conflict);
}

export function accessRequestEventLabel(event: string): string {
  return ACCESS_REQUEST_EVENT_LABELS[event] ?? event;
}

export function accessRequestFieldLabel(field: string): string {
  return ACCESS_REQUEST_FIELD_LABELS[field] ?? field;
}
