import {
  CreateProject,
  UpdateProject,
} from "../../Context/Project/CreateList/type";
import http from "../axios";
import { GetIdTs, GetIdUser, getYear, logout } from "../localstorage";
import {
  ProjectRegistrationFrequencyFilters,
  ProjectRegistrationFrequencyQuery,
  ProjectRegistrationFrequencyReport,
  ProjectRegistrationFrequencyResponse,
} from "./frequency.types";

const handleProjectRequestError = (err: any) => {
  if (err.response?.status === 401) {
    logout();
    window.location.reload();
  }
  throw err;
};

const frequencyParams = (filters: ProjectRegistrationFrequencyFilters) => ({
  ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
  ...(filters.year !== undefined ? { year: filters.year } : {}),
  ...(filters.classroomId !== undefined
    ? { classroomId: filters.classroomId }
    : {}),
});

export const requestCreateProject = (data: CreateProject) => {
  return http
    .post("/project", data)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      alert(err.response.message);
      throw err;
    });
};

export const requestDeleteProject = (id: number) => {
  return http
    .delete("/project/" + id)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      throw err;
    });
};

export const requestUpdateProject = (data: UpdateProject, id: number) => {
  return http
    .put("/project/" + id, data)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      alert(err.response.message);
      throw err;
    });
};

export const requestRulerProject = (file: FormData, id: number) => {
  return http
    .put("/archive-project-bff?projectId=" + id, file)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      alert(err.response.message);
      throw err;
    });
};

export const requestRemoveRulerProject = (id: number) => {
  return http
    .put("/archive-project-bff/remove?projectId=" + id)
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }
      alert(err.response.message);
      throw err;
    });
};

export const requestProjectList = async () => {
  if (GetIdUser()) {
    return await http
      .get("/project-user-bff", { params: { userId: GetIdUser() } })
      .then((response) => response.data)
      .catch((err) => {
        if (err.response.status === 401) {
          logout();
          window.location.reload();
        }

        throw err;
      });
  }
};

export const requestTsList = async (id: number | undefined) => {
  if (GetIdTs()) {
    return await http
      .get("/social-technology-bff/one", {
        params: { stId: id ?? GetIdTs(), year: getYear() },
      })
      .then((response) => response.data)
      .catch((err) => {
        if (err.response.status === 401) {
          logout();
          window.location.reload();
        }

        throw err;
      });
  }
};

export const requestTsListYear = async (
  id: number | undefined,
  year: number
) => {
  if (GetIdTs()) {
    return await http
      .get("/social-technology-bff/one", {
        params: { stId: id ?? GetIdTs(), year: year },
      })
      .then((response) => response.data)
      .catch((err) => {
        if (err.response.status === 401) {
          logout();
          window.location.reload();
        }

        throw err;
      });
  }
};

export const requestProjectOne = async (id: number) => {
  return await http
    .get("/project-bff/one", {
      params: { idProject: id ?? GetIdTs() },
    })
    .then((response) => response.data)
    .catch((err) => {
      if (err.response.status === 401) {
        logout();
        window.location.reload();
      }

      throw err;
    });
};

export const requestProjectRegistrationFrequency = async (
  projectId: number,
  query: ProjectRegistrationFrequencyQuery
): Promise<ProjectRegistrationFrequencyResponse> =>
  http
    .get(`/project-bff/${projectId}/registration-frequency`, {
      params: {
        ...frequencyParams(query),
        page: query.page,
        limit: query.limit,
      },
    })
    .then((response) => response.data)
    .catch(handleProjectRequestError);

export const requestProjectRegistrationFrequencyReport = async (
  projectId: number,
  filters: ProjectRegistrationFrequencyFilters
): Promise<ProjectRegistrationFrequencyReport> =>
  http
    .get(`/project-bff/${projectId}/registration-frequency/report`, {
      params: frequencyParams(filters),
    })
    .then((response) => response.data)
    .catch(handleProjectRequestError);
