import { CreateUser } from "../../Context/Users/type";
import http from "../axios";
import { getYear, logout } from "../localstorage";

export const requestUsers = (params: {
  role?: string;
  page?: number;
  perPage?: number;
  name?: string;
}) => {
  const query = new URLSearchParams();

  if (params.role && params.role !== "TODOS") query.append("role", params.role);
  if (params.page) query.append("page", String(params.page));
  if (params.perPage) query.append("perPage", String(params.perPage));
  if (params.name && params.name.trim() !== "") query.append("name", params.name.trim());

  const path = `/user-bff${query.toString() ? "?" + query.toString() : ""}`;

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

export const requestUsersChart = (id?: string) => {


  let path = "/user-bff/chart?year=" + getYear() ?? 2024;


  if (id) {
    return http.get("/user-bff/chart-ts?year=" + (getYear() ?? 2024) + "&tsId=" + id).then((response) => response.data)
      .catch((err) => {
        if (err.response.status === 401) {
          logout();
          window.location.reload();
        }
        throw err;
      });
  } else {


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
  }
};

export const requestCreateUsers = (data: CreateUser) => {
  let path = "/user-bff";

  return http
    .post(path, { ...data, role: data.role })
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestDeleteUsers = (id: number) => {
  let path = "/users/" + id;
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

export const requestUpdateUsers = (id: number, data: any) => {
  let path = "/user-bff?idUser=" + id;
  return http
    .put(path, data)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestChangePassword = (id: number, data: {password: string}) => {
  let path = "/user-bff/change-password?idUser=" + id;
  return http
    .put(path, data)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestUsersLogin = (id: number) => {
  if (id) {
    let path = "/users/" + id;
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
  }
};


export const requestUsersOne = (id: number) => {
  if (id) {
    let path = "/user-bff/one?idUser=" + id;
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
  }
};
