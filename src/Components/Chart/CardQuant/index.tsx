import styles from "../../../Styles";
import { Column } from "../../../Styles/styles";
import ring_card_orange from "../../../Assets/images/ring_card_orange.svg";
import ring_card_blue from "../../../Assets/images/ring_card_blue.svg";
import ring_card_navy_blue from "../../../Assets/images/ring_card_navy_blue.svg";


const CardQuant = ({ title, quant, color }: { title: string; quant: number | string, color?: "orange"| "blue"| "navy_blue" }) => {
  const ringCardImage = 
      color === "blue"? ring_card_orange // Usar ring_card_orange se for azul
    : color === "navy_blue" ? ring_card_blue // Usar ring_card_blue se for navy_blue
    : ring_card_navy_blue; // Usar ring_card_navy_blue se for orange

  return (
    <div className="card" style={{background: color === "blue" ? styles.colors.colorsBaseProductNormalActive : color === "orange" ? styles.colors.colorCardOrange : color === "navy_blue" ? styles.colors.colorNavyBlue : "", minHeight: 100, height: "70%", borderRadius: "20px", padding:"16px 0px",position: "relative", zIndex: 1}}>
      <Column id="space-between" style={{alignItems: "center", height: "100%", zIndex: 3}}>
        <h3 style={{textAlign: "center", color: "white", fontSize: 12, zIndex: 3, width: '90%'}}>{title}</h3>
        <h1 style={{color: "white", fontSize: 28, zIndex: 3}}>{quant}</h1>
      </Column>
      <img
        src={ringCardImage} 
        alt="Ring Card"
        style={{
          position: "absolute",
          bottom: "0px",          
          right: "0px", 
          width: "50px",
          height: "50px",
          borderRadius: "0px 0px 32px 0px",
          zIndex: 2,
          opacity: "1", 
        }}
      />
    </div>
  );
};

export default CardQuant;
