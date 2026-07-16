import http from "../axios";
import { TermType } from "./type";

export async function getTermTypes(activeOnly = true): Promise<TermType[]> {
  const params = activeOnly ? { activeOnly: "true" } : {};
  const response = await http.get<TermType[]>("/term-type-bff", { params });
  return response.data;
}

export interface CreateTermTypeDto {
  code: string;
  label: string;
  is_adhesion_term?: boolean;
  order?: number;
}

export interface UpdateTermTypeDto {
  label?: string;
  active?: boolean;
  order?: number;
}

export async function createTermType(body: CreateTermTypeDto): Promise<TermType> {
  const response = await http.post<TermType>("/term-type-bff", body);
  return response.data;
}

export async function updateTermType(id: number, body: UpdateTermTypeDto): Promise<TermType> {
  const response = await http.put<TermType>(`/term-type-bff/${id}`, body);
  return response.data;
}

export async function deleteTermType(id: number): Promise<void> {
  await http.delete(`/term-type-bff/${id}`);
}
