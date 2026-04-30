import { useQuery } from "react-query";
import { requestUsers, requestUsersChart, requestUsersLogin, requestUsersOne } from "./request";

export const useFetchRequestUsers = (params: {
  role?: string;
  page?: number;
  perPage?: number;
  name?: string;
}) => {
    return useQuery(
      ["useRequestsUsers", params.role, params.page, params.perPage, params.name],
      () => requestUsers(params),
    );
  };

  export const useFetchRequestUsersChart = (id?: string) => {
    return useQuery(["useRequestsUsersChart", id], () => requestUsersChart(id));
  };

  export const useFetchRequestUsersOne = (id: number) => {
    return useQuery(["useRequestsUsersOne"], () => requestUsersOne(id));
  };


  export const useFetchRequestUsersLogin = (id: number) => {
    return useQuery(["useRequestsUsersLogin"], () => requestUsersLogin(id));
  };
