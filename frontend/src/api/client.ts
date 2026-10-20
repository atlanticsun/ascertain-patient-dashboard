/* Typed HTTP client for the patient API.
   The base URL comes from VITE_API_URL so the same build can point at a local
   backend or the docker compose service. */

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  address: string;
  blood_type: string;
  status: 'active' | 'inactive' | 'critical';
  allergies: string;
  conditions: string;
  age: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  patient_id: string;
  content: string;
  created_at: string;
}

export interface PatientPage {
  items: Patient[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface PatientInput {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  address: string;
  blood_type: string;
  status: string;
  allergies: string;
  conditions: string;
}

export interface PatientQuery {
  page?: number;
  page_size?: number;
  q?: string;
  status?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

/** Error thrown for failed API calls. status 0 means the network itself failed. */
export class ApiError extends Error {
  status: number;
  fields: Record<string, string[]>;

  constructor(status: number, message: string, fields: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the API. Check that the backend is running.');
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const body: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    // FastAPI 422 errors look like { detail: [{ loc: [...], msg: ... }] }.
    // Map each one onto its field name so forms can show inline errors.
    const fields: Record<string, string[]> = {};
    const detail = (body as { detail?: unknown }).detail;
    if (Array.isArray(detail)) {
      for (const err of detail as Array<{ loc?: unknown[]; msg?: string }>) {
        const loc = err.loc ?? [];
        const name = String(loc[loc.length - 1] ?? 'form');
        if (!fields[name]) {
          fields[name] = [];
        }
        fields[name].push(err.msg ?? 'Invalid value');
      }
    }
    const message =
      typeof detail === 'string' ? detail : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, fields);
  }

  return body as T;
}

function toQuery(params: PatientQuery): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

export interface PatientStats {
  total: number;
  by_status: Record<string, number>;
}

export const api = {
  listPatients: (params: PatientQuery) => request<PatientPage>(`/patients${toQuery(params)}`),
  getPatientStats: () => request<PatientStats>(`/patients/stats`),
  getPatient: (id: string) => request<Patient>(`/patients/${id}`),
  createPatient: (data: PatientInput) =>
    request<Patient>(`/patients`, { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: string, data: Partial<PatientInput>) =>
    request<Patient>(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (id: string) => request<void>(`/patients/${id}`, { method: 'DELETE' }),
  listNotes: (patientId: string) => request<Note[]>(`/patients/${patientId}/notes`),
  createNote: (patientId: string, content: string) =>
    request<Note>(`/patients/${patientId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  deleteNote: (patientId: string, noteId: string) =>
    request<void>(`/patients/${patientId}/notes/${noteId}`, { method: 'DELETE' }),
  getSummary: (patientId: string) => request<{ summary: string }>(`/patients/${patientId}/summary`),
};
