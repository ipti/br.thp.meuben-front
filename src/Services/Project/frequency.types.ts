export type RegistrationStatus = "ACTIVE" | "INACTIVE" | "PENDING";
export type AdhesionTermStatus =
  | "PENDING_TERM"
  | "TERM_ANALYSIS"
  | "ACTIVE_TERM"
  | "INACTIVE_TERM"
  | "INVALID_TERM";
export type RegisterClassroomStatus = "PENDING" | "APPROVED" | "REPROVED";
export type ClassroomStatus = "PENDING" | "APPROVED" | "CANCELED";
export type ClassroomAttendanceResult =
  | "APPROVED"
  | "REPROVED"
  | "NOT_EVALUATED";
export type ClassroomAttendanceNotEvaluatedReason =
  | "CLASSROOM_CANCELED"
  | "REGISTRATION_PENDING"
  | "REGISTRATION_REPROVED"
  | "NO_APPROVED_MEETINGS";

export interface ProjectRegistrationFrequencyFilters {
  search?: string;
  year?: number;
  classroomId?: number;
}

export interface ProjectRegistrationFrequencyQuery
  extends ProjectRegistrationFrequencyFilters {
  page: number;
  limit: number;
}

export interface FrequencyProject {
  id: number;
  name: string;
  approvalPercentage: number;
  requiresActiveAdhesionTerm: boolean;
}

export interface FrequencyRegistration {
  id: number;
  thpId: string;
  name: string;
  status: RegistrationStatus;
  adhesionTermStatus: AdhesionTermStatus | null;
}

export interface ClassroomFrequency {
  registerClassroomId: number;
  classroomId: number;
  classroomName: string;
  year: number;
  registrationStatus: RegisterClassroomStatus;
  classroomStatus: ClassroomStatus;
  meetings: number;
  presences: number | null;
  absences: number | null;
  attendancePercentage: number | null;
  requiredPercentage: number;
  result: ClassroomAttendanceResult;
  notEvaluatedReason: ClassroomAttendanceNotEvaluatedReason | null;
}

export interface RegistrationFrequency {
  registration: FrequencyRegistration;
  classrooms: ClassroomFrequency[];
}

export interface ProjectRegistrationFrequencyReport {
  project: FrequencyProject;
  data: RegistrationFrequency[];
}

export interface ProjectRegistrationFrequencyResponse
  extends ProjectRegistrationFrequencyReport {
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
