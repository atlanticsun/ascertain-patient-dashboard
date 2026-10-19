/* React Query hooks. Server state (patients, notes) lives here instead of in
   component state, so caching, background refetching, and loading states are
   handled in one place. */
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, PatientInput, PatientQuery } from "./client";

export function usePatients(params: PatientQuery) {
  return useQuery({
    // keepPreviousData keeps the old page visible while the next one loads,
    // so paging never flashes an empty table.
    queryKey: ["patients", params],
    queryFn: () => api.listPatients(params),
    placeholderData: keepPreviousData,
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => api.getPatient(id as string),
    enabled: Boolean(id),
  });
}

export function useNotes(patientId: string | undefined) {
  return useQuery({
    queryKey: ["notes", patientId],
    queryFn: () => api.listNotes(patientId as string),
    enabled: Boolean(patientId),
  });
}

export function useSummary(patientId: string | undefined) {
  return useQuery({
    queryKey: ["summary", patientId],
    queryFn: () => api.getSummary(patientId as string),
    enabled: Boolean(patientId),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PatientInput) => api.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PatientInput>) => api.updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useCreateNote(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => api.createNote(patientId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", patientId] });
      queryClient.invalidateQueries({ queryKey: ["summary", patientId] });
    },
  });
}

export function useDeleteNote(patientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => api.deleteNote(patientId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", patientId] });
      queryClient.invalidateQueries({ queryKey: ["summary", patientId] });
    },
  });
}
