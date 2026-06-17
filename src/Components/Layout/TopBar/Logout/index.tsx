import { logout } from "../../../../Services/localstorage";
import { Container } from "./style";

const LogoutTopBar = () => {
    return (
        <Container onClick={() => { logout(); window.location.reload() }}>
            <i className="pi pi-sign-out" />
            <span>Sair</span>
        </Container>
    );
};

export default LogoutTopBar;