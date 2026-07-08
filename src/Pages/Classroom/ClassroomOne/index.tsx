import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Chart as ChartPrime } from "primereact/chart";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Popover } from "react-tiny-popover";
import * as Yup from "yup";
import pessoas from "../../../Assets/images/pessoasgray.svg";
import report from "../../../Assets/images/report-svgrepo-com.svg";
import meeting from "../../../Assets/images/school_teacher.svg";
import CardQuant from "../../../Components/Chart/CardQuant";
import ContentPage from "../../../Components/ContentPage";
import DropdownComponent from "../../../Components/Dropdown";
import FieldError from "../../../Components/FieldError";
import Icon from "../../../Components/Icon";
import Loading from "../../../Components/Loading";
import TextInput from "../../../Components/TextInput";
import { minutesToTimeStr } from "../../../Components/TimeInput/index";
import UserLogs from "../../../Components/UserLogs";
import { AplicationContext } from "../../../Context/Aplication/context";
import ClassroomProvider, { ClassroomContext } from "../../../Context/Classroom/context";
import { ClassroomTypes, MediafrequencyType } from "../../../Context/Classroom/type";
import { formatarData, getStatusClassroomList } from "../../../Controller/controllerGlobal";
import { usePermissions } from "../../../hooks/usePermissions";
import { useFetchRequestCity, useFetchRequestState } from "../../../Services/Address/query";
import { requestChartFrequency } from "../../../Services/Chart/request";
import { useFetchRequestClassroomOne, useFetchRequestFoulsClassroomOne } from "../../../Services/Classroom/query";
import { requestClassroomZipArchives, requestCountStates } from "../../../Services/Classroom/request";
import color from "../../../Styles/colors";
import { Column, Padding, Row } from "../../../Styles/styles";
import { StateCard } from "../../../Types/states-cards";
import { PropsAplicationContext } from "../../../Types/types";
import CardItensClassrooom from "./CardItensClassroom";
import ModalChange from "./ModalChangeClaassroom";
import ModalReuseClassroom from "./ModalReuseClassroom";

const schemaEditClassroom = Yup.object().shape({
  name: Yup.string().required("Nome da turma é obrigatório"),
  status: Yup.object().nullable().required("Status da turma é obrigatório"),
});

const ClassroomOne = () => {
  return (
    <ClassroomProvider>
      <ClassroomOnePage />
    </ClassroomProvider>
  );
};

