import http from "../axios";
import { logout } from "../localstorage";

const handleAuthError = (err: any) => {
  if (err.response?.status === 401) {
    logout();
    window.location.reload();
  }
  throw err;
};

export const requestReapplicators = (params: { page?: number; perPage?: number; active?: boolean }) => {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.append("page", String(params.page));
  if (params.perPage !== undefined) query.append("perPage", String(params.perPage));
  if (params.active !== undefined) query.append("active", String(params.active));

  return http
    .get(`/reapplicators?${query.toString()}`)
    .then((response) => response.data)
    .catch(handleAuthError);
};

export const requestReapplicatorOne = (id: number) => {
  return http
    .get(`/reapplicators/${id}`)
    .then((response) => response.data)
    .catch(handleAuthError);
};

export const requestCreateReapplicator = (data: any) => {
  return http
    .post("/reapplicators", data)
    .then((response) => response.data)
    .catch(handleAuthError);
};

export const requestUpdateReapplicator = (id: number, data: any) => {
  return http
    .put(`/reapplicators/${id}`, data)
    .then((response) => response.data)
    .catch(handleAuthError);
};

export const requestDeleteReapplicator = (id: number) => {
  return http
    .delete(`/reapplicators/${id}`)
    .then((response) => response.data)
    .catch(handleAuthError);
};
