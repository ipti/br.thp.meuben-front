import { TermType } from '../TermType/type';

export type RegisterTermStatus =
  | 'TERM_ANALYSIS'
  | 'ACTIVE_TERM'
  | 'INACTIVE_TERM'
  | 'INVALID_TERM';

export interface BlobFile {
  id: number;
  blob_url: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterTerm {
  id: number;
  dateTerm: string;
  dateValid: string | null;
  observation: string | null;
  has_original_format_change?: boolean;
  status: RegisterTermStatus;
  term_type_id: number | null;
  term_type: TermType | null;
  registration_fk: number;
  blob_file_fk?: number | null;
  blob_file?: BlobFile | null;
  createdAt: string;
  updatedAt: string;
}
