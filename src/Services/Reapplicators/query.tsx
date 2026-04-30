import { useQuery } from "react-query";
import { requestReapplicatorOne, requestReapplicators } from "./request";

export const useFetchReapplicators = (params: { page?: number; perPage?: number; active?: boolean }) => {
  return useQuery(["useRequestReapplicators", params], () => requestReapplicators(params));
};

export const useFetchReapplicatorOne = (id: number) => {
  return useQuery(["useRequestReapplicatorOne", id], () => requestReapplicatorOne(id), {
    enabled: !!id,
  });
};
