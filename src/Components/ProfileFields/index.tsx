import styled from "styled-components";
import DropdownComponent from "../Dropdown";
import MaskInput from "../InputMask";
import MultiSelectComponet from "../MultiSelect";
import TextInput from "../TextInput";
import { color_race, typesex } from "../../Controller/controllerGlobal";
import { getProfileTypeOptions, isSocialProfile } from "../../hooks/useProfileFieldRules";
import { useFetchRequestSocialTechnologyLists } from "../../Services/SocialTechnology/query";
import color from "../../Styles/colors";
import { Padding } from "../../Styles/styles";
import { ProfileType } from "../../Controller/controllerGlobal";

const InputWrapper = styled.div`
  .p-inputtext,
  .p-dropdown,
  input {
    height: 44px;
    width: 100%;
    box-sizing: border-box;
  }
`;

interface ProfileFieldsProps {
  errors: any;
  handleChange: any;
  setFieldValue?: (field: string, value: any) => void;
  touched: any;
  values: any;
  /** 'reapplicator' = tipo fixo (dropdown oculto); 'full' = dropdown de tipo visível */
  mode: "reapplicator" | "full";
  isEditing?: boolean;
  originalType?: ProfileType;
  /** Oculta o campo nome quando o componente pai já o exibe (ex: EditUser/CreateUser) */
  hideName?: boolean;
}

const ProfileFields = ({
  values,
  handleChange,
  setFieldValue,
  errors,
  touched,
  mode,
  isEditing,
  originalType,
  hideName,
}: ProfileFieldsProps) => {
  const { data: socialTechnologies } = useFetchRequestSocialTechnologyLists();

  const isReapplicator = mode === "reapplicator" || isSocialProfile(values.current_type);
  const typeChanged = isEditing && originalType && values.current_type !== originalType;
  const typeOptions = getProfileTypeOptions(true);

  return (
    <InputWrapper>
      <div className="grid">

        {/* Dropdown de tipo — oculto no modo reaplicador (tipo já fixo) */}
        {mode === "full" && (
          <div className="col-12 md:col-6">
            <label>Tipo de perfil *</label>
            <Padding />
            <DropdownComponent
              name="current_type"
              placerholder="Selecione o tipo"
              optionsLabel="name"
              optionsValue="id"
              value={values.current_type}
              onChange={handleChange}
              options={typeOptions}
            />
            <Padding />
            {errors.current_type && touched.current_type && (
              <div style={{ color: color.red }}>{errors.current_type}</div>
            )}
          </div>
        )}

        {/* Motivo da mudança de tipo — só em edição quando tipo muda */}
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

        {/* Nome — sempre obrigatório (omitido quando pai já exibe) */}
        {!hideName && (
          <div className="col-12 md:col-6">
            <label>Nome completo *</label>
            <Padding />
            <TextInput
              placeholder="Nome completo"
              value={values.name ?? ""}
              onChange={handleChange}
              name="name"
            />
            <Padding />
            {errors.name && touched.name && (
              <div style={{ color: color.red }}>{errors.name}</div>
            )}
          </div>
        )}

        {/* E-mail — obrigatório para não-reaplicador, opcional para reaplicador */}
        <div className="col-12 md:col-6">
          <label>E-mail {!isReapplicator ? "*" : ""}</label>
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

        {/* Telefone — obrigatório para reaplicador, opcional para demais */}
        <div className="col-12 md:col-6">
          <label>Telefone {isReapplicator ? "*" : ""}</label>
          <Padding />
          <MaskInput
            mask="(99) 9 9999-9999"
            placeholder="(99) 9 9999-9999"
            name="phone"
            value={values.phone ?? ""}
            onChange={handleChange}
          />
          <Padding />
          {errors.phone && touched.phone && (
            <div style={{ color: color.red }}>{errors.phone}</div>
          )}
        </div>

        {/* Data de nascimento — obrigatória para reaplicador, opcional para demais */}
        <div className="col-12 md:col-6">
          <label>Data de Nascimento {isReapplicator ? "*" : ""}</label>
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

        {/* Gênero — obrigatório para reaplicador, opcional para demais */}
        <div className="col-12 md:col-6">
          <label>Gênero {isReapplicator ? "*" : ""}</label>
          <Padding />
          <DropdownComponent
            name="sex"
            placerholder="Gênero"
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

        {/* Cor/Raça — obrigatória para reaplicador, opcional para demais */}
        <div className="col-12 md:col-6">
          <label>Cor/Raça {isReapplicator ? "*" : ""}</label>
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

        {/* Data de início — sempre opcional */}
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

        {/* Tecnologias Sociais — sempre obrigatório (mínimo 1) */}
        <div className="col-12">
          <label>Tecnologias Sociais *</label>
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
          <Padding />
          {errors.social_technologies && touched.social_technologies && (
            <div style={{ color: color.red }}>{errors.social_technologies}</div>
          )}
        </div>

      </div>
    </InputWrapper>
  );
};

export default ProfileFields;
