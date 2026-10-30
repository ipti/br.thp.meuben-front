import {
  isClassroomRegistrationReportEligible,
  isReportTermEligible,
} from "./reportTermEligibility";

describe("report term eligibility", () => {
  it("accepts an active adhesion term", () => {
    expect(isReportTermEligible(true, "ACTIVE_TERM", false)).toBe(true);
  });

  it("accepts a valid UNSPECIFIED term", () => {
    expect(isReportTermEligible(true, "INACTIVE_TERM", true)).toBe(true);
  });

  it("keeps the term exception for legacy projects", () => {
    expect(isReportTermEligible(false, null, false)).toBe(true);
  });

  it("still requires an approved classroom registration", () => {
    expect(
      isClassroomRegistrationReportEligible(
        "PENDING",
        true,
        "ACTIVE_TERM",
        true
      )
    ).toBe(false);
  });
});
