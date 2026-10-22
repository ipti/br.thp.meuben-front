import styled from "styled-components";

export const ReportActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin: 12px 0 20px;
`;

export const FilterPanel = styled.section`
  padding: 16px;
  margin-bottom: 18px;
  border: 1px solid #e1e6ef;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(31, 41, 55, 0.04);
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 2fr) minmax(150px, 1fr) minmax(
      220px,
      1.4fr
    ) auto;
  align-items: end;
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    color: #4b5870;
    font-size: 0.78rem;
    font-weight: 700;
  }
`;

export const ReportSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
`;

export const SummaryItem = styled.div`
  min-width: 150px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f5f7fb;
  color: #536078;
  font-size: 0.82rem;

  strong {
    display: block;
    margin-top: 2px;
    color: #253c78;
    font-size: 1.05rem;
  }
`;

export const ExpansionContent = styled.div`
  padding: 8px 12px 14px 58px;

  h4 {
    margin: 0 0 10px;
    color: #344054;
  }

  @media (max-width: 600px) {
    padding-left: 12px;
  }
`;

export const EmptyHint = styled.span`
  color: #8a94a6;
`;

export const UpdatingHint = styled.span`
  color: #667085;
  font-size: 0.82rem;
`;
