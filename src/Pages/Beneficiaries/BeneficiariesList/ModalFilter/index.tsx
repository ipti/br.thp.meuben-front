import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useContext } from "react";
import DropdownComponent from "../../../../Components/Dropdown";
import { AplicationContext } from "../../../../Context/Aplication/context";
import { BeneficiariesListContext } from "../../../../Context/Beneficiaries/BeneficiariesList/context";
import { BeneficiariesListType } from "../../../../Context/Beneficiaries/BeneficiariesList/type";
import { Column, Padding, Row } from "../../../../Styles/styles";
import { PropsAplicationContext } from "../../../../Types/types";
import { TypeTermEnum } from "../../../../Controller/controllerGlobal";

const ModalFilter = ({
  onHide,
  visible,
}: {
  onHide(): void;
  visible?: boolean | undefined;
}) => {
  const props = useContext(BeneficiariesListContext) as BeneficiariesListType;
  const propsAplication = useContext(
    AplicationContext
  ) as PropsAplicationContext;
  return (
    <Dialog
      onHide={onHide}
      visible={visible}
      header="Filtrar beneficiários"
      style={{ width: window.innerWidth < 800 ? "80vw" : "50vw" }}
    >
      <Formik
        initialValues={props.filter}
        onSubmit={(values) => {
          props.setFilter(values);
          onHide();
        }}
      >
        {({ values, handleChange }) => {
          return (
            <Form>
              {propsAplication.project && (
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Filtrar por tecnologia</label>
                    <Padding />
                    <DropdownComponent
                      placerholder="Escolha uma tecnologia"
                      name="idTs"
                      options={[
                        { name: "Todos", id: undefined },
                        ...propsAplication.project,
                      ]}
                      value={values.idTs}
                      optionsValue="id"
                      onChange={(e) => {
                         handleChange(e);
                      }}
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Filtrar por Status do beneficiário</label>
                    <Padding />
                    <DropdownComponent
                      placerholder="Escolha um status"
                      options={[
                        { name: "Todos", id: undefined },
                        { name: "Beneficiário Ativo", id: 'ACTIVE' },
                        { name: "Beneficiário Inativo", id: 'INACTIVE' },
                      ]}
                      name="status"
                      value={values.status}
                      optionsValue="id"
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Filtrar por Status de termo</label>
                    <Padding />
                    <DropdownComponent
                      placerholder="Escolha um status do termo"
                      options={[
                        { name: "Todos", id: undefined },
                        { name: "Termo em analise", id: 'TERM_ANALYSIS' },
                        { name: "Termo Ativo", id: 'ACTIVE_TERM' },
                        { name: "Termo Inativo", id: 'INACTIVE_TERM' },
                      ]}
                      name="statusTerm"
                      value={values.statusTerm}
                      optionsValue="id"
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Filtrar por Tipo de termo</label>
                    <Padding />
                    <DropdownComponent
                      placerholder="Escolha um tipo de termo"
                      options={[
                        { name: "Todos", id: undefined },
                        ...Object.entries(TypeTermEnum).map(([key, label]) => ({ name: label as string, id: key })),
                      ]}
                      name="typeTerm"
                      value={values.typeTerm}
                      optionsValue="id"
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                  </div>
                </div>
              )}
              <Padding padding="16px" />
              <Column style={{ width: "100%" }}>
                <Row id="end">
                  <Button
                    label="Limpar filtro"
                    text
                    type="button"
                    onClick={() => { props.setFilter({idClassroom: undefined, idProject: undefined, idTs: undefined, statusTerm: undefined, status: undefined, typeTerm: undefined }); onHide() }}
                  />
                  <Padding />
                  <Button label="Filtrar" />
                </Row>
              </Column>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default ModalFilter;
