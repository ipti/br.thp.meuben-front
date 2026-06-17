import styled from "styled-components";
import styles from "../../../../Styles";

export const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    color: ${styles.colors.colorGrayElephant};
    font-size: 13px;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;

    &:hover {
        background-color: #fee2e2;
        color: #dc2626;

        i {
            color: #dc2626;
        }
    }

    i {
        font-size: 14px;
        color: ${styles.colors.colorGrayElephant};
        transition: color 0.15s;
    }
`;