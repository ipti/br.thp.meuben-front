import { Button } from "primereact/button";
import { useContext } from "react";
import homeImg from "../../../../../Assets/images/Caderno.png";
import { RegisterContext } from "../../../../../Context/Register/context";
import { RegisterTypes } from "../../../../../Context/Register/type";
import { color_race, kinship, typesex } from "../../../../../Controller/controllerGlobal";
import { useFetchRequestState } from "../../../../../Services/Address/query";
import { City, State } from "../../../../../Services/Address/type";
import { Column, Padding, Row } from "../../../../../Styles/styles";
import ImageTextSteps from "../../ImageTextStpes";
import { isUnder18ByBirthDate } from "../../../../../Utils/beneficiaryRules";

const getSexLabel = (value: any) => {
  const found = typesex.find((item) => item.id === Number(value));
  return found?.type || "-";
};

const getColorRaceLabel = (value: any) => {
  if (value && typeof value === "object" && "label" in value) {
    return String(value.label);
  }

  const found = color_race.find(
    (item) => item.id === Number(value?.value ?? value?.id ?? value)
  );
  return found?.name || "-";
};

const getKinshipLabel = (value: any) => {
  const found = kinship.find((item) => item.id === value);
  return found?.name || "-";
};

const zoneLabel = (value: any) => {
  if (Number(value) === 1) {
    return "Rural";
  }

  if (Number(value) === 2) {
    return "Urbana";
  }

  return "-";
};

const formatBirthDate = (value: any) => {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (isNaN(date.getTime())) {
    return String(value);
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const RowItem = ({ label, value }: { label: string; value: any }) => (
  <div className="col-12 md:col-6">
    <strong>{label}:</strong> <span>{value || "-"}</span>
  </div>
);

const Review = () => {
  const props = useContext(RegisterContext) as RegisterTypes;
  const { data: states } = useFetchRequestState();
  const isUnder18 = isUnder18ByBirthDate(props.dataValues?.birthday);
  const stateFound = states?.find(
    (state: State) => state.id === Number(props.dataValues?.state)
  );
  const cityFound = stateFound?.city?.find(
    (city: City) => city.id === Number(props.dataValues?.city)
  );

  return (
    <Column className="contentStart" id="center">
      <ImageTextSteps
        img={homeImg}
        title="Revisão da matrícula"
        subTitle={
          <p style={{ textAlign: "center" }}>
            Confira os dados preenchidos antes de finalizar.
            <br />
            Se precisar corrigir algo, use o botão voltar.
          </p>
        }
      />
      <Padding padding={props.padding} />

      <Row id="center">
        <div className="col-12 md:col-8" style={{ maxWidth: "860px" }}>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              background: "#f9fafb",
            }}
          >
            <h3>Dados do beneficiário</h3>
            <Padding padding="8px" />
            <div className="grid">
              <RowItem label="CPF" value={props.dataValues?.cpf} />
              <RowItem label="Nome" value={props.dataValues?.name} />
              <RowItem
                label="Data de nascimento"
                value={formatBirthDate(props.dataValues?.birthday)}
              />
              <RowItem label="Sexo" value={getSexLabel(props.dataValues?.sex)} />
              <RowItem label="Cor/Raça" value={getColorRaceLabel(props.dataValues?.color_race)} />
              <RowItem
                label="Deficiência"
                value={props.dataValues?.deficiency === true ? "Sim" : "Não"}
              />
              <RowItem label="Zona" value={zoneLabel(props.dataValues?.zone)} />
              <RowItem label="Telefone para contato" value={props.dataValues?.telephone} />
            </div>

            {isUnder18 && (
              <>
                <Padding padding="12px" />
                <h3>Dados do responsável</h3>
                <Padding padding="8px" />
                <div className="grid">
                  <RowItem label="Nome" value={props.dataValues?.responsable_name} />
                  <RowItem label="CPF" value={props.dataValues?.responsable_cpf} />
                  <RowItem label="Parentesco" value={getKinshipLabel(props.dataValues?.kinship)} />
                  <RowItem
                    label="Telefone do responsável"
                    value={props.dataValues?.responsable_telephone}
                  />
                  <RowItem
                    label="E-mail do responsável"
                    value={props.dataValues?.responsable_email}
                  />
                </div>
              </>
            )}

            <Padding padding="12px" />
            <h3>Endereço</h3>
            <Padding padding="8px" />
            <div className="grid">
              <RowItem label="CEP" value={props.dataValues?.cep} />
              <RowItem label="Endereço" value={props.dataValues?.address} />
              <RowItem label="Número" value={props.dataValues?.number} />
              <RowItem label="Complemento" value={props.dataValues?.complement} />
              <RowItem label="Bairro/Povoado" value={props.dataValues?.neighborhood} />
              <RowItem label="Cidade" value={cityFound?.name || "-"} />
              <RowItem label="Estado" value={stateFound?.name || "-"} />
            </div>
          </div>
        </div>
      </Row>

      <Padding padding={props.padding} />
      <Row id="center" className={"marginTop marginButtom"}>
        <div className="col-12 md:col-5" style={{ maxWidth: "420px" }}>
          <Button
            type="button"
            className="t-button-primary"
            label="Confirmar e finalizar"
            onClick={() => props.NextStep({})}
          />
        </div>
      </Row>
    </Column>
  );
};

export default Review;
