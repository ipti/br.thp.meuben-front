import { controllerYears } from "./controllerYears";

describe("controllerYears", () => {
  it("disponibiliza o próximo ano em novembro sem alterar o ano atual", () => {
    const result = controllerYears(new Date(2026, 10, 3));

    expect(result.currentYear).toBe(2026);
    expect(result.yearsOptions.at(-1)).toEqual({ value: 2027 });
  });

  it("não disponibiliza o próximo ano antes de novembro", () => {
    const result = controllerYears(new Date(2026, 9, 31));

    expect(result.currentYear).toBe(2026);
    expect(result.yearsOptions.at(-1)).toEqual({ value: 2026 });
  });

  it("passa a considerar 2027 como ano atual em 1º de janeiro", () => {
    const result = controllerYears(new Date(2027, 0, 1));

    expect(result.currentYear).toBe(2027);
    expect(result.yearsOptions.at(-1)).toEqual({ value: 2027 });
  });
});
