import { PROFILE_TYPE, ProfileType } from "../Controller/controllerGlobal";

export const PROFILE_TYPES_WITH_REQUIRED_EMAIL: readonly ProfileType[] = [
  PROFILE_TYPE.COORDINATOR,
  PROFILE_TYPE.COORDINATION_SUPPORT,
  PROFILE_TYPE.COMMUNICATION,
  PROFILE_TYPE.ACCOUNTABILITY,
];

export const SOCIAL_PROFILE_TYPES: readonly ProfileType[] = [
  PROFILE_TYPE.REAPPLICATOR,
  PROFILE_TYPE.OFICINEIRO,
];

export function hasFieldValue(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

export function isSocialProfile(type: ProfileType | ""): boolean {
  return !!type && SOCIAL_PROFILE_TYPES.includes(type);
}

export function requiresInstitutionalEmail(type: ProfileType | ""): boolean {
  return !!type && PROFILE_TYPES_WITH_REQUIRED_EMAIL.includes(type);
}

export function requiresSocialDemographics(type: ProfileType | ""): boolean {
  return isSocialProfile(type);
}

export function requiresPhone(
  type: ProfileType | "",
  email?: unknown,
): boolean {
  return (
    requiresSocialDemographics(type) ||
    (type === PROFILE_TYPE.OTHER && !hasFieldValue(email))
  );
}

export function normalizeInstitutionalEmail(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

export function normalizeUsername(value: string): string {
  return value.trim();
}

export function getProfileTypeOptions(includeReapplicator = true) {
  const all = [
    { id: PROFILE_TYPE.COORDINATOR,          name: "Coordenação" },
    { id: PROFILE_TYPE.COORDINATION_SUPPORT, name: "Apoio à Coordenação" },
    { id: PROFILE_TYPE.REAPPLICATOR,         name: "Reaplicador" },
    { id: PROFILE_TYPE.OFICINEIRO,           name: "Oficineiro" },
    { id: PROFILE_TYPE.COMMUNICATION,        name: "Comunicação" },
    { id: PROFILE_TYPE.ACCOUNTABILITY,       name: "Prestação de Contas" },
    { id: PROFILE_TYPE.OTHER,                name: "Outro" },
  ];
  return includeReapplicator
    ? all
    : all.filter((o) => o.id !== PROFILE_TYPE.REAPPLICATOR && o.id !== PROFILE_TYPE.OFICINEIRO);
}
