import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AplicationContext } from "../../../Context/Aplication/context";
import {
  GetIdTs,
  idTs,
  menuItem
} from "../../../Services/localstorage";
import { Column, Padding, Row } from "../../../Styles/styles";
import {
  Projects,
  PropsAplicationContext
} from "../../../Types/types";
import DropdownComponent from "../../Dropdown";
import { Back, Container } from "./style";

const TopBar = ({
  setViewdMenu,
  viewdMenu,
}: {
  viewdMenu: boolean;
  setViewdMenu: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const props = useContext(AplicationContext) as PropsAplicationContext;


  const verifyValueProject = (id: number | null) => {
    return props.project?.find(
      (props: Projects) => props.id === id
    );
  };

  const history = useNavigate();

  return (
    <Container>
      <Column style={{ width: "auto" }} id="center">
        <Row>
          <Column id="center">
            <i
              className="pi pi-bars cursor-pointer"
              style={{ fontSize: "1.5rem" }}
              onClick={() => setViewdMenu(!viewdMenu)}
            />
          </Column>
          <Back
            onClick={() => {
              history(-1);
            }}
          >
            <i className="pi pi-angle-left" style={{ fontSize: "1.2rem" }}></i>
            <Padding padding="2px" />
            Voltar
          </Back>
          <Padding padding="2px" />
        </Row>
      </Column>
      <Column style={{ width: "auto" }} id="center">
        <Row>
          <Column className="w-12rem md:w-20rem">
            {props.project ? (
              <DropdownComponent
                placerholder="Plano de trabalho"
                options={props.project}
                value={verifyValueProject(parseInt(GetIdTs()!))}
                onChange={(e) => {
                  idTs(e.target.value.id);
                  history("/");
                  menuItem("1");
                  window.location.reload();
                }}
              />
            ) : null}{" "}
          </Column>
        </Row>
      </Column>
    </Container>
  );
};

export default TopBar;
