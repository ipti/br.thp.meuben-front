import { useContext } from "react";
import OverAge from "./OverAge";
import UnderAge from "./UnderAge";
import { RegisterContext } from "../../../../../Context/Register/context";
import { RegisterTypes } from "../../../../../Context/Register/type";
import { isUnder18ByBirthDate } from "../../../../../Utils/beneficiaryRules";

const StepTwo = () => {
  const props = useContext(RegisterContext) as RegisterTypes;
  const isUnder18 = isUnder18ByBirthDate(props.dataValues?.birthday);

  return <>{isUnder18 ? <UnderAge /> : <OverAge />}</>;
};

export default StepTwo;
