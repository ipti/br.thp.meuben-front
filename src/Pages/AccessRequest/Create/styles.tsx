import styled from "styled-components";

export const Page = styled.main`
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  background:
    radial-gradient(circle at 8% 4%, rgba(242, 80, 34, 0.07), transparent 24rem),
    radial-gradient(circle at 92% 8%, rgba(0, 120, 215, 0.08), transparent 26rem),
    #f7f9fc;
  color: #20283a;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  * {
    box-sizing: border-box;
  }
`;

export const Shell = styled.div`
  width: min(920px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 48px;

  @media (max-width: 640px) {
    width: min(100% - 20px, 920px);
    padding-top: 18px;
  }
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;

  img {
    width: 145px;
    height: auto;
  }

  a {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 8px 14px;
    border: 1px solid #d9e1ef;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.82);
    color: #4264b5;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      border-color: #b8c7e2;
      background: #fff;
    }
  }
`;

export const Card = styled.section`
  overflow: hidden;
  border: 1px solid #e3e8f1;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 18px 45px rgba(40, 55, 90, 0.08);
`;

export const CardHeader = styled.div`
  padding: clamp(22px, 4vw, 38px);
  border-bottom: 1px solid #edf0f6;
  background: linear-gradient(115deg, #ffffff 0%, #f5f8ff 100%);

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    color: #49618f;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0 0 8px;
    color: #1c2638;
    font-size: clamp(24px, 4vw, 34px);
    line-height: 1.18;
    text-transform: none;
  }

  p {
    max-width: 680px;
    margin: 0;
    color: #647087;
    line-height: 1.6;
  }
`;

export const Progress = styled.ol`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 0;
  padding: 18px clamp(22px, 4vw, 38px);
  border-bottom: 1px solid #edf0f6;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8a94a7;
    font-size: 12px;
    font-weight: 600;
  }

  span {
    display: grid;
    flex: 0 0 25px;
    width: 25px;
    height: 25px;
    place-items: center;
    border: 1px solid #d6ddea;
    border-radius: 50%;
    background: #fff;
  }

  li.active,
  li.done {
    color: #2459b3;
  }

  li.active span,
  li.done span {
    border-color: #2867c7;
    background: #2867c7;
    color: #fff;
  }

  @media (max-width: 640px) {
    li {
      justify-content: center;
    }

    li strong {
      display: none;
    }
  }
`;

export const Content = styled.div`
  padding: clamp(22px, 4vw, 38px);

  h2 {
    margin: 0 0 8px;
    color: #20283a;
    font-size: 21px;
  }

  .lead {
    margin: 0 0 24px;
    color: #68748a;
    line-height: 1.55;
  }
`;

export const IdentityBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 22px;
  padding: 16px;
  border: 1px solid #cae0f5;
  border-radius: 12px;
  background: #f4f9fe;

  .mark {
    display: grid;
    grid-template-columns: 8px 8px;
    grid-template-rows: 8px 8px;
    gap: 2px;
    margin-top: 3px;
  }

  .mark i:nth-child(1) { background: #f25022; }
  .mark i:nth-child(2) { background: #7fba00; }
  .mark i:nth-child(3) { background: #00a4ef; }
  .mark i:nth-child(4) { background: #ffb900; }

  strong,
  small {
    display: block;
  }

  small {
    margin-top: 3px;
    color: #617089;
  }
`;

export const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

export const Choice = styled.label<{ $selected?: boolean }>`
  display: flex;
  min-height: 94px;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 1.5px solid ${props => props.$selected ? "#2b68c7" : "#dfe4ed"};
  border-radius: 12px;
  background: ${props => props.$selected ? "#f4f8ff" : "#fff"};
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: #7da2dc;
  }

  input {
    margin-top: 3px;
    accent-color: #2867c7;
  }

  strong,
  small {
    display: block;
  }

  small {
    margin-top: 5px;
    color: #737e92;
    line-height: 1.4;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  .full {
    grid-column: 1 / -1;
  }

  @media (max-width: 650px) {
    grid-template-columns: 1fr;

    .full {
      grid-column: auto;
    }
  }
`;

export const Field = styled.div`
  label,
  .label {
    display: block;
    margin-bottom: 7px;
    color: #30394b;
    font-size: 14px;
    font-weight: 600;
  }

  input:not([type="checkbox"]):not([type="radio"]),
  select,
  textarea {
    width: 100%;
    min-height: 46px;
    padding: 10px 12px;
    border: 1px solid #ced5e1;
    border-radius: 9px;
    background: #fff;
    color: #20283a;
    font: inherit;
  }

  input:disabled {
    background: #f1f4f8;
    color: #556277;
  }

  textarea {
    min-height: 112px;
    resize: vertical;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: #2867c7;
    box-shadow: 0 0 0 3px rgba(40, 103, 199, 0.12);
    outline: none;
  }

  .hint {
    display: block;
    margin-top: 6px;
    color: #7a8497;
    font-size: 12px;
    line-height: 1.4;
  }
`;

export const CheckList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
  padding: 14px;
  border: 1px solid #e1e6ee;
  border-radius: 10px;

  label {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    color: #485368;
    font-size: 14px;
    cursor: pointer;
  }

  input {
    margin-top: 3px;
    accent-color: #2867c7;
  }

  @media (max-width: 580px) {
    grid-template-columns: 1fr;
  }
`;

export const Alert = styled.div<{ $tone?: "error" | "info" | "success" }>`
  margin: 0 0 20px;
  padding: 14px 16px;
  border: 1px solid ${props => props.$tone === "error" ? "#f2b7b4" : props.$tone === "success" ? "#aadbbf" : "#bdd4f3"};
  border-radius: 10px;
  background: ${props => props.$tone === "error" ? "#fff5f4" : props.$tone === "success" ? "#f0fbf4" : "#f3f8ff"};
  color: ${props => props.$tone === "error" ? "#a82b26" : props.$tone === "success" ? "#176b39" : "#2d568f"};
  line-height: 1.5;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;

  .right {
    display: flex;
    gap: 10px;
    margin-left: auto;
  }

  button,
  a {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 18px;
    border: 1px solid #ccd4e1;
    border-radius: 9px;
    background: #fff;
    color: #42516a;
    font: inherit;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }

  button.primary,
  a.primary {
    border-color: #2867c7;
    background: #2867c7;
    color: #fff;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  @media (max-width: 520px) {
    flex-direction: column-reverse;

    .right,
    button,
    a {
      width: 100%;
    }
  }
`;

export const Review = styled.div`
  display: grid;
  gap: 14px;

  article {
    padding: 16px;
    border: 1px solid #e3e8f0;
    border-radius: 10px;
  }

  h3 {
    margin: 0 0 10px;
    color: #56647c;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 18px;
    margin: 0;
  }

  dt {
    color: #7a8497;
    font-size: 12px;
  }

  dd {
    margin: 2px 0 0;
    color: #283247;
    font-size: 14px;
    overflow-wrap: anywhere;
  }

  @media (max-width: 580px) {
    dl {
      grid-template-columns: 1fr;
    }
  }
`;

export const Secret = styled.div`
  margin: 20px 0;
  padding: 18px;
  border: 1px dashed #7b94bd;
  border-radius: 12px;
  background: #f6f9ff;

  code {
    display: block;
    margin-top: 8px;
    padding: 10px;
    border-radius: 8px;
    background: #e9eff9;
    color: #1f3458;
    font-size: 14px;
    overflow-wrap: anywhere;
    user-select: all;
  }
`;
