import { Dispatch, SetStateAction } from "react";

export interface UsersTypes {
  users: any[];
  total: number;
  page: number;
  perPage: number;
  setPage: Dispatch<SetStateAction<number>>;
  setPerPage: Dispatch<SetStateAction<number>>;
  nameSearch: string;
  setNameSearch: Dispatch<SetStateAction<string>>;
  CreateUser: (data: CreateUser) => void;
  DeleteUser: (id: number) => void;
  UpdateUser: (data: CreateUser, id: number) => void;
  isLoading: boolean;
  role?: string;
  setRole: Dispatch<SetStateAction<string | undefined>>;
  ChangePassword: (data: { password: string }, id: number) => void;
}

export interface CreateUser {
  name: string;
  username: string;
  password?: string;
  role?: string;
  email?: string;
  phone?: string;
  sex?: number;
  color_race?: number;
  initial_date?: string;
  birthday?: string;
}

export interface UserProfileSummary {
  id: number
  name: string
  current_type: 'COORDINATOR' | 'COORDINATION_SUPPORT' | 'REAPPLICATOR' | 'OTHER' | 'MONITORING' | 'COMMUNICATION'
}

export interface User {
  id: number
  name: string
  username: string
  active: boolean
  role: string
  profileId?: number
  profileType?: 'COORDINATOR' | 'COORDINATION_SUPPORT' | 'REAPPLICATOR' | 'OTHER' | 'MONITORING' | 'COMMUNICATION'
  profile?: UserProfileSummary
}
