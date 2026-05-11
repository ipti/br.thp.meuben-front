import {
  getDateFromUnknown,
  getAgeFromBirthDate,
  isUnder18ByBirthDate,
  shouldRequireBeneficiaryPhone,
  shouldRequireResponsiblePhone,
  sanitizeDigits,
} from "./beneficiaryRules";

describe("getDateFromUnknown", () => {
  it("returns null for null", () => {
    expect(getDateFromUnknown(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(getDateFromUnknown(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getDateFromUnknown("")).toBeNull();
  });

  it("parses DD/MM/YYYY format correctly", () => {
    const result = getDateFromUnknown("15/03/1990");
    expect(result).toBeInstanceOf(Date);
    // usar getUTC* porque a data é construída como UTC midnight internamente
    expect(result?.getUTCFullYear()).toBe(1990);
    expect(result?.getUTCMonth()).toBe(2); // março = índice 2
    expect(result?.getUTCDate()).toBe(15);
  });

  it("returns null for invalid date in DD/MM/YYYY format", () => {
    expect(getDateFromUnknown("32/13/1990")).toBeNull();
  });

  it("accepts and returns a valid Date object", () => {
    const date = new Date("1990-03-15");
    expect(getDateFromUnknown(date)).toBe(date);
  });

  it("returns null for an invalid Date object", () => {
    expect(getDateFromUnknown(new Date("invalid"))).toBeNull();
  });

  it("parses ISO date string", () => {
    const result = getDateFromUnknown("1990-03-15");
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(1990);
  });
});

describe("getAgeFromBirthDate", () => {
  it("returns null for null/empty input", () => {
    expect(getAgeFromBirthDate(null)).toBeNull();
    expect(getAgeFromBirthDate("")).toBeNull();
    expect(getAgeFromBirthDate("data-invalida")).toBeNull();
  });

  it("returns a non-negative number for a valid birth date", () => {
    const age = getAgeFromBirthDate("01/01/1990");
    expect(age).not.toBeNull();
    expect(age!).toBeGreaterThanOrEqual(0);
  });

  it("returns age >= 18 for someone born in 1990", () => {
    expect(getAgeFromBirthDate("01/01/1990")!).toBeGreaterThanOrEqual(18);
  });

  it("returns age < 18 for someone born in 2020", () => {
    expect(getAgeFromBirthDate("01/01/2020")!).toBeLessThan(18);
  });
});

describe("isUnder18ByBirthDate", () => {
  it("returns true for a clearly minor (born 2015)", () => {
    expect(isUnder18ByBirthDate("01/01/2015")).toBe(true);
  });

  it("returns false for a clearly adult (born 1990)", () => {
    expect(isUnder18ByBirthDate("01/01/1990")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isUnder18ByBirthDate(null)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isUnder18ByBirthDate("")).toBe(false);
  });

  it("returns false for invalid date string", () => {
    expect(isUnder18ByBirthDate("data-invalida")).toBe(false);
  });
});

describe("shouldRequireBeneficiaryPhone", () => {
  it("returns true (obrigatório) para adultos", () => {
    expect(shouldRequireBeneficiaryPhone("01/01/1990")).toBe(true);
  });

  it("returns false (não obrigatório) para menores de 18", () => {
    expect(shouldRequireBeneficiaryPhone("01/01/2015")).toBe(false);
  });

  it("returns true para entrada inválida (não é menor)", () => {
    expect(shouldRequireBeneficiaryPhone("")).toBe(true);
  });
});

describe("shouldRequireResponsiblePhone", () => {
  it("returns true (obrigatório) para menores de 18", () => {
    expect(shouldRequireResponsiblePhone("01/01/2015")).toBe(true);
  });

  it("returns false (não obrigatório) para adultos", () => {
    expect(shouldRequireResponsiblePhone("01/01/1990")).toBe(false);
  });

  it("returns false para entrada inválida", () => {
    expect(shouldRequireResponsiblePhone("")).toBe(false);
  });
});

describe("sanitizeDigits", () => {
  it("remove pontuação de CPF formatado", () => {
    expect(sanitizeDigits("123.456.789-09")).toBe("12345678909");
  });

  it("remove máscara de telefone", () => {
    expect(sanitizeDigits("(85) 9 9999-9999")).toBe("85999999999");
  });

  it("retorna string vazia para null", () => {
    expect(sanitizeDigits(null)).toBe("");
  });

  it("retorna string vazia para undefined", () => {
    expect(sanitizeDigits(undefined)).toBe("");
  });

  it("retorna string vazia para string sem dígitos", () => {
    expect(sanitizeDigits("abc-def")).toBe("");
  });

  it("retorna os dígitos inalterados se já limpos", () => {
    expect(sanitizeDigits("12345")).toBe("12345");
  });
});
