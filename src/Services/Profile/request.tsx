import http from '../axios';
import { logout } from '../localstorage';
import { CreateProfileDto, CreateUserWithProfile, ProfileFilters } from '../../Context/Profile/type';

const handleAuthError = (err: any) => {
  if (err.response?.status === 401) {
    logout();
    window.location.reload();
  }
  throw err;
};

export const requestGetProfiles = (params: ProfileFilters) => {
  const query = new URLSearchParams();
  query.append('page', String(params.page));
  query.append('perPage', String(params.perPage));
  if (params.name?.trim()) query.append('name', params.name.trim());
  if (params.current_type) query.append('current_type', params.current_type);
  if (params.active !== undefined) query.append('active', String(params.active));

  return http
    .get(`/profile?${query.toString()}`)
    .then((r) => r.data)
    .catch(handleAuthError);
};

export const requestGetProfileOne = (id: number) =>
  http
    .get(`/profile/${id}`)
    .then((r) => r.data)
    .catch(handleAuthError);

export const requestGetProfileTypeLog = (id: number) =>
  http
    .get(`/profile/${id}/type-log`)
    .then((r) => r.data)
    .catch(handleAuthError);

export const requestCreateProfile = (data: CreateProfileDto) =>
  http
    .post('/profile', data)
    .then((r) => r.data)
    .catch(handleAuthError);

export const requestCreateUserWithProfile = (data: CreateUserWithProfile) =>
  http
    .post('/user-bff', data)
    .then((r) => r.data)
    .catch(handleAuthError);

export const requestUpdateProfile = (id: number, data: Partial<CreateProfileDto>) =>
  http
    .put(`/profile/${id}`, data)
    .then((r) => r.data)
    .catch(handleAuthError);

export const requestDeleteProfile = (id: number) =>
  http
    .delete(`/profile/${id}`)
    .then((r) => r.data)
    .catch(handleAuthError);

// Busca usuários sem perfil vinculado (para o seletor de vínculo)
export const requestGetUsersWithoutProfile = () =>
  http
    .get('/user-bff?perPage=200')
    .then((r) => {
      const list: any[] = r.data?.data ?? r.data ?? [];
      return list.filter((u) => !u.profile);
    })
    .catch(handleAuthError);
