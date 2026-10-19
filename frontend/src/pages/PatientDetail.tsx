import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useCreateNote,
  useDeleteNote,
  useDeletePatient,
  useNotes,
  usePatient,
  useSummary,
} from "../api/hooks";
import StatusBadge from "../components/StatusBadge";
import ErrorBanner from "../components/ErrorBanner";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noteText, setNoteText] = useState("");

  const patientQuery = usePatient(id);
  const notesQuery = useNotes(id);
  const summaryQuery = useSummary(id);
  const createNote = useCreateNote(id ?? "");
  const deleteNote = useDeleteNote(id ?? "");
  const deletePatient = useDeletePatient();

  const patient = patientQuery.data;

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    const content = noteText.trim();
    if (!content) {
      return;
    }
    await createNote.mutateAsync(content);
    setNoteText("");
  }

  async function removePatient() {
    if (!id) {
      return;
    }
    if (window.confirm("Delete this patient and all of their notes?")) {
      await deletePatient.mutateAsync(id);
      navigate("/patients");
    }
  }

  if (patientQuery.isLoading) {
    return <p className="text-slate-500">Loading patient…</p>;
  }
  if (patientQuery.isError || !patient) {
    return (
      <ErrorBanner
        message="Could not load this patient. They may have been deleted."
        onRetry={() => patientQuery.refetch()}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/patients" className="text-sm text-blue-700 hover:underline">
          ← Back to patients
        </Link>
        <div className="flex gap-2">
          <Link
            to={`/patients/${patient.id}/edit`}
            className="rounded border px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            Edit
          </Link>
          <button
            onClick={removePatient}
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mb-6 rounded bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {patient.first_name} {patient.last_name}
          </h1>
          <StatusBadge status={patient.status} />
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Age</dt>
            <dd className="font-medium">{patient.age}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Date of birth</dt>
            <dd className="font-medium">{formatDate(patient.date_of_birth)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Blood type</dt>
            <dd className="font-medium">{patient.blood_type || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium">{patient.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd className="font-medium">{patient.phone}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Address</dt>
            <dd className="font-medium">{patient.address || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Allergies</dt>
            <dd className="font-medium">{patient.allergies || "None recorded"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Conditions</dt>
            <dd className="font-medium">{patient.conditions || "None recorded"}</dd>
          </div>
        </dl>
      </div>

      <div className="mb-6 rounded bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold">Summary</h2>
        {summaryQuery.isLoading && <p className="text-sm text-slate-500">Generating…</p>}
        {summaryQuery.isError && (
          <ErrorBanner
            message="Could not load the summary."
            onRetry={() => summaryQuery.refetch()}
          />
        )}
        {summaryQuery.data && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {summaryQuery.data.summary}
          </p>
        )}
      </div>

      <div className="rounded bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold">Clinical notes</h2>

        <form onSubmit={addNote} className="mb-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            placeholder="Add a clinical note…"
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={createNote.isPending || !noteText.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createNote.isPending ? "Adding…" : "Add note"}
          </button>
        </form>

        {notesQuery.isLoading && <p className="text-sm text-slate-500">Loading notes…</p>}
        {notesQuery.isError && (
          <ErrorBanner
            message="Could not load notes."
            onRetry={() => notesQuery.refetch()}
          />
        )}
        {notesQuery.data && notesQuery.data.length === 0 && (
          <p className="text-sm text-slate-500">No notes yet.</p>
        )}
        <ul className="flex flex-col gap-3">
          {(notesQuery.data ?? []).map((note) => (
            <li key={note.id} className="rounded border border-slate-200 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {formatDateTime(note.created_at)}
                </span>
                <button
                  onClick={() => deleteNote.mutate(note.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
              <p className="whitespace-pre-line text-sm">{note.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
