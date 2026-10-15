import { PROFILE_TYPE } from "../Controller/controllerGlobal";
import {
  normalizeInstitutionalEmail,
  normalizeUsername,
  requiresInstitutionalEmail,
  requiresPhone,
  requiresSocialDemographics,
} from "./useProfileFieldRules";

describe("profile field rules", () => {
  test.each([
    PROFILE_TYPE.COORDINATOR,
    PROFILE_TYPE.COORDINATION_SUPPORT,
    PROFILE_TYPE.COMMUNICATION,
    PROFILE_TYPE.ACCOUNTABILITY,
  ])("requires institutional email for %s", (type) => {
    expect(requiresInstitutionalEmail(type)).toBe(true);
  });

  test.each([
    PROFILE_TYPE.REAPPLICATOR,
    PROFILE_TYPE.OFICINEIRO,
    PROFILE_TYPE.OTHER,
  ])("keeps institutional email optional for %s", (type) => {
    expect(requiresInstitutionalEmail(type)).toBe(false);
  });

  test.each([PROFILE_TYPE.REAPPLICATOR, PROFILE_TYPE.OFICINEIRO])(
    "requires phone and demographics for %s",
    (type) => {
      expect(requiresPhone(type)).toBe(true);
      expect(requiresSocialDemographics(type)).toBe(true);
    },
  );

  it("requires phone for OTHER only without email", () => {
    expect(requiresPhone(PROFILE_TYPE.OTHER, "")).toBe(true);
    expect(requiresPhone(PROFILE_TYPE.OTHER, "pessoa@instituicao.org")).toBe(false);
  });

  it("normalizes email and username", () => {
    expect(normalizeInstitutionalEmail("  Pessoa@Instituicao.ORG ")).toBe(
      "pessoa@instituicao.org",
    );
    expect(normalizeUsername("  Pessoa.Login ")).toBe("Pessoa.Login");
  });
});
