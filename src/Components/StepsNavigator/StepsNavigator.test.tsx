import { fireEvent, render, screen } from "@testing-library/react";
import StepsNavigator, { StepItem } from "./index";

const mockSteps: StepItem[] = [
  { key: "step1", label: "Dados Básicos", description: "Informações pessoais." },
  { key: "step2", label: "Endereço", description: "Localização do beneficiário." },
  { key: "step3", label: "Revisão", description: "Confirme os dados." },
];

describe("StepsNavigator — renderização", () => {
  it("renderiza o label de todas as etapas", () => {
    render(
      <StepsNavigator steps={mockSteps} currentStep={0} onStepChange={jest.fn()} />
    );
    expect(screen.getByText("Dados Básicos")).toBeInTheDocument();
    expect(screen.getByText("Endereço")).toBeInTheDocument();
    expect(screen.getByText("Revisão")).toBeInTheDocument();
  });

  it("exibe a descrição da etapa atual", () => {
    render(
      <StepsNavigator steps={mockSteps} currentStep={1} onStepChange={jest.fn()} />
    );
    expect(
      screen.getByText("Localização do beneficiário.")
    ).toBeInTheDocument();
  });

  it("oculta os botões de navegação quando showActions é false", () => {
    render(
      <StepsNavigator
        steps={mockSteps}
        currentStep={0}
        onStepChange={jest.fn()}
        showActions={false}
      />
    );
    expect(screen.queryByText("Etapa anterior")).not.toBeInTheDocument();
    expect(screen.queryByText("Próxima etapa")).not.toBeInTheDocument();
  });
});

describe("StepsNavigator — botão Anterior", () => {
  it("está desabilitado na primeira etapa (step 0)", () => {
    render(
      <StepsNavigator steps={mockSteps} currentStep={0} onStepChange={jest.fn()} />
    );
    const btn = screen.getByText("Etapa anterior").closest("button");
    expect(btn).toBeDisabled();
  });

  it("está habilitado em etapas intermediárias", () => {
    render(
      <StepsNavigator steps={mockSteps} currentStep={1} onStepChange={jest.fn()} />
    );
    const btn = screen.getByText("Etapa anterior").closest("button");
    expect(btn).not.toBeDisabled();
  });

  it("chama onStepChange com step - 1 ao clicar", () => {
    const onStepChange = jest.fn();
    render(
      <StepsNavigator steps={mockSteps} currentStep={2} onStepChange={onStepChange} />
    );
    fireEvent.click(screen.getByText("Etapa anterior"));
    expect(onStepChange).toHaveBeenCalledWith(1);
  });
});

describe("StepsNavigator — botão Próxima", () => {
  it("está habilitado em etapas intermediárias", () => {
    render(
      <StepsNavigator steps={mockSteps} currentStep={0} onStepChange={jest.fn()} />
    );
    const btn = screen.getByText("Próxima etapa").closest("button");
    expect(btn).not.toBeDisabled();
  });

  it("está desabilitado na última etapa", () => {
    render(
      <StepsNavigator steps={mockSteps} currentStep={2} onStepChange={jest.fn()} />
    );
    const btn = screen.getByText("Concluir navegação").closest("button");
    expect(btn).toBeDisabled();
  });

  it("chama onStepChange com step + 1 ao clicar", () => {
    const onStepChange = jest.fn();
    render(
      <StepsNavigator steps={mockSteps} currentStep={0} onStepChange={onStepChange} />
    );
    fireEvent.click(screen.getByText("Próxima etapa"));
    expect(onStepChange).toHaveBeenCalledWith(1);
  });
});

describe("StepsNavigator — clique direto na etapa", () => {
  it("chama onStepChange com o índice correto ao clicar em uma etapa", () => {
    const onStepChange = jest.fn();
    render(
      <StepsNavigator steps={mockSteps} currentStep={0} onStepChange={onStepChange} />
    );
    fireEvent.click(screen.getByText("Endereço"));
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it("chama onStepChange com índice 0 ao clicar na primeira etapa", () => {
    const onStepChange = jest.fn();
    render(
      <StepsNavigator steps={mockSteps} currentStep={2} onStepChange={onStepChange} />
    );
    fireEvent.click(screen.getByText("Dados Básicos"));
    expect(onStepChange).toHaveBeenCalledWith(0);
  });
});
