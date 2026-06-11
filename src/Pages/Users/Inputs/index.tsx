import DropdownComponent from "../../../Components/Dropdown";
import MaskInput from "../../../Components/InputMask";
import TextInput from "../../../Components/TextInput";
import {
  color_race,
  ROLE,
  typesex,
} from "../../../Controller/controllerGlobal";
import color from "../../../Styles/colors";
import { Padding } from "../../../Styles/styles";
import styled from "styled-components";

const InputWrapper = styled.div`
  .p-inputtext,
  .p-dropdown,
  .p-multiselect,
  input {
    height: 44px;
    width: 100%;
    box-sizing: border-box;
  }
`;

const ROLE_OPTIONS = [
  { id: ROLE.ADMIN, name: "Admin" },
  { id: ROLE.USER,  name: "Usuário" },
];

interface InputsUserProps {
  errors: any;
  handleChange: any;
  touched: any;
  values: any;
  basicOnly?: boolean;
}

const InputsUser = ({
  values,
  handleChange,
  errors,
  touched,
  basicOnly = false,
}: InputsUserProps) => {
  const isAdmin = values.role === ROLE.ADMIN;

  return (
    <InputWrapper>
      <div>
        <div className="grid">
          <div className="col-12 md:col-6">
            <label>Nome *</label>
            <Padding />
            <TextInput
              placeholder="Nome"
              value={values.name}
              onChange={handleChange}
              name="name"
            />
            <Padding />
            {errors.name && touched.name ? (
              <div style={{ color: color.red }}>
                {errors.name}
                <Padding />
              </div>
            ) : null}
          </div>

          <div className="col-12 md:col-6">
            <label>Usuário *</label>
            <Padding />
            <TextInput
              placeholder="Usuário"
              value={values.username}
              onChange={handleChange}
              name="username"
            />
            <Padding />
            {errors.username && touched.username ? (
              <div style={{ color: color.red }}>
                {errors.username}
                <Padding />
              </div>
            ) : null}
          </div>
        </div>
        <div className="grid">
          <div className="col-12 md:col-6">
            <label>Tipo de usuário *</label>
            <Padding />
            <DropdownComponent
              name="role"
              placerholder="Tipo de usuário"
              optionsLabel="name"
              optionsValue="id"
              value={values.role}
              onChange={handleChange}
              options={ROLE_OPTIONS}
            />
            <Padding />
            {errors.role && touched.role ? (
              <div style={{ color: color.red }}>
                {errors.role}
                <Padding />
              </div>
            ) : null}
          </div>
        </div>
        {!basicOnly && (
          <>
            <div className="grid">
              <div className="col-12 md:col-6">
                <div>
                  <label>Cor/Raça *</label>
                  <Padding />
                  <DropdownComponent
                    placerholder="Cor/Raça *"
                    value={values.color_race}
                    onChange={handleChange}
                    name="color_race"
                    optionsValue="id"
                    optionsLabel="name"
                    options={color_race}
                  />
                </div>
                {errors.color_race && touched.color_race ? (
                  <div style={{ color: color.red, marginTop: "8px" }}>
                    {errors.color_race}
                  </div>
                ) : null}
              </div>

              <div className="col-12 md:col-6">
                <div>
                  <label>Data de Nascimento *</label>
                  <Padding />
                  <MaskInput
                    mask="99/99/9999"
                    value={values.birthday?.toString()}
                    placeholder="Data de Nascimento"
                    name="birthday"
                    onChange={handleChange}
                  />
                </div>
                {errors.birthday && touched.birthday ? (
                  <div style={{ color: color.red, marginTop: "8px" }}>
                    {errors.birthday}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="grid">
              <div className="col-12 md:col-6">
                <label>Sexo *</label>
                <Padding />
                <DropdownComponent
                  placerholder="Sexo *"
                  optionsValue="id"
                  value={values.sex}
                  options={typesex}
                  name="sex"
                  onChange={handleChange}
                  optionsLabel="type"
                />
                {errors.sex && touched.sex ? (
                  <div style={{ color: color.red, marginTop: "8px" }}>{errors.sex}</div>
                ) : null}
              </div>
              <div className="col-12 md:col-6">
                <label>Data de inicio *</label>
                <Padding />
                <MaskInput
                  mask="99/99/9999"
                  placeholder="Data de inicio *"
                  name="initial_date"
                  value={values.initial_date}
                  onChange={handleChange}
                />
                {errors.initial_date && touched.initial_date ? (
                  <div style={{ color: color.red, marginTop: "8px" }}>
                    {errors.initial_date}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="grid">
              <div className="col-12 md:col-6">
                <label>Email *</label>
                <Padding />
                <TextInput
                  placeholder="Email"
                  value={values.email}
                  onChange={handleChange}
                  name="email"
                />
                {errors.email && touched.email ? (
                  <div style={{ color: color.red, marginTop: "8px" }}>{errors.email}</div>
                ) : null}
              </div>
              <div className="col-12 md:col-6">
                <label>Telefone para contato *</label>
                <Padding />
                <MaskInput
                  mask="(99) 9 9999-9999"
                  placeholder="Telefone *"
                  name="phone"
                  onChange={handleChange}
                  value={values.phone}
                />
                {errors.phone && touched.phone ? (
                  <div style={{ color: color.red, marginTop: "8px" }}>{errors.phone}</div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </InputWrapper>
  );
};

export default InputsUser;
