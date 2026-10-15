import http from '../axios';
import { logout } from '../localstorage';
import type {
  AdminCounts,
  AdminDetail,
  AdminListFilters,
  AdminListResponse,
  AdminManualCompletePayload,
  AdminRequestInformationPayload,
  AdminUpdateDataPayload,
} from './types';

const handleAuthError = (err: any) => {
  if (err.response?.status === 401) {
    logout();
    window.location.reload();
  }
  throw err;
};

export const requestAdminGetCounts = (): Promise<AdminCounts> =>
  http.get('/access-requests/admin/counts').then((r) => r.data).catch(handleAuthError);

export const requestAdminGetList = (filters: AdminListFilters): Promise<AdminListResponse> => {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.perPage) params.set('perPage', String(filters.perPage));
  if (filters.status) params.set('status', filters.status);
  if (filters.type) params.set('type', filters.type);
  if (filters.origin) params.set('origin', filters.origin);
  if (filters.profileType) params.set('profileType', filters.profileType);
  if (filters.name?.trim()) params.set('name', filters.name.trim());
  if (filters.email?.trim()) params.set('email', filters.email.trim());
  if (filters.protocol?.trim()) params.set('protocol', filters.protocol.trim());
  if (filters.createdFrom) params.set('createdFrom', filters.createdFrom);
  if (filters.createdTo) params.set('createdTo', filters.createdTo);
  return http
    .get(`/access-requests/admin?${params.toString()}`)
    .then((r) => r.data)
    .catch(handleAuthError);
};

export const requestAdminGetDetail = (id: number): Promise<AdminDetail> =>
  http.get(`/access-requests/admin/${id}`).then((r) => r.data).catch(handleAuthError);

export const requestAdminStartReview = (id: number): Promise<AdminDetail> =>
  http.post(`/access-requests/admin/${id}/start-review`).then((r) => r.data).catch(handleAuthError);

export const requestAdminUpdateData = (
  id: number,
  data: AdminUpdateDataPayload,
): Promise<AdminDetail> =>
  http.patch(`/access-requests/admin/${id}`, data).then((r) => r.data).catch(handleAuthError);

export const requestAdminRequestInformation = (
  id: number,
  payload: AdminRequestInformationPayload,
): Promise<AdminDetail> =>
  http
    .post(`/access-requests/admin/${id}/request-information`, payload)
    .then((r) => r.data)
    .catch(handleAuthError);

export const requestAdminReject = (
  id: number,
  publicJustification: string,
): Promise<AdminDetail> =>
  http
    .post(`/access-requests/admin/${id}/reject`, { publicJustification })
    .then((r) => r.data)
    .catch(handleAuthError);

export const requestAdminCancel = (
  id: number,
  auditReason: string,
): Promise<AdminDetail> =>
  http
    .post(`/access-requests/admin/${id}/cancel`, { auditReason })
    .then((r) => r.data)
    .catch(handleAuthError);

export const requestAdminCompleteManually = (
  id: number,
  payload: AdminManualCompletePayload,
): Promise<AdminDetail> =>
  http
    .post(`/access-requests/admin/${id}/complete-manually`, payload)
    .then((r) => r.data)
    .catch(handleAuthError);
