import * as Yup from "yup";
import { ROLE } from "../../../Controller/controllerGlobal";
import {
  requiresInstitutionalEmail,
  requiresPhone,
  requiresSocialDemographics,
} from "../../../hooks/useProfileFieldRules";

const accessSchema = {
  name: Yup.string()
    .trim()
    .required("Nome é obrigatório")
    .min(3, "Mínimo 3 caracteres"),
  username: Yup.string()
    .trim()
    .required("Usuário é obrigatório")
    .min(5, "Mínimo 5 caracteres")
    .max(32, "Máximo 32 caracteres"),
  password: Yup.string()
    .required("Senha é obrigatória")
    .min(8, "Mínimo 8 caracteres")
    .max(60, "Máximo 60 caracteres"),
  confirmPassword: Yup.string()
    .required("Confirmação é obrigatória")
    .oneOf([Yup.ref("password")], "As senhas não coincidem"),
  role: Yup.string().required("Tipo de usuário é obrigatório"),
};

const profileBaseSchema = {
  current_type: Yup.string().required("Tipo de perfil é obrigatório"),
  social_technologies: Yup.array().min(
    1,
    "Selecione ao menos uma tecnologia social",
  ),
  email: Yup.string().trim().email("E-mail inválido").optional(),
};

const socialProfileSchema = {
  color_race: Yup.number()
    .required("Cor/Raça é obrigatória")
    .typeError("Cor/Raça é obrigatória"),
  sex: Yup.number()
    .required("Gênero é obrigatório")
    .typeError("Gênero é obrigatório"),
  birthday: Yup.string().required("Data de nascimento é obrigatória"),
  phone: Yup.string().required("Telefone é obrigatório"),
};

const adminSchema = {
  email: Yup.string().trim().email("E-mail inválido").optional(),
};

export const buildCreateUserSchema = (
  role: string,
  currentType: string,
  email = "",
) => {
  if (role === ROLE.ADMIN) {
    return Yup.object({ ...accessSchema, ...adminSchema });
  }

  const emailSchema = requiresInstitutionalEmail(currentType as any)
    ? Yup.string()
        .trim()
        .email("E-mail inválido")
        .required("E-mail é obrigatório")
    : profileBaseSchema.email;
  const phoneSchema = requiresPhone(currentType as any, email)
    ? Yup.string().required("Telefone é obrigatório")
    : Yup.string().optional();

  return Yup.object({
    ...accessSchema,
    ...profileBaseSchema,
    email: emailSchema,
    phone: phoneSchema,
    ...(requiresSocialDemographics(currentType as any)
      ? socialProfileSchema
      : {}),
  });
};
