import { useContext, useEffect, useState } from "react";

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import TagLogin from "../../Assets/images/logo.svg";
import { AplicationContext } from "../../Context/Aplication/context";
import { profileTypeLabel, ROLE } from "../../Controller/controllerGlobal";
import { usePermissions } from "../../hooks/usePermissions";
import {
  getMenuItem,
  getYear,
  menuItem,
  setYear,
} from "../../Services/localstorage";
import styles from "../../Styles";
import { Column, Padding, Row } from "../../Styles/styles";
import { PropsAplicationContext } from "../../Types/types";
import DropdownComponent from "../Dropdown";
import Icon from "../Icon";
import Item from "./Item";
import LogoutTopBar from "../Layout/TopBar/Logout";
import { Container, MenuScrollArea } from "./style";
import turmasHover from "../../Assets/images/turmasPessoas.svg";
import turmas from "../../Assets/images/peoples.svg";
import reapplicator from "../../Assets/images/iconsMenu/reapplicator.svg";
import reapplicatorHover from "../../Assets/images/iconsMenu/reapplicator_active.svg";
import home from "../../Assets/images/iconsMenu/home.svg";
import homeHover from "../../Assets/images/iconsMenu/home_active.svg";

import tecnologia from "../../Assets/images/iconsMenu/digital_wellbeing.svg";

import tecnologia_hover from "../../Assets/images/iconsMenu/digital_wellbeing_active.svg";
import projeto from "../../Assets/images/iconsMenu/note_add.svg";
import projeto_hover from "../../Assets/images/iconsMenu/note_add_active.svg";

import beneficiaries from "../../Assets/images/iconsMenu/diversity_4.svg";
import beneficiaries_hover from "../../Assets/images/iconsMenu/diversity_hover.svg";

import ajuda from "../../Assets/images/question_mark.svg";
import ajuda_hover from "../../Assets/images/iconsMenu/question_mark_active.svg";
import termType from "../../Assets/images/iconsMenu/term_type.svg";
import termTypeHover from "../../Assets/images/iconsMenu/term_type_active.svg";

import user from "../../Assets/images/iconsMenu/person.svg";
import user_hover from "../../Assets/images/iconsMenu/person_active.svg";

import log from "../../Assets/images/iconsMenu/log.svg";
import logHover from "../../Assets/images/iconsMenu/log_active.svg";
import { controllerYears } from "../../Controller/controllerYears";

