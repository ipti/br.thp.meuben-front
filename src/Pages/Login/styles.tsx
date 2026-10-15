import styled from "styled-components";
import typography from "../../Styles/typography";
import color from "../../Styles/colors";
import Background from "../../Assets/images/background-signup.png";
import styles from "../../Styles";

export const ContainerLogin = styled.div`
  width: 100%;
  font-family: ${typography.types.light};
  background-repeat: no-repeat;
  background-position: right top;
  position: fixed;
  inset: 0;
  height: 100dvh;
  overflow: hidden;

  .loginColumn {
    height: 100dvh;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .loginColumn::-webkit-scrollbar {
    display: none;
  }

  .loginPanelBody {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    min-height: calc(100dvh - 110px);
    height: auto;
    padding-bottom: 32px;
    box-sizing: border-box;
  }

  .loginContent {
    width: 100%;
    max-width: 620px;
    margin-top: auto;
    margin-bottom: auto;
    padding-bottom: 32px;
  }

  .loginLogo img {
    width: min(330px, 78%);
    height: auto;
  }

  .microsoftAccess {
    position: relative;
    overflow: hidden;
    margin-top: 28px;
    padding: 24px 28px 26px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    text-align: center;
  }

  .microsoftRed {
    background-color: #f25022;
  }

  .microsoftGreen {
    background-color: #7fba00;
  }

  .microsoftBlue {
    background-color: #00a4ef;
  }

  .microsoftYellow {
    background-color: #ffb900;
  }

  .recommendedAccess {
    display: inline-flex;
    align-items: center;
    margin-bottom: 8px;
    color: #64748b;
    font-family: ${typography.types.bold};
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .microsoftAccess h1 {
    margin: 0;
    color: #1f2937;
    font-family: ${typography.types.bold};
    font-size: 22px;
    line-height: 1.3;
  }

  .microsoftAccess p {
    max-width: 420px;
    margin: 8px auto 20px;
    color: #5f6f86;
    font-family: ${typography.types.inter};
    font-size: 14px;
    line-height: 1.5;
  }

  .microsoftLoginButton {
    display: grid;
    grid-template-columns: 34px 1fr 18px;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 56px;
    padding: 10px 18px;
    border: 1px solid #0067b8;
    border-radius: 10px;
    background: #0078d4;
    color: #fff;
    box-shadow: 0 5px 12px rgba(0, 103, 184, 0.16);
    cursor: pointer;
    font-family: ${typography.types.bold};
    font-size: 16px;
    transition: background-color 160ms ease, box-shadow 160ms ease,
      transform 160ms ease;
  }

  .microsoftLoginButton:hover {
    background: #006cbe;
    box-shadow: 0 7px 16px rgba(0, 103, 184, 0.22);
    transform: translateY(-1px);
  }

  .microsoftLoginButton:focus-visible {
    outline: 3px solid rgba(0, 120, 212, 0.3);
    outline-offset: 3px;
  }

  .microsoftLoginButton .pi-arrow-right {
    justify-self: end;
    font-size: 14px;
  }

  .microsoftMark {
    display: grid;
    grid-template-columns: repeat(2, 10px);
    grid-template-rows: repeat(2, 10px);
    gap: 2px;
    width: 28px;
    height: 28px;
    padding: 3px;
    border-radius: 4px;
    background: #fff;
  }

  .microsoftMark span {
    display: block;
  }

  .microsoftError {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    margin-top: 14px;
    padding: 10px 12px;
    border: 1px solid #fecaca;
    border-radius: 8px;
    background: #fff5f5;
    color: #b42318;
    font-family: ${typography.types.inter};
    font-size: 13px;
    line-height: 1.4;
    text-align: left;
  }

  .microsoftError .pi {
    margin-top: 2px;
  }

  .loginDivider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 24px 0 20px;
    color: #7a8699;
    font-family: ${typography.types.inter};
    font-size: 12px;
    white-space: nowrap;
  }

  .loginDivider::before,
  .loginDivider::after {
    width: 100%;
    height: 1px;
    background: #d9dee7;
    content: "";
  }

  .localLoginForm label {
    color: #4b5563;
    font-family: ${typography.types.inter};
    font-size: 14px;
  }

  .localLoginButton.p-button {
    width: 100%;
    min-height: 46px;
    border: 1px solid #98a2b3;
    background: #fff;
    color: #526176;
    box-shadow: none;
  }

  .localLoginButton.p-button:hover {
    border-color: #667085;
    background: #f8fafc;
    color: #344054;
  }

  .accessHelpActions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 18px;
    padding: 4px 0 12px;

    a {
      color: #4f6388;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;

      &:hover {
        color: #1f64bd;
        text-decoration: underline;
      }
    }
  }

  @media (max-width: 991px) {
    .loginContent {
      max-width: 600px;
    }
  }

  @media (max-width: 575px) {
    .microsoftAccess {
      margin-top: 22px;
      padding: 24px 18px 22px;
    }

    .microsoftAccess h1 {
      font-size: 20px;
    }

    .loginDivider {
      gap: 10px;
    }
  }

  .TextLarge {
    font-family: ${styles.typography.types.bold};
    font-size: 45.85px;
    font-weight: 800;
    line-height: 46.54px;
    text-align: left;
  }

  .divBlue {
    background: linear-gradient(0deg, #336ae9, #336ae9);
    opacity: 0.6;
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 0;
    border-bottom-left-radius: 40px;
    border-top-left-radius: 40px;
  }

  .imgBack {
    height: 100%;
    font-size: ${typography.font.small};
    color: ${color.white};
    background: url(${Background});
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    position: fixed;
    border-bottom-left-radius: 40px;
    border-top-left-radius: 40px;
  }

  .formSignUp {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    z-index: 100;
  }

  .resetPassword {
    color: ${color.blue};
    z-index: 100;
    font-size: ${typography.font.small};
    font-family: ${typography.types.inter};
    padding-top: 40;
    padding-bottom: 40;
    margin-right: 20;
    display: flex;
    flex-direction: column;
    justify-content: start;
    width: 280px;
  }
  .buttonLogin {
    margin-top: 30px;
    border-style: solid;
    border-width: 2px;
    border-radius: 25px;
    padding: 10px;
    font-family: ${typography.types.regular};
  }

  .link {
    font-family: ${typography.types.bold};
    color: ${color.blue};
    text-decoration: none;
    margin-left: 5px;
  }

  .pLogin {
    font-family: ${styles.typography.types.inter};
    font-size: 16.25px;
    font-weight: 500;
    line-height: 20.9px;
    text-align: left;
  }
  #titleLogin {
    text-align: center;
    font-size: 24px;
    margin-bottom: -15px;
    color: ${color.colorsBaseInkNormal};
    font-family: ${typography.types.inter};
    font-weight: bold;
  }

  #subTitleLogin {
    text-align: center;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    font-family: ${typography.types.inter};
    color: ${color.colorsBaseInkLight};
  }

  #margin {
    margin: 20px;
    position: absolute;
  }

  #resetPassword {
    color: ${color.grayClear};
    font-size: ${typography.font.small};
    margin-top: 30;
    margin-bottom: 30;
    width: 100%;
  }
  #textCenter {
    text-align: "center";
  }
  #link {
    font-family: ${typography.types.bold};
    color: ${color.gray};
    text-decoration: none;
    margin-left: 20;
  }
`;
export const TopColors = styled.div<{ color: string }>`
  width: 25%;
  height: 4px;
  background: ${(props) => props.color};
`;
