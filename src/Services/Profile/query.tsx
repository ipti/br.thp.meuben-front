import { useQuery } from 'react-query';
import {
  requestGetProfiles,
  requestGetProfileOne,
  requestGetProfileTypeLog,
  requestGetUsersWithoutProfile,
} from './request';
import { ProfileFilters } from '../../Context/Profile/type';

export const useFetchProfiles = (params: ProfileFilters) =>
  useQuery(
    ['useRequestsProfiles', params],
    () => requestGetProfiles(params),
    { keepPreviousData: true }
  );

export const useFetchProfileOne = (id: number) =>
  useQuery(
    ['useRequestsProfileOne', id],
    () => requestGetProfileOne(id),
    { enabled: id > 0 }
  );

export const useFetchProfileTypeLog = (id: number) =>
  useQuery(
    ['useRequestsProfileTypeLog', id],
    () => requestGetProfileTypeLog(id),
    { enabled: id > 0 }
  );

export const useFetchUsersWithoutProfile = () =>
  useQuery(
    ['useRequestsUsersWithoutProfile'],
    requestGetUsersWithoutProfile
  );