const Menu = ({ viewdMenu, isMobile }: { viewdMenu: boolean; isMobile?: boolean }) => {
  const [active, setActive] = useState(parseInt(getMenuItem()!));
  const [visibleModal, setVisibleModal] = useState(false);
  const props = useContext(AplicationContext) as PropsAplicationContext;
  const { can } = usePermissions();

  const itemMenu = getMenuItem()

  useEffect(() => {
    setActive(parseInt(getMenuItem()!))
  }, [itemMenu])


  return (
    <Container active={viewdMenu} isMobile={isMobile}>
      <MenuScrollArea>
      <Padding padding="4px" />
      <Padding padding="16px">
        <Row id="center">
          <Column id="center">
            <img src={TagLogin} style={{ width: "128px" }} alt=""></img>
          </Column>
          <Padding />
          <Column id="center">
            <div
              style={{
                border: `2px solid ${styles.colors.colorsBaseCloudNormal}`,
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
              }}
              onClick={() => setVisibleModal(!visibleModal)}
            >
              {getYear() ? getYear() : "Sem ano"}
              <Icon icon="pi pi-angle-down" size="0.8rem" />
            </div>
          </Column>
        </Row>
      </Padding>
      <Padding padding="8px" />
      {true ? (
        <Padding padding="8px">
          {/* <Item
            text={"Cronograma"}
            funcActiv={() => {
              setActive(1);
              menuItem("1");
            }}
            active={active === 1 ? true : false}
            path={"/cronograma"}
            icon={"pi pi-calendar"}
          /> */}
          <Item
            text={"Pagina Inicial"}
            funcActiv={() => {
              setActive(1);
              menuItem("1");
            }}
            active={active === 1 ? true : false}
            path={"/"}
            icon={active === 1 ? homeHover : home}
          />
          <Padding />
          <Item
            text={"Tecnologias"}
            funcActiv={() => {
              setActive(2);
              menuItem("2");
            }}
            active={active === 2 ? true : false}
            path={"/tecnologias"}
            icon={active === 2 ? tecnologia_hover : tecnologia}
          />
          <Padding />
          <Item
            text={"Planos de trabalho"}
            funcActiv={() => {
              setActive(3);
              menuItem("3");
            }}
            active={active === 3 ? true : false}
            path={"/projetos"}
            icon={active === 3 ? projeto_hover : projeto}
          />
          <Padding />
          <Item
            text={"Turmas"}
            funcActiv={() => {
              setActive(4);
              menuItem("4");
            }}
            active={active === 4 ? true : false}
            path={"/turma"}
            icon={active === 4 ? turmasHover : turmas}
          />
          {can("beneficiary.view") && (
            <>
              <Padding />
              <Item
                text={"Beneficiários"}
                funcActiv={() => {
                  setActive(5);
                  menuItem("5");
                }}
                active={active === 5 ? true : false}
                path={"/beneficiarios"}
                icon={active === 5 ? beneficiaries_hover : beneficiaries}
              />
            </>
          )}
          {can("menu.reapplicators") && (
            <>
              <Padding />
              <Item
                text={"Reaplicadores"}
                funcActiv={() => {
                  setActive(9);
                  menuItem("9");
                }}
                active={active === 9 ? true : false}
                path={"/reaplicadores"}
                icon={active === 9 ? reapplicatorHover : reapplicator}
              />
            </>
          )}
          {can("menu.users") && (
            <>
              <Padding />
              <Item
                text={"Usuarios"}
                funcActiv={() => {
                  setActive(6);
                  menuItem("6");
                }}
                active={active === 6 ? true : false}
                path={"/users"}
                icon={active === 6 ? user_hover : user}
              />
            </>
          )}
          {can("menu.termTypes") && (
            <>
              <Padding />
              <Item
                text="Gestão de Termos"
                funcActiv={() => {
                  setActive(10);
                  menuItem("10");
                }}
                active={active === 10 ? true : false}
                path={"/tipos-de-termo"}
                icon={active === 10 ? termTypeHover : termType}
              />
            </>
          )}
          {can("menu.logs") && (
            <>
              <Padding />
              <Item
                text="Logs"
                funcActiv={() => {
                  setActive(8);
                  menuItem("8");
                }}
                active={active === 8 ? true : false}
                path={"/logs"}
                icon={active === 8 ? logHover : log}
              />
            </>
          )}
          <Padding />
          <Item
            text={"Ajuda"}
            funcActiv={() => {
              setActive(7);
              menuItem("7");
            }}
            active={active === 7 ? true : false}
            path={"/ajuda"}
            icon={active === 7 ? ajuda_hover : ajuda}
          />
        </Padding>
      ) : null}
      </MenuScrollArea>

      {props.user && (
        <div
          style={{
            borderTop: `1px solid ${styles.colors.colorsBaseCloudNormal}`,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: "13px",
                color: styles.colors.colorsBaseInkNormalActive,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {props.user.name}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                color: styles.colors.colorGrayElephant,
              }}
            >
              {props.user.role === ROLE.ADMIN
                ? "Administrador"
                : profileTypeLabel[props.user.profileType ?? ""] ?? "Usuário"}
            </p>
          </div>
          <LogoutTopBar />
        </div>
      )}

      <ModalYear visible={visibleModal} onHide={() => setVisibleModal(false)} />
    </Container>
  );
};

const ModalYear = ({
  visible,
  onHide,
}: {
  visible: boolean | undefined;
  onHide(): void;
}) => {
  const years = controllerYears()

  const [year, setYearState] = useState<any>();

  useEffect(() => {
    setYearState(parseInt(getYear()!));
  }, []);

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Selecione o ano"
      className="w-8 md:w-5"
    >
      <Padding />
      <div>
        <div>
          <DropdownComponent
            options={years.yearsOptions}
            placerholder="Ano"
            onChange={(e) => {
              setYearState(e.target.value);
            }}
            optionsLabel="value"
            value={year}
          />
          {/* <div>{errors.password}</div> */}
        </div>
      </div>
      <Padding padding="16px" />
      <Column>
        <Row id="space-between" style={{ width: "100%" }}>
          <Button label="Cancelar" severity="secondary" />
          <Button
            label="Selecionar ano"
            onClick={() => {
              setYear(year.toString());

              window.location.reload();
            }}
          />
        </Row>
      </Column>
    </Dialog>
  );
};

export default Menu;
