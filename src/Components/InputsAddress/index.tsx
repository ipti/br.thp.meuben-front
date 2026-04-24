import axios from "axios";
import { useEffect, useState } from "react";
import { useFetchRequestState } from "../../Services/Address/query";
import { StateList } from "../../Services/Address/type";
import { Padding } from "../../Styles/styles";
import DropdownComponent from "../Dropdown";
import MaskInput from "../InputMask";
import TextInput from "../TextInput";


const InputAddressState = () => {

    const [state, setState] = useState<StateList | undefined>();
    const [stateId, setStateId] = useState<number | undefined>()


    const { data: stateRequest } = useFetchRequestState()


    useEffect(() => {
        if (stateRequest) {
            setState(stateRequest)
        }
    }, [stateRequest])


    const dadosCep = async (value: string, setFieldValue: any) => {
        if (value) {

            const cep = value.replace(/[^a-zA-Z0-9 ]/g, '');

            await axios.get("https://viacep.com.br/ws/" + cep + "/json/").then((data) => {
                const stateCep = state?.find(props => props.acronym === data.data.uf)
                const cityCep = stateCep?.city.find(props => props.name === data.data.localidade.toUpperCase())

                setFieldValue("address", data.data.logradouro);
                setFieldValue("neighborhood", data.data.bairro);
                setFieldValue("complement", data.data.complemento);
                setFieldValue("state", stateCep?.id)
                setFieldValue("city", cityCep?.id)
            }).catch(
                (error) => {
                    return error
                }
            )
        }
    }

    return { dadosCep, state, setStateId, stateId }
}

const InputAddress = ({
    errors,
    handleChange,
    touched,
    values,
    setFieldValue,
    showRequiredAsterisk = false,
}: {
    values: any,
    handleChange: any,
    errors: any,
    touched: any,
    setFieldValue: any,
    showRequiredAsterisk?: boolean
}) => {

    const props = InputAddressState();

    useEffect(() => {
        if (values.state) {
            props.setStateId(values.state)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.state])


    return (
        <div className="grid">
            <div className="col-12 md:col-6">
                <label>CEP </label>
                <Padding />
                <MaskInput
                    value={values.cep}
                    mask="99999-999"
                    placeholder="Cep"
                    onChange={(e) => {
                        setFieldValue("cep", e.target.value)
                        props.dadosCep(e.target.value!, setFieldValue)
                    }}
                    name="cep"
                />
                {errors.cep && touched.cep ? (
                    <div style={{ color: "red", marginTop: "8px" }}>
                        {errors.cep}
                    </div>
                ) : null}
            </div>
            <div className="col-12 md:col-6">
                <label>Endereço {showRequiredAsterisk ? "*" : ""}</label>
                <Padding />
                <TextInput
                    value={values.address}
                    placeholder="Endereço"
                    onChange={handleChange}
                    name="address"
                />
                {errors.address ? (
                    <div style={{ color: "red", marginTop: "8px" }}>
                        {errors.address}
                    </div>
                ) : null}
            </div>
            <div className="col-12 md:col-6">
                <label>Bairro/Povoado {showRequiredAsterisk ? "*" : ""}</label>
                <Padding />
                <TextInput
                    value={values.neighborhood}
                    placeholder="Bairro/Povoado"
                    onChange={handleChange}
                    name="neighborhood"
                />
                {errors.neighborhood ? (
                    <div style={{ color: "red", marginTop: "8px" }}>
                        {errors.neighborhood}
                    </div>
                ) : null}
            </div>
            <div className="col-12 md:col-6">
                <label>Complemento </label>
                <Padding />
                <TextInput
                    value={values.complement}
                    placeholder="Complemento"
                    onChange={handleChange}
                    name="complement"
                />
                {errors.complement && touched.complement ? (
                    <div style={{ color: "red", marginTop: "8px" }}>
                        {errors.complement}
                    </div>
                ) : null}
            </div>
            {props.state && <>
                <div className="col-12 md:col-6">
                    <label>Estado {showRequiredAsterisk ? "*" : ""}</label>
                    <Padding />
                    <DropdownComponent
                        value={values.state}
                        placerholder="Estado"
                        name="state"
                        optionsValue="id"
                        onChange={(e) => {
                            setFieldValue("state", e.target.value)
                            props.setStateId(e.target.value.id)
                        }}
                        options={props.state}
                    />
                    {errors.state ? (
                        <div style={{ color: "red", marginTop: "8px" }}>
                            {errors.state}
                        </div>
                    ) : null}
                </div>
                {props.stateId && <div className="col-12 md:col-6">
                    <label>Cidade {showRequiredAsterisk ? "*" : ""}</label>
                    <Padding />
                    <DropdownComponent
                        value={values.city}
                        placerholder="Cidade"
                        name="city"
                        optionsValue="id"
                        onChange={handleChange}
                        options={props.state.find(item => item.id === props.stateId)?.city}
                    />
                    {errors.city ? (
                        <div style={{ color: "red", marginTop: "8px" }}>
                            {errors.city}
                        </div>
                    ) : null}
                </div>}
            </>}
        </div>
    )
}

export default InputAddress
