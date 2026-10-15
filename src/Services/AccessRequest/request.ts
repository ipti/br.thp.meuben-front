import publicHttp from '../publicAxios';
import {
  ActivateAccessPayload,
  AccessRequestOptions,
  CreateAccessRequestPayload,
  CreateAccessRequestResponse,
  MicrosoftIdentityContext,
  MicrosoftLinkPayload,
  MicrosoftLinkResponse,
  PublicAccessRequest,
  RequesterAuth,
  RespondToRequestPayload,
} from './types';

export const requestGetPublicStatus = (
  protocol: string,
  trackingKey: string,
): Promise<PublicAccessRequest> =>
  publicHttp
    .post('/access-requests/public/status', { protocol, trackingKey })
    .then((r) => r.data);

export const requestGetMicrosoftStatus = (
  microsoftContext: string,
  protocol?: string,
): Promise<PublicAccessRequest | { requests: PublicAccessRequest[] }> =>
  publicHttp
    .post('/access-requests/public/status/microsoft', { microsoftContext, protocol })
    .then((r) => r.data);

export const requestRespondToRequest = (
  protocol: string,
  payload: RespondToRequestPayload,
): Promise<PublicAccessRequest> =>
  publicHttp
    .post(`/access-requests/public/${protocol}/respond`, payload)
    .then((r) => r.data);

export const requestActivateAccess = (
  protocol: string,
  payload: ActivateAccessPayload,
): Promise<PublicAccessRequest> =>
  publicHttp
    .post(`/access-requests/public/${protocol}/activate`, payload)
    .then((r) => r.data);

export const requestCancelAccess = (
  protocol: string,
  auth: RequesterAuth,
): Promise<PublicAccessRequest> =>
  publicHttp
    .post(`/access-requests/public/${protocol}/cancel`, auth)
    .then((r) => r.data);

export const requestGetAccessRequestOptions = (): Promise<AccessRequestOptions> =>
  publicHttp.get('/access-requests/public/options').then((r) => r.data);

export const requestGetMicrosoftContext = (
  contextId: string,
): Promise<MicrosoftIdentityContext> =>
  publicHttp
    .get(`/access-requests/public/microsoft-context/${encodeURIComponent(contextId)}`)
    .then((r) => r.data);

export const requestCreateAccessRequest = (
  payload: CreateAccessRequestPayload,
): Promise<CreateAccessRequestResponse> =>
  publicHttp.post('/access-requests/public', payload).then((r) => r.data);

export const requestLinkMicrosoft = (
  payload: MicrosoftLinkPayload,
): Promise<MicrosoftLinkResponse> =>
  publicHttp
    .post('/access-requests/public/microsoft-link', payload)
    .then((r) => r.data);
