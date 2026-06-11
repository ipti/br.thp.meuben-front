import http from "../axios";
import { getYear, logout } from "../localstorage";
import { CreatePreRegistration, CreateRegistrationClassroomType } from "./types";

const getPrimitive = (value: any) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "object") {
    if ("id" in value) {
      return value.id;
    }

    if ("value" in value) {
      return value.value;
    }
  }

  return value;
};

const getNumberOrUndefined = (value: any) => {
  const primitive = getPrimitive(value);

  if (primitive === null || primitive === undefined || primitive === "") {
    return undefined;
  }

  const parsed = Number(primitive);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const getBooleanOrUndefined = (value: any) => {
  const primitive = getPrimitive(value);

  if (primitive === null || primitive === undefined || primitive === "") {
    return undefined;
  }

  if (typeof primitive === "boolean") {
    return primitive;
  }

  if (primitive === "true" || primitive === "1" || primitive === 1) {
    return true;
  }

  if (primitive === "false" || primitive === "0" || primitive === 0) {
    return false;
  }

  return undefined;
};

export const requestPreRegistration = (data: CreatePreRegistration | any) => {

  const body = {
    ...data,
    state_fk: getNumberOrUndefined(data?.state),
    city_fk: getNumberOrUndefined(data?.city),
    cep: data?.cep?.replace(/[^a-zA-Z0-9 ]/g, ""),
    color_race: getNumberOrUndefined(data?.color_race),
    sex: getNumberOrUndefined(data?.sex),
    zone: getNumberOrUndefined(data?.zone),
    classroom: getNumberOrUndefined(data?.classroom),
    deficiency: getBooleanOrUndefined(data?.deficiency),
  };

  delete body.state
  delete body.city

  if (process.env.NODE_ENV !== "production") {
    console.debug("[requestPreRegistration] payload", body);
  }

  return http
    .post("/registration-bff", body)
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 401) {
        window.location.reload()
      }
      alert(err.response.message)

      throw err;
    });
};

export const requestRegistrationClassroom = (data: CreateRegistrationClassroomType) => {
  return http
    .post("/registration-classroom-bff", data)
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 401) {
        window.location.reload()
      }
      alert(err.response.message)

      throw err;
    });
};



export const requestUpdateRegistration = (data: any, id: number) => {
  const body = {
    ...data,
    state_fk:   getNumberOrUndefined(data?.state   ?? data?.state_fk),
    city_fk:    getNumberOrUndefined(data?.city    ?? data?.city_fk),
    cep:        data?.cep?.replace(/\D/g, "").slice(0, 8) || undefined,
    color_race: getNumberOrUndefined(data?.color_race),
    sex:        getNumberOrUndefined(data?.sex),
    zone:       getNumberOrUndefined(data?.zone),
    deficiency: getBooleanOrUndefined(data?.deficiency),
  };

  delete body.state;
  delete body.city;

  return http
    .put("/registration/" + id, body)
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 401) {
        window.location.reload()
      }
      alert(err.response.message)
      throw err;
    });
};

export const requestUpdateRegistrationClassroom = (data: any, id?: number) => {
  const registrationClassroomId = id ?? data?.registration_classroom_id;

  return http
    .patch(
      "/registration-classroom-bff/" + registrationClassroomId + "/status",
      { status: data?.status }
    )
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 401) {
        window.location.reload()
      }
      alert(err.response.message)

      throw err;
    });
};


export const requestCreateRegistrationTerm = (data: any) => {

  return http
    .post("/registration-term-bff", data)
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 401) {
        window.location.reload()
      }
      alert(err.response.message)

      throw err;
    });
};

export const requestUpdateAvatarRegistration = (id: number, file: File) => {

  const formData = new FormData()

  formData.append("file", file)

  return http
    .put("/registration/avatar/" + id, formData)
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 401) {
        window.location.reload()
      }
      alert(err.response.message)

      throw err;
    });
};

export const requestProjectsAndClassroom = () => {
  let path = "/project-bff";

  if (getYear()) {
    return http
      .get(path, { params: { year: getYear() } })
      .then(response => response.data)
      .catch(err => {
        if (err.response.status === 401) {
          window.location.reload()
        }
        throw err;
      });
  }
};


export const requestClassroomRegistration = (
  id: number,
  statusTerm?: string,
  typeTerm?: string,
) => {
  let path = "/registration-classroom-bff";
  return http
    .get(path, {
      params: {
        idClassroom: id,
        statusTerm,
        typeTerm,
      },
    })
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 401) {
        logout()
        window.location.reload()
      }
      throw err;
    });
};

export const requestClassroomRegistrationOne = (id: number) => {
  let path = "/registration-classroom-bff/register-classroom-one?idRegistrationClassroom=" + id;
  return http
    .get(path)
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 401) {
        logout()
        window.location.reload()
      }
      throw err;
    });
};

export const requestRegistrationOne = (id?: string) => {
  if (id) {
    let path = "/registration-token-bff/one?idRegistration=" + id;
    return http
      .get(path)
      .then(response => response.data)
      .catch(err => {
        if (err.response.status === 401) {
          logout()
          window.location.reload()
        }
        throw err;
      });
  }
};

export const requestRegistrationOneCpf = (cpf?: string) => {
  if (cpf) {
    let path = "/registration-bff?cpf=" + cpf.replace(/[^\d]/g, '');
    return http
      .get(path)
      .then(response => response.data)
      .catch(err => {
        if (err.response.status === 401) {
          logout()
          window.location.reload()
        }
        throw err;
      });
  }
};

export const requestDeleteRegistration = (id: number) => {
  let path = "/registration-token-bff/" + id;
  return http
    .delete(path)
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 401) {
        logout()
        window.location.reload()
      }
      alert(err.response.message)
      throw err;
    });
};

export const requestDeleteRegistrationClassroom = (id: number) => {
  let path = "/registration-classroom-bff/" + id;
  return http
    .delete(path)
    .then(response => response.data)
    .catch(err => {
      if (err.response.status === 401) {
        logout()
        window.location.reload()
      }
      alert(err.response.message)
      throw err;
    });
};
