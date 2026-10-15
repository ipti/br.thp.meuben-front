import { useQuery } from 'react-query';
import { requestAdminGetCounts, requestAdminGetDetail, requestAdminGetList } from './request';
import type { AdminListFilters } from './types';

export const ADMIN_ACCESS_REQUEST_KEYS = {
  counts: ['adminAccessRequestCounts'] as const,
  list: (filters: AdminListFilters) => ['adminAccessRequestList', filters] as const,
  detail: (id: number) => ['adminAccessRequestDetail', id] as const,
};

export const useAdminAccessRequestCounts = (enabled = true) =>
  useQuery(ADMIN_ACCESS_REQUEST_KEYS.counts, requestAdminGetCounts, {
    enabled,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

export const useAdminAccessRequestList = (filters: AdminListFilters) =>
  useQuery(
    ADMIN_ACCESS_REQUEST_KEYS.list(filters),
    () => requestAdminGetList(filters),
    { keepPreviousData: true },
  );

export const useAdminAccessRequestDetail = (id: number) =>
  useQuery(
    ADMIN_ACCESS_REQUEST_KEYS.detail(id),
    () => requestAdminGetDetail(id),
    { enabled: id > 0 },
  );
