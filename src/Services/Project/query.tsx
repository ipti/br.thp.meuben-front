import { useQuery } from "react-query";
import { ProjectRegistrationFrequencyQuery } from "./frequency.types";
import {
  requestProjectList,
  requestProjectOne,
  requestProjectRegistrationFrequency,
  requestTsList,
  requestTsListYear,
} from "./request";

export const useFetchRequestProjectLists = () => {
  return useQuery(["useRequestProjectList"], () => requestProjectList());
};

export const useFetchRequestTsLists = (id: number | undefined) => {
  return useQuery(["requestTsList", id], () => requestTsList(id));
};

export const useFetchRequestTsListsYear = (
  id: number | undefined,
  year: number
) => {
  return useQuery(["requestTsListYear", id, year], () =>
    requestTsListYear(id, year)
  );
};

export const useFetchRequestProjectOne = (id: number) => {
  return useQuery(["requestProjectOne", id], () => requestProjectOne(id), {
    enabled: id > 0,
  });
};

export const useProjectRegistrationFrequency = (
  projectId: number,
  query: ProjectRegistrationFrequencyQuery
) =>
  useQuery(
    ["projectRegistrationFrequency", projectId, query],
    () => requestProjectRegistrationFrequency(projectId, query),
    {
      enabled: projectId > 0,
      keepPreviousData: true,
    }
  );
