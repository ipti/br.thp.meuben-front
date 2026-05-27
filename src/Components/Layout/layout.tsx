import React, { useEffect, useState } from "react";
import { Column, Row } from "../../Styles/styles";
import Menu from "../Menu";
import TopBar from "./TopBar";

const MOBILE_BREAKPOINT = 1200;

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [viewdMenu, setViewdMenu] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) setViewdMenu(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Column style={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      <Row style={{ height: "100%", width: "100%", minWidth: 0, minHeight: 0, position: "relative" }}>
        <Menu viewdMenu={viewdMenu} isMobile={isMobile} />
        {/* Overlay para fechar menu no mobile tocando fora */}
        {isMobile && viewdMenu && (
          <div
            onClick={() => setViewdMenu(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99,
              background: "rgba(0,0,0,0.4)",
            }}
          />
        )}
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
