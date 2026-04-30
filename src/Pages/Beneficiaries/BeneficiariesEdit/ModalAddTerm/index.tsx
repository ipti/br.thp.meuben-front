import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { OverlayPanel } from "primereact/overlaypanel";
import { Tag } from "primereact/tag";
import { useContext, useRef } from "react";
import * as Yup from "yup";
import CalendarComponent from "../../../../Components/Calendar";
import TextInput from "../../../../Components/TextInput";
import { AplicationContext } from "../../../../Context/Aplication/context";
import { BeneficiariesEditContext } from "../../../../Context/Beneficiaries/BeneficiaresEdit/context";
import { BeneficiariesEditType } from "../../../../Context/Beneficiaries/BeneficiaresEdit/type";
import { ROLE, StatusTermEnum, TypeTermEnum } from "../../../../Controller/controllerGlobal";
import { ControllerUpdateRegistration } from "../../../../Services/PreRegistration/controller";
import { Column, Padding, Row } from "../../../../Styles/styles";
import { PropsAplicationContext } from "../../../../Types/types";

type TagSeverity = "warning" | "success" | "danger" | "info" | null;

const termStatusInfo: {
  key: string;
  label: string;
  color: string;
  severity: TagSeverity;
  icon: string;
  description: string;
}[] = [
  {
    key: "TERM_ANALYSIS",
    label: "Termo em análise",
    color: "#f59e0b",
    severity: "warning",
    icon: "pi pi-clock",
    description:
      "Status inicial atribuído automaticamente ao anexar o documento. O termo aguarda revisão pela equipe de M&A.",
  },
  {
    key: "ACTIVE_TERM",
    label: "Termo ativo",
    color: "#10b981",
    severity: "success",
    icon: "pi pi-check-circle",
    description:
      "Documento validado e aceito pela equipe de M&A. O beneficiário está com o termo regularizado e em plena vigência.",
  },
  {
    key: "INACTIVE_TERM",
    label: "Termo inativo",
    color: "#6b7280",
    severity: null,
    icon: "pi pi-minus-circle",
    description:
      "O termo perdeu a validade por expiração do prazo, inatividade do beneficiário no THP, ou definição manual de M&A.",
  },
  {
    key: "INVALID_TERM",
    label: "Termo inválido",
    color: "#ef4444",
    severity: "danger",
    icon: "pi pi-times-circle",
    description:
      "Documento recusado por M&A por não atender aos requisitos exigidos. É necessário anexar um novo documento.",
  },
];

