import styled from "styled-components";
import styles from "../../Styles";


interface PropsActive {
    active: boolean;
    isMobile?: boolean;
}

export const Container = styled.div<PropsActive>`
    background-color: ${styles.colors.colorsBaseProductLighter};
    min-width: 256px;
    height: 100%;
    display: ${props => props.active ? "flex" : "none"};
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;

    ${props => props.isMobile && `
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        z-index: 100;
    `}
`;

export const MenuScrollArea = styled.div`
    flex: 1;
    overflow-y: auto;
`;

export const TopBar = styled.div`
    width: 25%;
    height: 4px
`;