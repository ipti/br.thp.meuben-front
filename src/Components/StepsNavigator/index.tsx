import { Button } from "primereact/button";
import "./StepsNavigator.css";

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
  onlyActions?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
};

const StepsNavigator = ({
  steps,
  currentStep,
  onStepChange,
  showActions = true,
  onlyActions = false,
  previousLabel = "Etapa anterior",
  nextLabel = "Próxima etapa",
  finishLabel = "Concluir navegação",
}: StepsNavigatorProps) => {
  const progressPercent =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 100;

  const isLast = currentStep === steps.length - 1;

  return (
    <div className="steps-navigator">
      {!onlyActions && (
        <>
          <div className="steps-progress-bar">
            <div
              className="steps-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isDone = index < currentStep;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => onStepChange(index)}
                  className={[
                    "step-button",
                    isActive ? "step-active" : "",
                    isDone ? "step-done" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="step-header">
                    <span className="step-number">Etapa {index + 1}</span>
                    {isDone && (
                      <i className="pi pi-check-circle step-check-icon" />
                    )}
                  </div>
                  <div className="step-title">{step.label}</div>
                </button>
              );
            })}
          </div>

          {steps[currentStep]?.description && (
            <div className="step-description">
              <i className="pi pi-info-circle step-description-icon" />
              <span>
                <strong>{steps[currentStep].label}:</strong>{" "}
                {steps[currentStep].description}
              </span>
            </div>
          )}
        </>
      )}

      {showActions && (
        <div className="steps-actions">
          <Button
            type="button"
            label={previousLabel}
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            disabled={currentStep === 0}
            onClick={() => onStepChange(Math.max(currentStep - 1, 0))}
          />
          <Button
            type="button"
            label={isLast ? finishLabel : nextLabel}
            icon={isLast ? "pi pi-check" : "pi pi-arrow-right"}
            iconPos="right"
            disabled={isLast}
            onClick={() =>
              onStepChange(Math.min(currentStep + 1, steps.length - 1))
            }
          />
        </div>
      )}
    </div>
  );
};

export default StepsNavigator;
