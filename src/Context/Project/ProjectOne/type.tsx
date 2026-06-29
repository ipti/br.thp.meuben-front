import { UpdateProject } from "../CreateList/type";

export interface ProjectOneTypes {
  project: ApiProject | undefined;
  isLoading: boolean;
  updateProject: (data: UpdateProject, id: number) => void;
  rulerProject: (file: File, id: number) => void
  deleteProject: (id: number) => void
}

export interface ApiProject {
  project: Project
  active_classroom_count: number
  approved_register_count: number
  total_register_count: number
  students_with_presence_count: number
  active_term_count: number
  invalid_term_count: number
  pending_term_count: number
  no_term_count: number
  students_approved_by_frequency_count: number
}

export interface Project {
  id: number
  name: string
  active: boolean
  approval_percentage: number
  avartar_url: any
  ruler_url: string
  social_technology_id: number
  date_initial: string | null
  date_final: string | null
  createdAt: string
  updatedAt: string
  classrooms: Classroom[]
}

export interface Classroom {
  id: number
  project_fk: number
  name: string
  year: number
  active: boolean
  createdAt: string
  updatedAt: string
  _count: Count
}

export interface Count {
  meeting: number
  register_classroom: number
}
