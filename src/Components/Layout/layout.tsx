import React, { useEffect, useState } from "react";
import { Column, Row } from "../../Styles/styles";
import Menu from "../Menu";
import TopBar from "./TopBar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [viewdMenu, setViewdMenu] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1200) {
      setViewdMenu(false);
    }
  }, []);

  return (
    <Column style={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      <Row style={{ height: "100%", width: "100%", minWidth: 0, minHeight: 0 }}>
        <Menu viewdMenu={viewdMenu} />
        <Column style={{ width: "100%", minWidth: 0, minHeight: 0 }}>
          <TopBar setViewdMenu={setViewdMenu} viewdMenu={viewdMenu} />
          <div
            style={{
              overflowY: "auto",
              overflowX: "hidden",
              height: "100%",
              width: "100%",
              minWidth: 0,
              minHeight: 0,
            }}
          >
            {children}
          </div>
        </Column>
      </Row>
    </Column>
  );
};

export default Layout;
