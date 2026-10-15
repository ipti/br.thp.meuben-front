import styled from "styled-components";

export const Page = styled.main`
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const TopBar = styled.nav`
  display: flex;
  width: min(720px, calc(100% - 32px));
  margin: 0 auto;
  padding-top: 16px;

  a {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 8px 14px;
    border: 1px solid #d9e1ef;
    border-radius: 10px;
    background: #fff;
    color: #4264b5;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      border-color: #b8c7e2;
      background: #f8faff;
    }
  }
`;
