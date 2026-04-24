import { Button } from "primereact/button";
import { useContext } from "react";
import homeImg from "../../../../../../Assets/images/Caderno.png";
import { RegisterContext } from "../../../../../../Context/Register/context";
import { RegisterTypes } from "../../../../../../Context/Register/type";
import { Column, Padding, Row } from "../../../../../../Styles/styles";
import ImageTextSteps from "../../../ImageTextStpes";

const OverAge = () => {
  const props = useContext(RegisterContext) as RegisterTypes;

  return (
    <Column className="contentStart" id="center">
      <ImageTextSteps
        img={homeImg}
        title="Revisão do cadastro"
        subTitle={
          <p style={{ textAlign: "center" }}>
            Confira os dados preenchidos.
            <br />
            Se estiver tudo certo, finalize a matrícula.
          </p>
        }
      />
      <Padding padding={props.padding} />
      <Row id="center" className={"marginTop marginButtom"}>
        <div className="col-12 md:col-5" style={{ maxWidth: "420px" }}>
          <Button
            type="button"
            className="t-button-primary"
            label="Continuar para revisão"
            onClick={() => props.NextStep({})}
          />
        </div>
      </Row>
    </Column>
  );
};

export default OverAge;
