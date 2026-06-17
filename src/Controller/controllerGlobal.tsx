import axios from "axios";
import { Buffer } from "buffer";
import { FormikErrors } from "formik";

export const gerarIdAleatorio = (tamanho: number) => {
  const caracteres =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let id = "";

  for (let i = 0; i < tamanho; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
    id += caracteres.charAt(indiceAleatorio);
  }

  return id;
};


export enum AreaOfActivity {
  NO_SPECIFICATION = "NO_SPECIFICATION",
  ENTREPRENEURSHIP = "ENTREPRENEURSHIP",
  HEALTH = "HEALTH",
  EDUCATION = "EDUCATION",
}
export const areaOptions = [
    { name: "Sem especificação", id: AreaOfActivity.NO_SPECIFICATION },
    { name: "Empreendedorismo", id: AreaOfActivity.ENTREPRENEURSHIP },
    { name: "Saúde", id: AreaOfActivity.HEALTH },
    { name: "Educação", id: AreaOfActivity.EDUCATION },
  ];

export const getErrorsAsArray = (errors: FormikErrors<any>): string[] => {
  const flattenErrors = (obj: any): string[] => {
    let messages: string[] = [];
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "string") {
        messages.push(value);
      } else if (typeof value === "object" && value !== null) {
        messages = [...messages, ...flattenErrors(value)];
      }
    });
    return messages;
  };

  return flattenErrors(errors);
};

export function formatarData(data: string): string {
  var date = data?.toString()?.split("T")[0];
  var dataEdit = date?.split("-")?.reverse()?.join("/");
  return dataEdit ?? "-";
}

export function formatarDataAnoDuas(data: string): string {
  const date = data.toString().split("T")[0];
  const [ano, mes, dia] = date.split("-");
  const anoDoisDigitos = ano.slice(-2);
  return `${dia}/${mes}/${anoDoisDigitos}`;
}

export function isWithinOneYear(date1: any, date2: any, dateValid?: any) {
  const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000; // Um ano em milissegundos

  const timeDifference = Math.abs(
    new Date(date1).getUTCMilliseconds() - new Date(date2).getUTCMilliseconds()
  ); // Diferença absoluta em ms
  return timeDifference <= oneYearInMilliseconds; // Verifica se está dentro de um ano
}

export function isDateTerm(dateValid?: any) {
  const dateNow = Date.now();
  const dateValidTerm = new Date(dateValid).getTime();

  return dateValidTerm >= dateNow; // Verifica se está dentro de um ano
}

export function converterData(data: string) {
  // Divide a string pelo separador "/"
  const partes = data.split("/");

  // As partes serão: partes[0] = dia, partes[1] = mês, partes[2] = ano
  const dia = partes[0];
  const mes = partes[1];
  const ano = partes[2];

  // Reorganiza no formato YYYY-MM-DD
  const dataFormatada = `${ano}-${mes}-${dia}`;

  return dataFormatada;
}

export function somarNumeros(num1: number, num2: number): number {
  return parseInt(`${num1 + num2}`);
}

export const VerifySex = (sex: number) => {
  return typesex.find((props) => props.id === sex);
};

export const VerifyColor = (color_race_number: number) => {
  return color_race.find((props) => props.id === color_race_number);
};

export const getStatus = (id: string) => {
  const status = getStatusList();
  return status.find((props) => props.id === id);
};

export const getStatusList = () => {
  const status = [
    { id: Status.APPROVED, name: "Aprovado" },
    { id: Status.PENDING, name: "Pendente de análise" }
  ];
  return status;
};

export const getStatusClassroomList = () => {
  const status = [
    { id: Status.APPROVED, name: "Finalizada" },
    { id: Status.PENDING, name: "Em andamento" },
    { id: Status.CANCELED, name: "Cancelado" },
  ];
  return status;
};

export var typesex = [
  { id: 0, type: "Não Declarada" },
  { id: 2, type: "Feminino" },
  { id: 1, type: "Masculino" },
];

export const color_race = [
  { id: 0, name: "Não Declarada" },
  { id: 1, name: "Branca" },
  { id: 2, name: "Preta" },
  { id: 3, name: "Parda" },
  { id: 4, name: "Amarela" },
  { id: 5, name: "Indígena" },
];

