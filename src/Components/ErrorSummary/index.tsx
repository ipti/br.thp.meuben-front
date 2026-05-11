import color from "../../Styles/colors";

const ErrorSummary = ({ errors }: { errors: string[] }) => {
  if (errors.length === 0) return null;
  return (
    <div
      style={{
        background: color.colorCardRed,
        border: `1px solid ${color.red}`,
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <i className="pi pi-exclamation-circle" style={{ color: color.red, fontSize: "18px" }} />
        <strong style={{ color: color.red, fontSize: "15px" }}>
          Corrija os seguintes erros antes de continuar:
        </strong>
      </div>
      <ul style={{ margin: 0, paddingLeft: "20px" }}>
        {errors.map((error, index) => (
          <li key={index} style={{ color: color.red, marginBottom: "4px", fontSize: "14px" }}>
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorSummary;
