import {
  AccessRequestResolutionType,
  AccessRequestStatus,
  AccessRequestType,
} from '../AccessRequest/types';

export type { AccessRequestStatus, AccessRequestResolutionType, AccessRequestType };

export type AccessRequestOrigin = 'LOCAL' | 'MICROSOFT';
export type EmailEvidence = 'MICROSOFT_AUTHENTICATED' | 'DECLARED' | 'NOT_PROVIDED';

export interface AdminListItem {
  id: number;
  protocol: string;
  type: AccessRequestType;
  origin: AccessRequestOrigin;
  status: AccessRequestStatus;
  fullName: string;
  institutionalEmail?: string;
  emailEvidence: EmailEvidence;
  profileType?: string;
  profileTypeUnknown?: boolean;
  socialTechnologies: string[];
  reviewer?: { id: number; name: string };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminListResponse {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  items: AdminListItem[];
}

export interface AdminCounts {
  pendingReview: number;
  pendingReviewWithResponse: number;
  inReview: number;
  needsInformation: number;
  approvedPendingActivation: number;
}

export interface SocialTechnology {
  id: number;
  name: string;
}

export interface AdminSubmittedData {
  fullName: string;
  usernameHint?: string;
  believesExistingAccess?: boolean;
  institutionalEmail?: string;
  phone?: string;
  profileType?: string;
  profileTypeUnknown?: boolean;
  birthday?: string;
  sex?: number;
  colorRace?: number;
  initialDate?: string;
  socialTechnologyUnknown?: boolean;
  socialTechnologies: SocialTechnology[];
  requesterNote?: string;
  microsoftOid?: string;
  microsoftTenantId?: string;
}

export interface AdminMessage {
  id: number;
  authorType: 'ADMIN' | 'REQUESTER';
  authorUserId?: number;
  message: string;
  requestedFields?: string[];
  createdAt: string;
}

export interface AdminEvent {
  id: number;
  eventType: string;
  previousStatus?: string;
  newStatus?: string;
  actorType: string;
  actorUserId?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserCandidate {
  id: number;
  name: string;
  username: string;
  email?: string;
  active: boolean;
  role: string;
  profile?: {
    id: number;
    currentType: string;
    active: boolean;
    technologies: string[];
  } | null;
  signals: string[];
  conflicts: string[];
}

export interface ProfileCandidate {
  id: number;
  name: string;
  phone?: string;
  birthday?: string;
  currentType: string;
  active: boolean;
  hasUser: boolean;
  signals: string[];
  conflicts: string[];
}

export interface AdminDetail {
  id: number;
  protocol: string;
  type: AccessRequestType;
  origin: AccessRequestOrigin;
  status: AccessRequestStatus;
  resolutionType?: AccessRequestResolutionType;
  emailEvidence: EmailEvidence;
  reviewer?: { id: number; name: string };
  reviewedAt?: string;
  dates: {
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
  };
  submittedData: AdminSubmittedData;
  messages: AdminMessage[];
  events: AdminEvent[];
  missingFields: string[];
  matchedUserId?: number;
  matchedProfileId?: number;
  userCandidates: UserCandidate[];
  profileCandidates: ProfileCandidate[];
  conflicts: string[];
  allowedActions: string[];
}

export interface AdminListFilters {
  page?: number;
  perPage?: number;
  status?: string;
  type?: string;
  origin?: string;
  profileType?: string;
  name?: string;
  email?: string;
  protocol?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface AdminRequestInformationPayload {
  publicMessage: string;
  requestedFields?: string[];
  internalNote?: string;
}

export interface AdminManualCompletePayload {
  resolutionNote: string;
  publicMessage?: string;
}

export interface AdminUpdateDataPayload {
  profileType?: string;
  profileTypeUnknown?: boolean;
  socialTechnologyIds?: number[];
  socialTechnologyUnknown?: boolean;
  initialDate?: string;
  fullName?: string;
  institutionalEmail?: string;
  phone?: string;
  birthday?: string;
  sex?: number;
  colorRace?: number;
}
