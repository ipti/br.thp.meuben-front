import { useState, useEffect } from 'react';
import {
  useFetchProfiles,
  useFetchProfileOne,
  useFetchProfileTypeLog,
} from '../../Services/Profile/query';

export const ProfileState = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [nameSearch, setNameSearch] = useState('');
  const [currentTypeFilter, setCurrentTypeFilter] = useState<
    'COORDINATOR' | 'COORDINATION_SUPPORT' | 'REAPPLICATOR' | 'OTHER' | 'MONITORING' | 'COMMUNICATION' | undefined
  >();
  const [selectedId, setSelectedId] = useState(0);
  const [logProfileId, setLogProfileId] = useState(0);

  // Reseta para página 1 ao mudar filtros
  useEffect(() => {
    setPage(1);
  }, [nameSearch, currentTypeFilter]);

  const { data: profiles, isLoading } = useFetchProfiles({
    page,
    perPage,
    name: nameSearch || undefined,
    current_type: currentTypeFilter,
  });

  const { data: profile, isLoading: isLoadingOne } = useFetchProfileOne(selectedId);
  const { data: typeLog, isLoading: isLoadingLog } = useFetchProfileTypeLog(logProfileId);

  const loadOne = (id: number) => setSelectedId(id);
  const loadTypeLog = (id: number) => setLogProfileId(id);

  return {
    profiles,
    profile,
    typeLog,
    isLoading,
    isLoadingOne,
    isLoadingLog,
    page,
    perPage,
    nameSearch,
    currentTypeFilter,
    setPage,
    setPerPage,
    setNameSearch,
    setCurrentTypeFilter,
    loadOne,
    loadTypeLog,
  };
};
