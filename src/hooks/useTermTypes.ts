import { useQuery } from "react-query";
import { getTermTypes } from "../Services/TermType/request";
import { TermType } from "../Services/TermType/type";

export function useTermTypes(activeOnly = true) {
  const query = useQuery<TermType[]>(
    ["term-types", activeOnly],
    () => getTermTypes(activeOnly),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  const adhesionType = query.data?.find((t) => t.is_adhesion_term) ?? null;

  return {
    ...query,
    termTypes: query.data ?? [],
    adhesionType,
  };
}
