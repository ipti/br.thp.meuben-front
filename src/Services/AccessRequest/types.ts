export type AccessRequestStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'IN_REVIEW'
  | 'NEEDS_INFORMATION'
  | 'APPROVED_PENDING_ACTIVATION'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type AccessRequestResolutionType =
  | 'CREATE_USER_AND_PROFILE'
  | 'CREATE_USER_FOR_PROFILE'
  | 'RESET_EXISTING_USER_PASSWORD'
  | 'LINK_MICROSOFT';

export type AccessRequestOrigin = 'LOCAL' | 'MICROSOFT';

export type AccessRequestType =
  | 'MICROSOFT_LINK'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_RECOVERY'
  | 'NEW_ACCESS';

export type ProfileType =
  | 'COORDINATOR'
  | 'COORDINATION_SUPPORT'
  | 'REAPPLICATOR'
  | 'OFICINEIRO'
  | 'OTHER'
  | 'COMMUNICATION'
  | 'ACCOUNTABILITY';

export interface AccessRequestProfileTypeOption {
  value: ProfileType;
  label: string;
  institutionalEmailRequired: boolean;
  phoneRequired: boolean;
  phoneRequiredWhenInstitutionalEmailMissing: boolean;
  birthdayRequired: boolean;
  sexRequired: boolean;
  colorRaceRequired: boolean;
  socialTechnologyRequired: true;
}

export interface AccessRequestSelectOption<T extends string | number> {
  value: T;
  label: string;
}

export interface AccessRequestOptions {
  profileTypes: AccessRequestProfileTypeOption[];
  socialTechnologies: Array<{ id: number; name: string }>;
  sexOptions: Array<AccessRequestSelectOption<number>>;
  colorRaceOptions: Array<AccessRequestSelectOption<number>>;
  username: { minLength: number; maxLength: number };
  password: { minLength: number; maxLength: number };
}

export interface MicrosoftIdentityContext {
  email: string;
  displayName?: string | null;
  expiresAt: string;
}

export interface CreateAccessRequestPayload {
  type: AccessRequestType;
  origin: AccessRequestOrigin;
  microsoftContext?: string;
  fullName: string;
  usernameHint?: string;
  believesExistingAccess?: boolean;
  institutionalEmail?: string;
  phone?: string;
  profileType?: ProfileType;
  profileTypeUnknown?: boolean;
  birthday?: string;
  sex?: number;
  colorRace?: number;
  socialTechnologyIds?: number[];
  socialTechnologyUnknown?: boolean;
  requesterNote?: string;
}

export interface CreateAccessRequestResponse {
  protocol: string;
  trackingKey: string;
  status: AccessRequestStatus;
  createdAt: string;
  message: string;
}

export interface MicrosoftLinkPayload {
  contextId: string;
  username: string;
  password: string;
}

export interface MicrosoftLinkResponse {
  access_token: string;
  refresh_token: string;
}

export interface PublicMessage {
  authorType: 'ADMIN' | 'REQUESTER';
  message: string;
  requestedFields?: string[];
  createdAt: string;
}

export interface PublicHistoryEvent {
  status: AccessRequestStatus;
  createdAt: string;
}

export interface PublicSubmittedData {
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
  socialTechnologyUnknown?: boolean;
  socialTechnologies: string[];
  requesterNote?: string;
}

export interface PublicRequestDates {
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface PublicAccessRequest {
  protocol: string;
  type: AccessRequestType;
  origin: AccessRequestOrigin;
  status: AccessRequestStatus;
  activationToken?: string;
  resolutionType?: AccessRequestResolutionType;
  dates: PublicRequestDates;
  submittedData: PublicSubmittedData;
  messages: PublicMessage[];
  history: PublicHistoryEvent[];
  activationAvailable: boolean;
  allowedActions: string[];
}

export interface RequesterAuth {
  trackingKey?: string;
  microsoftContext?: string;
}

export interface ActivateAccessPayload extends RequesterAuth {
  activationToken: string;
  username?: string;
  password?: string;
}

export interface RespondToRequestPayload extends RequesterAuth {
  message?: string;
  fullName?: string;
  institutionalEmail?: string;
  phone?: string;
  profileType?: string;
  profileTypeUnknown?: boolean;
  birthday?: string;
  sex?: number;
  colorRace?: number;
  socialTechnologyIds?: number[];
  socialTechnologyUnknown?: boolean;
}
