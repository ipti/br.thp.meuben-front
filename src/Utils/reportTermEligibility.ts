export const isReportTermEligible = (
  requiresActiveTerm: boolean,
  adhesionTermStatus: string | null | undefined,
  hasValidUnspecifiedTerm: boolean | null | undefined
): boolean =>
  !requiresActiveTerm ||
  adhesionTermStatus === "ACTIVE_TERM" ||
  hasValidUnspecifiedTerm === true;

export const isClassroomRegistrationReportEligible = (
  registrationStatus: string | null | undefined,
  requiresActiveTerm: boolean,
  adhesionTermStatus: string | null | undefined,
  hasValidUnspecifiedTerm: boolean | null | undefined
): boolean =>
  registrationStatus === "APPROVED" &&
  isReportTermEligible(
    requiresActiveTerm,
    adhesionTermStatus,
    hasValidUnspecifiedTerm
  );
