import { useState } from "react";
import { useFetchReapplicatorOne, useFetchReapplicators } from "../../Services/Reapplicators/query";
import { Reapplicator } from "./type";

export const ReapplicatorsState = () => {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [selectedId, setSelectedId] = useState<number>(0);

  const { data: reapplicators, isLoading } = useFetchReapplicators({ page, perPage });
  const { data: reapplicator, isLoading: isLoadingOne } = useFetchReapplicatorOne(selectedId);

  const loadOne = (id: number) => {
    setSelectedId(id);
  };

  return {
    reapplicators,
    reapplicator: reapplicator as Reapplicator | undefined,
    isLoading,
    isLoadingOne,
    page,
    perPage,
    setPage,
    loadOne,
  };
};