const ClassroomOnePage = () => {
  const history = useNavigate();
  const { id } = useParams();
  const props = useContext(ClassroomContext) as ClassroomTypes;
  const { data: classroom } = useFetchRequestClassroomOne(parseInt(id!));
  const { data: foulsRequest } = useFetchRequestFoulsClassroomOne(parseInt(id!));
  const [edit, setEdit] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleReuse, setVisibleReuse] = useState(false);
  const [cards, setCards] = useState<StateCard[]>([]);
  const [actionsPopoverOpen, setActionsPopoverOpen] = useState(false);
  const [chartInfoOpen, setChartInfoOpen] = useState(false);
  const [loadingEvi, setLoadingEvi] = useState(false);
  const [submittedEdit, setSubmittedEdit] = useState(false);
  var fouls = foulsRequest as MediafrequencyType;

  const totalMedia = fouls?.reduce((sum, item) => sum + item.media, 0);
  const mediaDasMedias = totalMedia / (fouls?.length || 1);

  const [chartData, setChartData] = useState<any>({});
  const [selectedState, setSelectedState] = useState<number | undefined>(
    classroom?.state_fk ?? undefined
  );

  const { data: states } = useFetchRequestState();
  const { data: cities } = useFetchRequestCity(selectedState);

  useEffect(() => {
    if (classroom?.state_fk) {
      setSelectedState(classroom.state_fk);
    }
  }, [classroom?.state_fk]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await requestChartFrequency(classroom?.id);
        if (!response?.data || response.data.length === 0) {
          console.warn("Nenhum dado válido retornado da API.");
          return;
        }
        const data: { name: string; frequency: number; beneficiarios: number; meeting_date: string; }[] = response.data;
        setChartData({
          labels: data.map((item) => formatarData(item.meeting_date)),
          datasets: [
            {
              label: "Numero de Beneficiários",
              data: data.map((item) => item.beneficiarios),
              borderColor: color.gray,
              fill: false,
            },
            {
              label: "Faltas por encontro",
              data: data.map((item) => item.frequency),
              borderColor: color.red,
              backgroundColor: color.red + "44",
              tension: 0.4,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
      }
    };

    const cardsData = async () => {
      const counts = await requestCountStates(classroom?.id);
      setCards(counts);
    };

    fetchData();
    cardsData();
  }, [classroom?.id]);

  const propsAplication = useContext(AplicationContext) as PropsAplicationContext;
  const { can } = usePermissions();

  if (props.isLoading) return <Loading />;

  const handleDownload = async () => {
    try {
      setLoadingEvi(true);
      const response = await requestClassroomZipArchives(classroom?.id!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `turma-${classroom?.name}.zip`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match?.[1]) fileName = match[1];
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setLoadingEvi(false);
    } catch (err) {
      console.error(err);
      setLoadingEvi(false);
      alert('Não foi possível baixar o arquivo');
    }
  };

  return (
    <ContentPage title={classroom?.name} description="Detalhes da sua turma.">
      {edit ? (
        <>
          {classroom ? (
            <Formik
              initialValues={{
                name: classroom?.name,
                status: getStatusClassroomList().find((p) => p.id === classroom?.status),
                state_fk: classroom?.state_fk ?? undefined,
                city_fk: classroom?.city_fk ?? undefined,
                neighborhood: classroom?.neighborhood ?? "",
              }}
              validationSchema={schemaEditClassroom}
              onSubmit={(values) => {
                props.UpdateClassroom(
                  {
                    name: values.name,
                    status: values.status?.id!,
                    state_fk: values.state_fk,
                    city_fk: values.city_fk,
                    neighborhood: values.neighborhood,
                  },
                  parseInt(id!)
                );
                setEdit(false);
              }}
            >
              {({ values, errors, handleChange, setFieldValue }) => {
                const fieldError = (field: string) =>
                  submittedEdit ? (errors as Record<string, string>)[field] : undefined;

                return (
                  <Form>
                    <Column>
                      <div className="grid">
                        <div className="col-12 md:col-6">
                          <label>Nome da turma *</label>
                          <Padding />
                          <TextInput name="name" placeholder="Nome da turma" onChange={handleChange} value={values.name} />
                          <FieldError message={fieldError("name")} />
                        </div>
                        <div className="col-12 md:col-6">
                          <label>Status da turma *</label>
                          <Padding />
                          <DropdownComponent
                            options={getStatusClassroomList()}
                            name="status"
                            value={values.status}
                            placerholder="Status da turma"
                            onChange={handleChange}
                          />
                          <FieldError message={fieldError("status")} />
                        </div>
                      </div>
                      <div className="grid">
                        <div className="col-12 md:col-6">
                          <label>Estado</label>
                          <Padding />
                          <DropdownComponent
                            value={values.state_fk}
                            name="state_fk"
                            placerholder="Selecione o estado"
                            options={states ?? []}
                            optionsLabel="name"
                            optionsValue="id"
                            onChange={(e) => {
                              handleChange(e);
                              setSelectedState(e.target.value);
                              setFieldValue("city_fk", undefined);
                            }}
                          />
                        </div>
                        <div className="col-12 md:col-6">
                          <label>Cidade</label>
                          <Padding />
                          <DropdownComponent
                            value={values.city_fk}
                            name="city_fk"
                            placerholder="Selecione a cidade"
                            options={cities ?? []}
                            optionsLabel="name"
                            optionsValue="id"
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="grid">
                        <div className="col-12 md:col-6">
                          <label>Bairro/Povoado</label>
                          <Padding />
                          <TextInput name="neighborhood" placeholder="Bairro/Povoado" onChange={handleChange} value={values.neighborhood} />
                        </div>
                      </div>
                      <Padding />
                      <Row id="end">
                        <Button
                          label="Salvar"
                          type="submit"
                          icon={"pi pi-save"}
                          loading={props.isLoading}
                          onClick={() => setSubmittedEdit(true)}
                        />
                        <Padding />
                        <Button label="Cancelar" severity="secondary" type="button" onClick={() => setEdit(false)} />
                      </Row>
                    </Column>
                  </Form>
                );
              }}
            </Formik>
          ) : null}
        </>
      ) : (
        <Column>
          <Row id="end">
            {can("classroom.actions") && (
                <Popover
                  isOpen={actionsPopoverOpen}
                  positions={["bottom", "left", "right", "top"]}
                  onClickOutside={() => setActionsPopoverOpen(false)}
                  content={
                    <div
                      style={{
                        backgroundColor: "white",
                        padding: "8px",
                        minWidth: "180px",
                        boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                      }}
                    >
                      <Row
                        onClick={() => { if (!loadingEvi) { handleDownload(); setActionsPopoverOpen(false); } }}
                        id="space-between"
                        style={{ cursor: loadingEvi ? "not-allowed" : "pointer", padding: "8px", gap: "8px", opacity: loadingEvi ? 0.6 : 1 }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          {loadingEvi
                            ? <i className="pi pi-spin pi-spinner" style={{ fontSize: "16px" }} />
                            : <Icon icon="pi pi-download" size="16px" />
                          }
                        </div>
                        <p>{loadingEvi ? "Baixando..." : "Baixar evidências"}</p>
                      </Row>
                      <Row
                        onClick={() => { setEdit(true); setActionsPopoverOpen(false); }}
                        id="space-between"
                        style={{ cursor: "pointer", padding: "8px", gap: "8px" }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <Icon icon="pi pi-pencil" size="16px" />
                        </div>
                        <p>Editar</p>
                      </Row>
                      <Row
                        onClick={() => { setVisible(true); setActionsPopoverOpen(false); }}
                        id="space-between"
                        style={{ cursor: "pointer", padding: "8px", gap: "8px" }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <Icon icon="pi pi-sync" size="16px" />
                        </div>
                        <p>Transferir turma</p>
                      </Row>
                      <Row
                        onClick={() => { setVisibleReuse(true); setActionsPopoverOpen(false); }}
                        id="space-between"
                        style={{ cursor: "pointer", padding: "8px", gap: "8px" }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <Icon icon="pi pi-copy" size="16px" />
                        </div>
                        <p>Reaproveitar turma</p>
                      </Row>
                    </div>
                  }
                >
                  <div style={{ cursor: "pointer" }} onClick={() => setActionsPopoverOpen(!actionsPopoverOpen)}>
                    <Icon icon="pi pi-ellipsis-v" />
                  </div>
                </Popover>
              )}
          </Row>
          <Padding padding="8px" />
          <div className="grid">
            <div className="col-12 md:col-3">
              <label style={{ fontWeight: "bold", color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
              <Padding />
              {(() => {
                const status = getStatusClassroomList().find((s) => s.id === classroom?.status);
                const statusColors: Record<string, { bg: string; text: string }> = {
                  "Ativa": { bg: "#dcfce7", text: "#16a34a" },
                  "Inativa": { bg: "#fee2e2", text: "#dc2626" },
                  "Concluída": { bg: "#dbeafe", text: "#2563eb" },
                };
                const style = statusColors[status?.name ?? ""] ?? { bg: "#f3f4f6", text: "#374151" };
                return (
                  <span style={{
                    backgroundColor: style.bg,
                    color: style.text,
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}>
                    {status?.name ?? "-"}
                  </span>
                );
              })()}
            </div>
          </div>
          <Padding padding="16px" />
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#6b7280",
            fontSize: "14px",
            flexWrap: "wrap",
          }}>
            <i className="pi pi-map-marker" style={{ fontSize: "14px" }} />
            <span>{states?.find((s: any) => s.id === classroom?.state_fk)?.name ?? "-"}</span>
            <span style={{ color: "#d1d5db" }}>•</span>
            <span>{cities?.find((c: any) => c.id === classroom?.city_fk)?.name ?? "-"}</span>
            {classroom?.neighborhood && (
              <>
                <span style={{ color: "#d1d5db" }}>•</span>
                <span>{classroom.neighborhood}</span>
              </>
            )}
          </div>
        </Column>
      )}
      <Padding padding="16px" />
      <div className="grid">
        <div className="col-12 md:col-6" onClick={() => history(`/turma/${id}/alunos`)}>
          <CardItensClassrooom title="Matriculas" description="Acesse para gerenciar seus alunos" icon={pessoas} count={classroom?.register_classroom?.length} />
        </div>
        <div className="col-12 md:col-6" onClick={() => history(`/turma/${id}/encontros`)}>
          <CardItensClassrooom title="Encontros" description="Acesse para Gerenciar seus encontros" icon={meeting} count={classroom?.meeting?.length} />
        </div>
      </div>
      <div className="grid">
        <div className="col-12 md:col-6" onClick={() => history(`/turma/${id}/relatorio`)}>
          <CardItensClassrooom title="Relatório" description="Acesse o relatório da turma" icon={report} />
        </div>
      </div>
      <div className="grid">
        {cards.map((item) => (
          <div className="col-12 md:col-4 lg:col-2">
            <CardQuant
              title={'Matriculas ' + item.status}
              quant={item.number}
              color={item.status === "Aprovados" ? "orange" : item.status === "Pendentes" ? "blue" : "navy_blue"}
            />
          </div>
        ))}
        {fouls?.length > 0 && (
          <div className="col-12 md:col-4 lg:col-2">
            <CardQuant title={'Média de presença da turma'} quant={mediaDasMedias?.toFixed(2) + '%'} color={"navy_blue"} />
          </div>
        )}
        <div className="col-12 md:col-4 lg:col-2">
          <CardQuant title={'Carga horária dos encontros'} quant={minutesToTimeStr(classroom?.total_workload ?? 0) + 'h'} color={"navy_blue"} />
        </div>
      </div>
      {(chartData && chartData?.labels?.length > 0) && (
        <div className="card col-12 md:col-12 lg:col-12" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2>Gráfico Faltas em Encontros</h2>
              <Popover
                isOpen={chartInfoOpen}
                positions={["top", "bottom", "right"]}
                onClickOutside={() => setChartInfoOpen(false)}
                content={
                  <div style={{
                    backgroundColor: "white",
                    padding: "12px 16px",
                    maxWidth: "280px",
                    boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#374151",
                    lineHeight: "1.6",
                  }}>
                    <strong>Como ler este gráfico:</strong>
                    <ul style={{ marginTop: "8px", paddingLeft: "16px" }}>
                      <li><span style={{ color: color.red }}>Linha vermelha</span>: número de faltas registradas por encontro.</li>
                      <li><span style={{ color: color.gray }}>Linha cinza</span>: total de beneficiários.</li>
                    </ul>
                    <p style={{ marginTop: "8px" }}>O eixo X representa as datas dos encontros realizados.</p>
                  </div>
                }
              >
                <span
                  onClick={() => setChartInfoOpen(!chartInfoOpen)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#e5e7eb",
                    color: "#6b7280",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  ?
                </span>
              </Popover>
            </div>
            <Padding padding="8px" />
            <ChartPrime
              type="line"
              data={chartData}
              style={{ maxHeight: "500px", flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
              width="100%"
            />
          </div>
        </div>
      )}
      {loadingEvi && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          backgroundColor: "#1e1e2f",
          color: "white",
          padding: "12px 20px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 9999,
        }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: "18px" }} />
          <span>Gerando evidências, aguarde...</span>
        </div>
      )}
      <UserLogs scope="classroom" title="Logs da Turma" description="Acesse os logs de atividades da turma" id={classroom?.id} />
      <ModalChange visible={visible} onHide={() => setVisible(false)} />
      <ModalReuseClassroom visible={visibleReuse} onHide={() => setVisibleReuse(false)} classroom={classroom} />
    </ContentPage>
  );
};

export default ClassroomOne;