const StatusLegendButton = () => {
  const op = useRef<OverlayPanel>(null);
  return (
    <>
      <button
        type="button"
        onClick={(e) => op.current?.toggle(e)}
        style={{
          background: "#6b7280",
          border: "none",
          borderRadius: "50%",
          width: "16px",
          height: "16px",
          color: "white",
          fontSize: "10px",
          fontWeight: "bold",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "6px",
          verticalAlign: "middle",
          flexShrink: 0,
        }}
        title="Ver descrição dos status"
      >
        ?
      </button>
      <OverlayPanel ref={op} style={{ maxWidth: "340px" }}>
        <p style={{ fontWeight: 600, marginBottom: "10px", fontSize: "13px", color: "#1e293b" }}>
          Legenda dos status de termo
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {termStatusInfo.map((item) => (
            <div key={item.key} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <i className={item.icon} style={{ color: item.color, fontSize: "15px", marginTop: "2px", flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: "12px", color: item.color, margin: 0 }}>
                  {item.label}
                </p>
                <p style={{ fontSize: "11px", color: "#475569", margin: "2px 0 0" }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </OverlayPanel>
    </>
  );
};

const ModalAddTerm = ({
  onHide,
  visible,
  id,
}: {
  onHide(): void;
  visible?: any;
  id: number;
}) => {
  const props = useContext(BeneficiariesEditContext) as BeneficiariesEditType;
  const propsAplication = useContext(AplicationContext) as PropsAplicationContext;
  const isAdmin = propsAplication.user?.role === ROLE.ADMIN;
  const isEdit = !!visible?.dateTerm;

  const { requestRegisterTermMutation } = ControllerUpdateRegistration();

  const CreateRegisterTerm = (data: FormData) => {
    requestRegisterTermMutation.mutate({ data });
  };

  const schemaCreate = Yup.object().shape({
    dateTerm: Yup.string().required("Data de assinatura é obrigatório"),
    dateValid: Yup.string().required("Data de validade é obrigatório"),
    file: Yup.string().required("Arquivo com termo é obrigatório"),
    type: Yup.string().required("Tipo é obrigatório"),
  });

  const schemaEdit = Yup.object().shape({
    dateTerm: Yup.string().required("Data de assinatura é obrigatório"),
    dateValid: Yup.string().required("Data de validade é obrigatório"),
  });

  const optionsType = Object.keys(TypeTermEnum).map((key) => ({
    id: key,
    name: TypeTermEnum[key],
  }));

  // Admin pode aprovar ou invalidar — apenas essas duas ações manuais
  const optionsStatusAdmin = termStatusInfo
    .filter((s) => s.key === "ACTIVE_TERM" || s.key === "INVALID_TERM")
    .map((s) => ({ id: s.key, name: s.label }));

  const currentStatusInfo = termStatusInfo.find((s) => s.key === visible?.status);

  return (
    <Dialog
      onHide={onHide}
      header={isEdit ? "Editar termo" : "Novo termo"}
      visible={visible}
      style={{ width: window.innerWidth > 800 ? "50vw" : "70vw" }}
    >
      <Formik
        initialValues={{
          dateTerm: new Date(visible?.dateTerm || Date.now()),
          dateValid: new Date(visible?.dateValid || Date.now()),
          file: undefined,
          observation: visible?.observation ?? "",
          // Novo termo: fixo em TERM_ANALYSIS. Edição: herda status atual
          status: isEdit ? (visible?.status ?? "") : "TERM_ANALYSIS",
          type: visible?.type ?? "",
        }}
        validationSchema={isEdit ? schemaEdit : schemaCreate}
        onSubmit={(values) => {
          if (!isEdit && values.file) {
            const formData = new FormData();
            formData.append("dateTerm", values.dateTerm.toString());
            formData.append("dateValid", values.dateValid?.toString());
            formData.append("registration", id?.toString());
            formData.append("observation", values.observation);
            formData.append("status", "TERM_ANALYSIS");
            formData.append("type", values.type);
            formData.append("file", (values.file as any)[0]);
            CreateRegisterTerm(formData);
          }

          if (isEdit) {
            props.UpdateRegisterTerm(visible.id, {
              dateTerm: values.dateTerm,
              dateValid: values.dateValid,
              observation: values.observation,
              status: values.status,
              type: values.type,
            });
          }

          onHide();
        }}
      >
        {({ values, handleChange, errors, touched, setFieldValue }) => (
          <Form>
            <div className="grid">
              {/* Datas */}
              <div className="col-12 md:col-6">
                <label>Data de assinatura *</label>
                <Padding />
                <CalendarComponent
                  value={values.dateTerm}
                  name="dateTerm"
                  dateFormat="dd/mm/yy"
                  placeholder="Data de assinatura"
                  onChange={handleChange}
                />
                {errors.dateTerm && touched.dateTerm && (
                  <div style={{ color: "red", marginTop: "8px" }}>{String(errors.dateTerm)}</div>
                )}
              </div>
              <div className="col-12 md:col-6">
                <label>Data de validade *</label>
                <Padding />
                <CalendarComponent
                  value={values.dateValid}
                  name="dateValid"
                  dateFormat="dd/mm/yy"
                  placeholder="Data de validade"
                  onChange={handleChange}
                />
                {errors.dateValid && touched.dateValid && (
                  <div style={{ color: "red", marginTop: "8px" }}>{String(errors.dateValid)}</div>
                )}
              </div>

              {/* Arquivo — somente criação */}
              {!isEdit && (
                <div className="col-12 md:col-6">
                  <label>Termo *</label>
                  <Padding />
                  <TextInput
                    type="file"
                    placeholder="Termo"
                    onChange={(e) => setFieldValue("file", e.target.files)}
                    name="file"
                  />
                  {errors.file && touched.file && (
                    <div style={{ color: "red", marginTop: "8px" }}>{String(errors.file)}</div>
                  )}
                </div>
              )}

              {/* Tipo */}
              <div className="col-12 md:col-6">
                <label>Tipo *</label>
                <Padding />
                <Dropdown
                  value={values.type}
                  options={optionsType}
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Tipo"
                  onChange={(e) => setFieldValue("type", e.value)}
                  name="type"
                  className="w-full"
                  disabled={isEdit && !isAdmin}
                />
                {errors.type && touched.type && (
                  <div style={{ color: "red", marginTop: "8px" }}>{String(errors.type)}</div>
                )}
              </div>

              {/* Status */}
              <div className="col-12 md:col-6">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ margin: 0 }}>Status</label>
                  <StatusLegendButton />
                </div>
                <Padding />

                {/* Novo termo: badge fixo + mensagem */}
                {!isEdit && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0" }}>
                      <i className="pi pi-clock" style={{ color: "#f59e0b", fontSize: "16px" }} />
                      <Tag value="Termo em análise" severity="warning" />
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "6px",
                      marginTop: "6px",
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: "6px",
                      padding: "8px 10px",
                    }}>
                      <i className="pi pi-info-circle" style={{ color: "#d97706", fontSize: "13px", marginTop: "1px", flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "#92400e", lineHeight: "1.5" }}>
                        Após o envio, a equipe de M&A irá analisar o documento e atualizará o status do termo.
                      </span>
                    </div>
                  </div>
                )}

                {/* Edição — admin: dropdown com aprovação/invalidação */}
                {isEdit && isAdmin && (
                  <Dropdown
                    value={values.status}
                    options={optionsStatusAdmin}
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Selecione o status"
                    onChange={(e) => setFieldValue("status", e.value)}
                    name="status"
                    className="w-full"
                  />
                )}

                {/* Edição — não admin: somente leitura */}
                {isEdit && !isAdmin && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0" }}>
                    {currentStatusInfo && (
                      <i
                        className={currentStatusInfo.icon}
                        style={{ color: currentStatusInfo.color, fontSize: "16px" }}
                      />
                    )}
                    <Tag
                      value={currentStatusInfo?.label ?? visible?.status}
                      severity={currentStatusInfo?.severity ?? "info"}
                    />
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      (apenas M&A pode alterar)
                    </span>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div className="col-12 md:col-6">
                <label>Observações</label>
                <Padding />
                <TextInput
                  value={values.observation}
                  placeholder="Observações"
                  onChange={handleChange}
                  name="observation"
                />
              </div>
            </div>

            <Padding padding="16px" />
            <Column style={{ width: "100%" }}>
              <Row id="end">
                <Button type="submit" label={isEdit ? "Salvar" : "Adicionar"} />
              </Row>
            </Column>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ModalAddTerm;
