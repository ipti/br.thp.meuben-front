import { ChangeClassroom, CreateClassroom, ReuseClassroom } from "../../Context/Classroom/type";
import http from "../axios";
import { getYear, logout } from "../localstorage";

export const requestCreateClassroom = (data: CreateClassroom) => {
  return http
    .post("/classroom", data)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      alert(err.response.message);
      throw err;
    });
};

export const requestClassroom = (idProject: number) => {
  let path = "/classroom-bff";
  if (idProject) {
    return http
      .get(path, {
        params: {
          idProject: idProject,
          year: getYear(),
        },
      })
      .then((response) => response.data)
      .catch((err) => {
        if (err.response.status === 401) {
          logout();
          window.location.reload();
        }
        throw err;
      });
  }
};

export const requestClassroomOne = (id: number) => {
  let path = "/classroom-bff/one";
  return http
    .get(path, { params: { idClassroom: id } })
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestFoulsClassroomOne = (id: number) => {
  let path = "/fouls-bff";
  return http
    .get(path, { params: { idClassroom: id } })
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestClassroomReport = (id: number) => {
  let path = "/classroom-bff/report";
  return http
    .get(path, { params: { idClassroom: id } })
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestUpdateClassroom = (
  id: number,
  data: { name: string; status: string }
) => {
  let path = "/classroom/";
  return http
    .put(path + id, data)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestChangeClassroom = (data: ChangeClassroom) => {
  let path =
    "/classroom-bff/change-project?idClassroom=" +
    data.idClassroom +
    "&idProject=" +
    data.idProject;
  return http
    .put(path)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestReuseClassroom = (data: ReuseClassroom) => {
  let path =
    "/classroom-bff/reuse"
    ;
  return http
    .post(path, data)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestClassroomRegistration = (id: number) => {
  let path = "/registration-classroom-bff";
  return http
    .get(path, {
      params: {
        idClassroom: id,
      },
    })
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestClassroomRegistrationOne = (id: number) => {
  let path = "/registration/" + id;
  return http
    .get(path)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestDeleteClassroom = (id: number) => {
  let path = "/classroom/" + id;
  return http
    .delete(path)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestCountStates = (id: number) => {
  let path = "/classroom-bff/count-states";
  return http
    .get(path, { params: { idClassroom: id } })
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
    });
};

export const requestClassroomZipArchives = (id: number) => {
  return http.get(`/classroom-bff/zip-archives`, {
    params: { idClassroom: id },
    responseType: 'blob', // <-- importantíssimo!
  });
};
