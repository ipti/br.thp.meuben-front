import styled from "styled-components";
import styles from ".";

interface PropsReverse {
  reverse?: boolean
}

export const Column = styled.div<PropsReverse>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;

  #space-between {
    justify-content: space-between;
  }
  #center {
    justify-content: center;
  }
  #start {
    justify-content: start;
  }
  #end {
    justify-content: end;
  }

  @media (max-width: 600px) {
    flex-direction: ${props => props.reverse ? "row" : "column"};
  }
`;

export const Row = styled.div<PropsReverse>`
  display: flex;
  flex-direction: row;
  min-width: 0;
  min-height: 0;

  #space-between {
    justify-content: space-between;
  }
  #center {
    justify-content: center;
  }
  #start {
    justify-content: start;
  }
  #end {
    justify-content: end;
  }

  @media (max-width: 600px) {
    flex-direction: ${props => props.reverse ? "column" : "row"};

  }
`;

interface PropsPadding {
  padding?: string;
}

export const Padding =styled.div<PropsPadding> `
    padding: ${(props: any) => props.padding || "4px"};
`;

export const Container = styled.div`
  min-height: 100%;
  height: auto;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  padding: clamp(12px, 2.2vw, 32px);
  font-size: ${styles.typography.font.medium};
  font-family: ${styles.typography.types.inter};
`;
