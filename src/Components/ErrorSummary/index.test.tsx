import { render, screen } from "@testing-library/react";
import ErrorSummary from "./index";

describe("ErrorSummary", () => {
  it("não renderiza nada quando o array de erros está vazio", () => {
    const { container } = render(<ErrorSummary errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza a mensagem de cabeçalho quando há erros", () => {
    render(<ErrorSummary errors={["Erro qualquer"]} />);
    expect(
      screen.getByText(/Corrija os seguintes erros antes de continuar/i)
    ).toBeInTheDocument();
  });

  it("renderiza cada mensagem de erro como item de lista", () => {
    render(<ErrorSummary errors={["Nome é obrigatório", "CPF inválido"]} />);
    expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
    expect(screen.getByText("CPF inválido")).toBeInTheDocument();
  });

  it("renderiza o número correto de itens na lista", () => {
    render(<ErrorSummary errors={["Erro 1", "Erro 2", "Erro 3"]} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });

  it("renderiza um único erro corretamente", () => {
    render(<ErrorSummary errors={["Apenas um erro"]} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(screen.getByText("Apenas um erro")).toBeInTheDocument();
  });
});
