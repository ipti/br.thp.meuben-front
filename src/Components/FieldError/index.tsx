import color from "../../Styles/colors";

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: color.red, marginTop: "6px", fontSize: "13px" }}>
      <i className="pi pi-times-circle" style={{ fontSize: "13px" }} />
      <span>{message}</span>
    </div>
  );
};

export default FieldError;
