import styled from "styled-components";
import DropdownComponent from "../../../Components/Dropdown";
import MaskInput from "../../../Components/InputMask";
import MultiSelectComponet from "../../../Components/MultiSelect";
import TextInput from "../../../Components/TextInput";
import { color_race, typesex } from "../../../Controller/controllerGlobal";
import { useFetchRequestSocialTechnologyLists } from "../../../Services/SocialTechnology/query";
import color from "../../../Styles/colors";
import { Padding } from "../../../Styles/styles";

const InputWrapper = styled.div`
  .p-inputtext,
  .p-dropdown,
  input {
    height: 44px;
    width: 100%;
    box-sizing: border-box;
  }
`;

const TYPE_OPTIONS = [
  { id: "COORDINATOR", name: "Coordenador" },
  { id: "REAPPLICATOR", name: "Reaplicador" },
];

interface ProfileInputsProps {
  errors: any;
  handleChange: any;
  setFieldValue?: (field: string, value: any) => void;
  touched: any;
  values: any;
  isEditing?: boolean;
  originalType?: "COORDINATOR" | "REAPPLICATOR";
}

const ProfileInputs = ({
  values,
  handleChange,
  setFieldValue,
  errors,
  touched,
  isEditing,
  originalType,
}: ProfileInputsProps) => {
  const { data: socialTechnologies } = useFetchRequestSocialTechnologyLists();
  const typeChanged =
    isEditing && originalType && values.current_type !== originalType;

  return (
    <InputWrapper>
      <div className="grid">

        <div className="col-12 md:col-6">
          <label>Nome *</label>
          <Padding />
          <TextInput
            placeholder="Nome completo"
            value={values.name}
            onChange={handleChange}
            name="name"
          />
          <Padding />
          {errors.name && touched.name && (
            <div style={{ color: color.red }}>{errors.name}</div>
          )}
        </div>

        <div className="col-12 md:col-6">
          <label>Tipo *</label>
          <Padding />
          <DropdownComponent
            name="current_type"
            placerholder="Tipo de perfil"
            optionsLabel="name"
            optionsValue="id"
            value={values.current_type}
            onChange={handleChange}
            options={TYPE_OPTIONS}
          />
          <Padding />
          {errors.current_type && touched.current_type && (
            <div style={{ color: color.red }}>{errors.current_type}</div>
          )}
        </div>

        {typeChanged && (
          <div className="col-12">
            <label>Motivo da alteração de tipo (opcional)</label>
            <Padding />
            <TextInput
              placeholder="Ex: Promovido a coordenador"
              value={values.reason ?? ""}
              onChange={handleChange}
              name="reason"
            />
          </div>
        )}

        <div className="col-12 md:col-6">
          <label>E-mail</label>
          <Padding />
          <TextInput
            placeholder="E-mail"
            value={values.email ?? ""}
            onChange={handleChange}
            name="email"
          />
          <Padding />
          {errors.email && touched.email && (
            <div style={{ color: color.red }}>{errors.email}</div>
          )}
        </div>

        <div className="col-12 md:col-6">
          <label>Telefone</label>
          <Padding />
          <MaskInput
            mask="(99) 9 9999-9999"
            placeholder="(99) 9 9999-9999"
            name="phone"
            value={values.phone ?? ""}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 md:col-6">
          <label>Data de Nascimento *</label>
          <Padding />
          <MaskInput
            mask="99/99/9999"
            placeholder="DD/MM/AAAA"
            name="birthday"
            value={values.birthday ?? ""}
            onChange={handleChange}
          />
          <Padding />
          {errors.birthday && touched.birthday && (
            <div style={{ color: color.red }}>{errors.birthday}</div>
          )}
        </div>

        <div className="col-12 md:col-6">
          <label>Data de Início</label>
          <Padding />
          <MaskInput
            mask="99/99/9999"
            placeholder="DD/MM/AAAA"
            name="initial_date"
            value={values.initial_date ?? ""}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 md:col-6">
          <label>Sexo *</label>
          <Padding />
          <DropdownComponent
            name="sex"
            placerholder="Sexo"
            optionsLabel="type"
            optionsValue="id"
            value={values.sex}
            onChange={handleChange}
            options={typesex}
          />
          <Padding />
          {errors.sex && touched.sex && (
            <div style={{ color: color.red }}>{errors.sex}</div>
          )}
        </div>

        <div className="col-12 md:col-6">
          <label>Cor/Raça *</label>
          <Padding />
          <DropdownComponent
            name="color_race"
            placerholder="Cor/Raça"
            optionsLabel="name"
            optionsValue="id"
            value={values.color_race}
            onChange={handleChange}
            options={color_race}
          />
          <Padding />
          {errors.color_race && touched.color_race && (
            <div style={{ color: color.red }}>{errors.color_race}</div>
          )}
        </div>

        <div className="col-12">
          <label>Tecnologias Sociais</label>
          <Padding />
          <MultiSelectComponet
            name="social_technologies"
            placerholder="Selecione as tecnologias sociais"
            optionsLabel="name"
            optionsValue="id"
            value={values.social_technologies ?? []}
            onChange={(e) => setFieldValue?.("social_technologies", e.value)}
            options={socialTechnologies ?? []}
          />
        </div>

      </div>
    </InputWrapper>
  );
};

export default ProfileInputs;
