import { formatCalendarDate } from "./date";

describe("formatCalendarDate", () => {
  it("preserva o dia de uma data de nascimento sem conversão de fuso", () => {
    expect(formatCalendarDate("2000-11-20")).toBe("20/11/2000");
    expect(formatCalendarDate("2000-11-20T00:00:00.000Z")).toBe("20/11/2000");
  });

  it("trata valor ausente e mantém valor não reconhecido", () => {
    expect(formatCalendarDate()).toBe("—");
    expect(formatCalendarDate("data inválida")).toBe("data inválida");
  });
});
