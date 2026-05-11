import {
  formatarData,
  formatCPF,
  getErrorsAsArray,
} from "./controllerGlobal";

describe("getErrorsAsArray", () => {
  it("retorna array vazio para objeto sem erros", () => {
    expect(getErrorsAsArray({})).toEqual([]);
  });

  it("extrai mensagens de erros simples (campos de nível raiz)", () => {
    const errors = {
      name: "Nome é obrigatório",
      cpf: "CPF inválido",
    };
    const result = getErrorsAsArray(errors);
    expect(result).toContain("Nome é obrigatório");
    expect(result).toContain("CPF inválido");
    expect(result).toHaveLength(2);
  });

  it("achata erros aninhados (objetos dentro de objetos)", () => {
    const errors = {
      responsable: {
        name: "Nome do responsável é obrigatório",
        cpf: "CPF do responsável inválido",
      },
    };
    const result = getErrorsAsArray(errors);
    expect(result).toContain("Nome do responsável é obrigatório");
    expect(result).toContain("CPF do responsável inválido");
    expect(result).toHaveLength(2);
  });

  it("combina erros raiz e erros aninhados", () => {
    const errors = {
      name: "Nome é obrigatório",
      address: {
        street: "Endereço é obrigatório",
        city: "Cidade é obrigatória",
      },
    };
    const result = getErrorsAsArray(errors);
    expect(result).toHaveLength(3);
  });
});

describe("formatarData", () => {
  it("converte ISO date string para DD/MM/YYYY", () => {
    expect(formatarData("2024-03-15T00:00:00.000Z")).toBe("15/03/2024");
  });

  it("converte YYYY-MM-DD para DD/MM/YYYY", () => {
    expect(formatarData("1990-01-25")).toBe("25/01/1990");
  });

  it("retorna '-' para entrada undefined/null", () => {
    expect(formatarData(undefined as any)).toBe("-");
    expect(formatarData(null as any)).toBe("-");
  });
});

describe("formatCPF", () => {
  it("formata CPF de 11 dígitos sem pontuação", () => {
    expect(formatCPF("12345678909")).toBe("123.456.789-09");
  });

  it("formata CPF já com caracteres removendo e reformatando", () => {
    expect(formatCPF("123.456.789-09")).toBe("123.456.789-09");
  });

  it("formata CPF com zeros à esquerda", () => {
    expect(formatCPF("00000000000")).toBe("000.000.000-00");
  });
});
