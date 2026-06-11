import { Message } from "primereact/message";
import { useContext, useState } from "react";
import Loading from "../../../../../Components/Loading";
import StepsNavigator from "../../../../../Components/StepsNavigator";
import TextAreaComponent from "../../../../../Components/TextArea";
import Upload from "../../../../../Components/Upload";
import { AplicationContext } from "../../../../../Context/Aplication/context";
import MeetingListRegistrationProvider, {
  MeetingListRegistrationContext,
} from "../../../../../Context/Classroom/Meeting/MeetingListRegistration/context";
import { MeetingListRegisterTypes } from "../../../../../Context/Classroom/Meeting/MeetingListRegistration/type";
import { ROLE, Status } from "../../../../../Controller/controllerGlobal";
import { usePermissions } from "../../../../../hooks/usePermissions";
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
  const { can } = usePermissions();

  if (props.isLoading) return <Loading />;

  const steps = [
    {
      key: "dados",
      label: "Dados básicos",
      description: "Atualize as informações principais do encontro.",
    },
    {
      key: "arquivos",
      label: "Arquivos",
      description: "Anexe, visualize e gerencie os arquivos do encontro.",
    },
    {
      key: "presenca",
      label: "Lista de presença",
      description: "Controle a presença dos beneficiários e salve faltas.",
    },
    {
      key: "logs",
      label: "Logs",
      description: "Acompanhe o histórico de ações deste encontro.",
    },
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
            {(props.meeting.justification && can("meeting.viewJustification")) && (
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
          <StepsNavigator
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            showActions={false}
          />

          {currentStep === 0 && <DataMeeting />}

          {currentStep === 1 && (
            <>
              <Padding padding="16px" />
              {!(
                props.meeting.status === Status.APPROVED &&
                can("meeting.uploadFiles")
              ) && (
                  <div className="grid">
                    <div className="col-12">
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
                <div className="col-12">
                  {props.meeting?.meeting_archives?.map((item, index) => {
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setVisible(true);
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
          <div>
            <StepsNavigator
              steps={steps}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onlyActions
            />
          </div>
        </>
      ) : null}
    </Container>
  );
};

export default Meeting;
