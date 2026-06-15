export interface CreateProjectTypes {
    CreateProject: (body: CreateProject) => void
}


export interface CreateProject {
    name: string,
    approval_percentage: number,
    socialTechnologyId: number,
    date_initial?: string,
    date_final?: string,
}

export interface UpdateProject {
    name: string,
    approval_percentage: number,
    date_initial?: string,
    date_final?: string,
}