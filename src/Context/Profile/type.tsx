import { Dispatch, SetStateAction } from 'react';

export interface ProfileSocialTechnology {
  social_technology_fk: number;
  profile_fk: number;
  social_technology?: {
    id: number;
    name: string;
  };
}

export interface ProfileTypeLogEntry {
  id: number;
  profile_fk: number;
  previous_type: 'COORDINATOR' | 'REAPPLICATOR' | null;
  new_type: 'COORDINATOR' | 'REAPPLICATOR';
  reason?: string;
  changed_by_fk?: number;
  changed_by?: {
    id: number;
    name: string;
    username: string;
  };
  createdAt: string;
}

export interface ProfileLinkedUser {
  id: number;
  name: string;
  username: string;
  active: boolean;
  role: 'ADMIN' | 'USER';
}

export interface Profile {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  color_race: number;
  sex: number;
  birthday: string;
  initial_date?: string;
  active: boolean;
  current_type: 'COORDINATOR' | 'REAPPLICATOR';
  user_fk?: number;
  user?: ProfileLinkedUser;
  profile_social_technology: ProfileSocialTechnology[];
  profile_type_log?: ProfileTypeLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfilesResponse {
  data: Profile[];
  total: number;
  page: number;
  perPage: number;
}

export interface CreateProfileDto {
  name: string;
  current_type: 'COORDINATOR' | 'REAPPLICATOR';
  phone?: string;
  email?: string;
  color_race?: number;
  sex?: number;
  birthday?: string;
  initial_date?: string;
  active?: boolean;
  user_fk?: number | null;
  reason?: string;
  social_technologies?: number[];
}

export interface CreateUserWithProfile {
  name: string;
  username: string;
  password: string;
  role?: 'USER';
  current_type: 'COORDINATOR' | 'REAPPLICATOR';
  project?: number[];
  email?: string;
  phone?: string;
  sex?: number;
  color_race?: number;
  initial_date?: string;
  birthday?: string;
}

export interface ProfileFilters {
  page: number;
  perPage: number;
  name?: string;
  current_type?: 'COORDINATOR' | 'REAPPLICATOR';
  active?: boolean;
}

export interface ProfileContextTypes {
  profiles?: ProfilesResponse;
  profile?: Profile;
  typeLog?: ProfileTypeLogEntry[];
  isLoading: boolean;
  isLoadingOne: boolean;
  isLoadingLog: boolean;
  page: number;
  perPage: number;
  nameSearch: string;
  currentTypeFilter?: 'COORDINATOR' | 'REAPPLICATOR';
  setPage: Dispatch<SetStateAction<number>>;
  setPerPage: Dispatch<SetStateAction<number>>;
  setNameSearch: Dispatch<SetStateAction<string>>;
  setCurrentTypeFilter: Dispatch<SetStateAction<'COORDINATOR' | 'REAPPLICATOR' | undefined>>;
  loadOne: (id: number) => void;
  loadTypeLog: (id: number) => void;
}
