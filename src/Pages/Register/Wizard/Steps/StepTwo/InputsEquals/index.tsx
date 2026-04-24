import { useContext } from "react"
import CalendarComponent from "../../../../../../Components/Calendar"
import DropdownComponent from "../../../../../../Components/Dropdown"
import MaskInput from "../../../../../../Components/InputMask"
import RadioButtonComponent from "../../../../../../Components/RadioButton"
import { RegisterContext } from "../../../../../../Context/Register/context"
import { RegisterTypes } from "../../../../../../Context/Register/type"
import { Padding, Row } from "../../../../../../Styles/styles"
import { typesex } from "../../../../../../Controller/controllerGlobal"
import InputAddress from "../../../../../../Components/InputsAddress"
import { shouldRequireBeneficiaryPhone } from "../../../../../../Utils/beneficiaryRules"

const InputsEquals = ({ values, handleChange, errors, touched, setFieldValue }: { values: any, handleChange: any, errors: any, touched: any, setFieldValue: any }) => {

    const props = useContext(RegisterContext) as RegisterTypes;
    return (
        <>
            <Padding padding={props.padding} />
            <div>
                <label>Data de Nascimento *</label>
                <Padding />
                <CalendarComponent placeholder="Data de Nascimento *" name="birthday" dateFormat="dd/mm/yy" value={values.birthday} onChange={handleChange} />
            </div>
            {errors.birthday && touched.birthday ? (
                <div style={{ color: "red", marginTop: "8px" }}>{errors.birthday}</div>
            ) : null}
            <Padding padding={props.padding} />
            <div>
                <label>Sexo *</label>
                <Padding />
                <DropdownComponent placerholder="Sexo *" optionsValue="id" value={values.sex} options={typesex} name="sex" onChange={handleChange} optionsLabel="type" />
            </div>
            {errors.sex && touched.sex ? (
                <div style={{ color: "red", marginTop: "8px" }}>{errors.sex}</div>
            ) : null}
            <Padding padding={props.padding} />
            <div>
                <label>
                    Telefone para contato{shouldRequireBeneficiaryPhone(values.birthday) ? "*" : ""}
                </label>
                <Padding />
                <MaskInput mask="(99) 9 9999-9999" placeholder="Telefone *" name="telephone" onChange={handleChange} value={values.telephone} />
            </div>
            {errors.telephone && touched.telephone ? (
                <div style={{ color: "red", marginTop: "8px" }}>{errors.telephone}</div>
            ) : null}
            <Padding padding={props.padding} />

            <div>
                <label>Zona *</label>
                <Padding />
                <Row className="gap-2">
                    <RadioButtonComponent value={1} checked={values.zone === 1} onChange={handleChange} name="zone" label="Rural" />
                    <RadioButtonComponent value={2} checked={values.zone === 2} onChange={handleChange} name="zone" label="Urbana" />
                </Row>
            </div>
            {errors.zone && touched.zone ? (
                <div style={{ color: "red", marginTop: "8px" }}>{errors.zone}</div>
            ) : null}
            <Padding padding={props.padding} />
            <InputAddress
                errors={errors}
                handleChange={handleChange}
                setFieldValue={setFieldValue}
                touched={touched}
                values={values}
                showRequiredAsterisk
            />
        </>
    )
}

export default InputsEquals;
