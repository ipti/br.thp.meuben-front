import { PROFILE_TYPE, ProfileType } from "../Controller/controllerGlobal";

export function isSocialProfile(type: ProfileType | ""): boolean {
  return type === PROFILE_TYPE.REAPPLICATOR;
}

export function getProfileTypeOptions(includeReapplicator = true) {
  const all = [
    { id: PROFILE_TYPE.COORDINATOR,          name: "Coordenação" },
    { id: PROFILE_TYPE.COORDINATION_SUPPORT, name: "Apoio à Coordenação" },
    { id: PROFILE_TYPE.REAPPLICATOR,         name: "Reaplicador" },
    { id: PROFILE_TYPE.COMMUNICATION,        name: "Comunicação" },
    { id: PROFILE_TYPE.ACCOUNTABILITY,       name: "Prestação de Contas" },
    { id: PROFILE_TYPE.OTHER,                name: "Outro" },
  ];
  return includeReapplicator
    ? all
    : all.filter((o) => o.id !== PROFILE_TYPE.REAPPLICATOR);
}
