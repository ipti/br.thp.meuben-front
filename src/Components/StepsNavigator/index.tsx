import { Button } from "primereact/button";

export type StepItem = {
  key: string;
  label: string;
  description?: string;
};

type StepsNavigatorProps = {
  steps: StepItem[];
  currentStep: number;
  onStepChange: (index: number) => void;
  showActions?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
};

const StepsNavigator = ({
  steps,
  currentStep,
  onStepChange,
  showActions = true,
  previousLabel = "Etapa anterior",
  nextLabel = "Próxima etapa",
  finishLabel = "Concluir navegação",
}: StepsNavigatorProps) => {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onStepChange(index)}
              style={{
                border: "1px solid",
                borderColor: isActive || isDone ? "#6366f1" : "#d1d5db",
                backgroundColor: isActive ? "#eef2ff" : "#fff",
                borderRadius: "10px",
                padding: "12px 10px",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                Etapa {index + 1}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: isActive || isDone ? "#3730a3" : "#334155",
                  fontWeight: isActive ? 700 : 600,
                }}
              >
                {step.label}
              </div>
            </button>
          );
        })}
      </div>

      {steps[currentStep]?.description ? (
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "12px 14px",
            marginBottom: "16px",
            color: "#334155",
            fontSize: "13px",
          }}
        >
          <strong>{steps[currentStep]?.label}:</strong> {steps[currentStep]?.description}
        </div>
      ) : null}

      {showActions ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
          <Button
            type="button"
            label={previousLabel}
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            disabled={currentStep === 0}
            onClick={() => onStepChange(Math.max(currentStep - 1, 0))}
            style={{ width: "100%" }}
          />
          <Button
            type="button"
            label={currentStep === steps.length - 1 ? finishLabel : nextLabel}
            icon="pi pi-arrow-right"
            iconPos="right"
            disabled={currentStep === steps.length - 1}
            onClick={() => onStepChange(Math.min(currentStep + 1, steps.length - 1))}
            style={{ width: "100%" }}
          />
        </div>
      ) : null}
    </>
  );
};

export default StepsNavigator;