export const Status = {
  APPROVED: "APPROVED",
  PENDING: "PENDING",
  REPROVED: "REPROVED",
  PENDING_TERM: "PENDING_TERM",
  CANCELED: "CANCELED",
};

export const StatusEnum: any = {
  APPROVED: "Aprovado",
  PENDING: "Pendente",
  REPROVED: "Reprovado",
  PENDING_TERM: "Aguar. assinatura",
};

export const typeLog: any = {
  USER: "Usuário",
  CLASSROOM: "Turma",
  REGISTRATION: "Beneficiário",
  MEETING: "Encontro",
  PROJECT: "Plano de trabalho",
  SOCIAL_TECHNOLOGY: "Tecnologia social"
};

export const typeLogArray = Object.entries(typeLog).map(([id, name]) => ({
  id,
  name
}));


export const StatusTermEnum: any = {
  TERM_ANALYSIS: "Em análise",
  ACTIVE_TERM: "Termo ativo",
  INACTIVE_TERM: "Termo inativo",
  // PENDING_TERM: "Aguar. assinatura",
  INVALID_TERM: "Termo inválido",
};

export const TypeTermEnum: any = {
  IMAGE_VOICE: "Imagem e voz",
  ACCESSION: "Termo de adesão",
  UNSPECIFIED: "Termo não especificado",
};

export const StatusRegistrationEnum: any = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  PENDING: "Pend. de análise"
};

export const ROLE = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const PROFILE_TYPE = {
  COORDINATOR:          "COORDINATOR",
  COORDINATION_SUPPORT: "COORDINATION_SUPPORT",
  REAPPLICATOR:         "REAPPLICATOR",
  MONITORING:           "MONITORING",
  COMMUNICATION:        "COMMUNICATION",
  OTHER:                "OTHER",
} as const;

export type ProfileType = typeof PROFILE_TYPE[keyof typeof PROFILE_TYPE];

export const profileTypeLabel: Record<string, string> = {
  COORDINATOR:          "Coordenação",
  COORDINATION_SUPPORT: "Apoio à coordenação",
  REAPPLICATOR:         "Reaplicador",
  MONITORING:           "Monitoramento",
  COMMUNICATION:        "Comunicação",
  OTHER:                "Outro",
};

export const kinship = [
  { id: "PAI", name: "Pai" },
  { id: "MAE", name: "Mãe" },
  { id: "PRIMO_A", name: "Primo(a)" },
  { id: "TIO_A", name: "Tio(a)" },
  { id: "FILHO_A", name: "Filho(a)" },
  { id: "IRMAO_A", name: "Irmão(a)" },
  { id: "OUTRO", name: "Outro" },
  { id: "NAO_PARENTE", name: "Não Parente" },
  { id: "NAO_DEFINIDO", name: "Não Definido" },
];

export const month = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const loadImageFileAsBase64 = (imagePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(imagePath)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
};

export const convertImageUrlToBase64 = async (
  imageUrl: string
): Promise<string> => {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    const mimeType = response.headers["content-type"];
    return `data:${mimeType};base64,${base64}`;
  } catch (error: any) {
    throw new Error(`Failed to convert image to Base64: ${error.message}`);
  }
};

export const Month = {
  0: "Janeiro",
  1: "Fevereiro",
  2: "Março",
  3: "Abril",
  4: "Maio",
  5: "Junho",
  6: "Julho",
  7: "Agosto",
  8: "Setembro",
  9: "Outubro",
  10: "Novembro",
  11: "Dezembro",
};

export const getMonthNumber = (startMonth: number, endMonth: number) => {
  const monthsArray = Object.values(Month); // Obtém os nomes dos meses como array

  if (startMonth < 0 || startMonth > 11 || endMonth < 0 || endMonth > 11) {
    throw new Error("Os valores devem estar entre 0 e 11.");
  }

  if (startMonth <= endMonth) {
    return monthsArray.slice(startMonth, endMonth + 1);
  } else {
    return [
      ...monthsArray.slice(startMonth),
      ...monthsArray.slice(0, endMonth + 1),
    ];
  }
};

export function formatCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, ""); // Remove tudo que não for número
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2"); // Coloca um ponto entre o terceiro e o quarto dígitos
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2"); // Coloca um ponto entre o sexto e o sétimo dígitos
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Coloca um hífen antes dos últimos dois dígitos
  return cpf;
}
