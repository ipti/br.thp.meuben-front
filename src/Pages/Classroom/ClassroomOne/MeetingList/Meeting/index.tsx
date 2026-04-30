import { Message } from "primereact/message";
import { Button } from "primereact/button";
import { useContext, useState } from "react";
import Loading from "../../../../../Components/Loading";
import TextAreaComponent from "../../../../../Components/TextArea";
import Upload from "../../../../../Components/Upload";
import { AplicationContext } from "../../../../../Context/Aplication/context";
import MeetingListRegistrationProvider, {
  MeetingListRegistrationContext,
} from "../../../../../Context/Classroom/Meeting/MeetingListRegistration/context";
import { MeetingListRegisterTypes } from "../../../../../Context/Classroom/Meeting/MeetingListRegistration/type";
import { ROLE, Status } from "../../../../../Controller/controllerGlobal";
import { Column, Container, Padding } from "../../../../../Styles/styles";
import { PropsAplicationContext } from "../../../../../Types/types";
import Beneficiarios from "./Beneficiarios";
import DataMeeting from "./DataMeeting";
import ModalFiles from "./ModalFiles";
import ListArchivesAttendanceList from "./UploadArchivesAttendanceList";
import UserLogs from "../../../../../Components/UserLogs";

const Meeting = () => {
  return (
    <MeetingListRegistrationProvider>
      <MeetingPage />
    </MeetingListRegistrationProvider>
  );
};

const MeetingPage = () => {
  const props = useContext(
    MeetingListRegistrationContext
  ) as MeetingListRegisterTypes;

  const [visible, setVisible] = useState(false)
  const [indexImage, setindexImage] = useState(0)
  const [currentStep, setCurrentStep] = useState(0);

  const propsAplication = useContext(
    AplicationContext
  ) as PropsAplicationContext;

  if (props.isLoading) return <Loading />;

  const steps = [
    { key: "dados", label: "Dados básicos" },
    { key: "arquivos", label: "Arquivos" },
    { key: "presenca", label: "Lista de presença" },
    { key: "logs", label: "Logs" },
  ];

  return (
    <Container>
      {props.meeting ? (
        <>
          <div className="grid">
            <Column id="center" className="col-12 md:col-6">
              <div>
                <Message
                  severity={
                    props.meeting?.status === Status.PENDING
                      ? "warn"
                      : props.meeting?.status === Status.APPROVED
                        ? "success"
                        : props.meeting?.status === Status.REPROVED
                          ? "error"
                          : "info"
                  }
                  text={
                    props.meeting?.status === Status.PENDING
                      ? "Pendente"
                      : props.meeting?.status === Status.APPROVED
                        ? "Aprovado"
                        : props.meeting?.status === Status.REPROVED
                          ? "Pendente de Revisão"
                          : "info"
                  }
                />
              </div>
            </Column>
            {(props.meeting.justification &&
              propsAplication.user?.role === ROLE.REAPPLICATORS) && (
                <div className="col-12 md:col-6">
                  <label>Justificativa</label>
                  <Padding />
                  <TextAreaComponent
                    disabled={true}
                    value={props.meeting?.justification}
                    name="justification"
                    placeholder="Justicativa sobre a escolha do status"
                  />
                </div>
              )}
          </div>

          <Padding padding="8px" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
                  onClick={() => setCurrentStep(index)}
                  style={{
                    border: "1px solid",
                    borderColor: isActive || isDone ? "#6366f1" : "#d1d5db",
                    backgroundColor: isActive ? "#eef2ff" : "#fff",
                    borderRadius: "10px",
                    padding: "12px 10px",
                    cursor: "pointer",
                    textAlign: "left",
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
            <strong>{steps[currentStep]?.label}:</strong>{" "}
            {currentStep === 0 && "atualize as informações principais do encontro."}
            {currentStep === 1 && "anexe, visualize e gerencie os arquivos do encontro."}
            {currentStep === 2 && "controle a presença dos beneficiários e salve faltas."}
            {currentStep === 3 && "acompanhe o histórico de ações deste encontro."}
          </div>

          {currentStep === 0 && <DataMeeting />}

          {currentStep === 1 && (
            <>
              <Padding padding="16px" />
              {!(
                props.meeting.status === Status.APPROVED &&
                propsAplication.user?.role === ROLE.REAPPLICATORS
              ) && (
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Salve os arquivos do encontro</label>
                    <Padding />
                    <Upload />
                  </div>
                </div>
              )}
              <Padding />
              {props.meeting?.meeting_archives?.length > 0 && <label>Arquivos</label>}
              <Padding />
              <div className="grid">
                <div className="col-12 md:col-6">
                  {props.meeting?.meeting_archives?.map((item, index) => {
                    return (
                      <div
                        onClick={() => {
                          setVisible(!visible);
                          setindexImage(index);
                        }}
                      >
                        <ListArchivesAttendanceList item={item} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <ModalFiles
                item={props.meeting?.meeting_archives}
                visible={visible}
                index={indexImage}
                onHide={() => setVisible(!visible)}
              />
            </>
          )}

          {currentStep === 2 && (
            <>
              <Padding padding="16px" />
              <Beneficiarios />
            </>
          )}

          {currentStep === 3 && (
            <UserLogs
              scope="meeting"
              title="Log do Encontro"
              description="Acesse os logs de atividades do encontro"
              id={props.meeting.id}
            />
          )}

          <Padding padding="12px" />
          <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", flexWrap: "wrap" }}>
            <Button
              type="button"
              label="Etapa anterior"
              icon="pi pi-arrow-left"
              severity="secondary"
              outlined
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            />
            <Button
              type="button"
              label={currentStep === steps.length - 1 ? "Concluir navegação" : "Próxima etapa"}
              icon="pi pi-arrow-right"
              iconPos="right"
              disabled={currentStep === steps.length - 1}
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}
            />
          </div>
        </>
      ) : null}
    </Container>
  );
};

export default Meeting;
