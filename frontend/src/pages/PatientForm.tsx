import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError, PatientInput } from "../api/client";
import { useCreatePatient, usePatient, useUpdatePatient } from "../api/hooks";
import ErrorBanner from "../components/ErrorBanner";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STATUSES = ["active", "inactive", "critical"];

const EMPTY: PatientInput = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  email: "",
  phone: "",
  address: "",
  blood_type: "",
  status: "active",
  allergies: "",
  conditions: "",
};

const LABELS: Record<keyof PatientInput, string> = {
  first_name: "First name",
  last_name: "Last name",
  date_of_birth: "Date of birth",
  email: "Email",
  phone: "Phone",
  address: "Address",
  blood_type: "Blood type",
  status: "Status",
  allergies: "Allergies",
  conditions: "Conditions",
};

function validate(form: PatientInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.first_name.trim()) errors.first_name = "First name is required";
  if (!form.last_name.trim()) errors.last_name = "Last name is required";
  if (!form.date_of_birth) {
    errors.date_of_birth = "Date of birth is required";
  } else if (form.date_of_birth > new Date().toISOString().slice(0, 10)) {
    errors.date_of_birth = "Date of birth cannot be in the future";
  }
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  const digits = form.phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    errors.phone = "Phone must contain 7 to 15 digits";
  }
  if (!form.blood_type) errors.blood_type = "Blood type is required";
  return errors;
}

/* One form for creating and editing. Client validation runs first and shows
   inline messages; server 422 errors are mapped onto the same fields. */
export default function PatientForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<PatientInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const { data: existing } = usePatient(isEdit ? id : undefined);
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient(id ?? "");

  useEffect(() => {
    if (existing) {
      setForm({
        first_name: existing.first_name,
        last_name: existing.last_name,
        date_of_birth: existing.date_of_birth,
        email: existing.email,
        phone: existing.phone,
        address: existing.address,
        blood_type: existing.blood_type,
        status: existing.status,
        allergies: existing.allergies,
        conditions: existing.conditions,
      });
    }
  }, [existing]);

  const saving = createMutation.isPending || updateMutation.isPending;

  function set<K extends keyof PatientInput>(key: K, value: PatientInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit();
  }

  async function submit() {
    setBanner(null);
    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }
    try {
      if (isEdit) {
        const updated = await updateMutation.mutateAsync(form);
        navigate(`/patients/${updated.id}`);
      } else {
        const created = await createMutation.mutateAsync(form);
        navigate(`/patients/${created.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        // Server side field errors reuse the inline slots.
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.fields)) {
          mapped[field] = messages.join(" ");
        }
        setErrors(mapped);
      } else if (err instanceof ApiError && err.status === 0) {
        setBanner(err.message);
      } else if (err instanceof ApiError) {
        setBanner(err.message);
      } else {
        setBanner("Something went wrong. Please try again.");
      }
    }
  }

  function inputClass(name: keyof PatientInput) {
    return `w-full rounded border px-3 py-2 text-sm ${
      errors[name] ? "border-red-500" : "border-slate-300"
    }`;
  }

  function field(name: keyof PatientInput, type = "text", placeholder = "") {
    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {LABELS[name]}
        </label>
        <input
          type={type}
          value={form[name]}
          onChange={(e) => set(name, e.target.value)}
          placeholder={placeholder}
          className={inputClass(name)}
        />
        {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">
        {isEdit ? "Edit patient" : "New patient"}
      </h1>

      {banner && <ErrorBanner message={banner} onRetry={submit} />}

      <form onSubmit={handleSubmit} noValidate className="rounded bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold">Personal information</h2>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("first_name")}
          {field("last_name")}
          {field("date_of_birth", "date")}
          {field("email", "email", "name@example.com")}
          {field("phone", "tel", "(617) 555-0100")}
          {field("address", "text", "Street, city, state, zip")}
        </div>

        <h2 className="mb-3 font-semibold">Medical information</h2>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Blood type
            </label>
            <select
              value={form.blood_type}
              onChange={(e) => set("blood_type", e.target.value)}
              className={inputClass("blood_type")}
            >
              <option value="">Select…</option>
              {BLOOD_TYPES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {errors.blood_type && (
              <p className="mt-1 text-xs text-red-600">{errors.blood_type}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className={inputClass("status")}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Allergies
            </label>
            <textarea
              value={form.allergies}
              onChange={(e) => set("allergies", e.target.value)}
              rows={2}
              placeholder="Penicillin, peanuts…"
              className={inputClass("allergies")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Conditions
            </label>
            <textarea
              value={form.conditions}
              onChange={(e) => set("conditions", e.target.value)}
              rows={2}
              placeholder="Hypertension, asthma…"
              className={inputClass("conditions")}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create patient"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border px-5 py-2 text-sm hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
