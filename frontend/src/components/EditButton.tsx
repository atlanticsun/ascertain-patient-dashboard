import { Link } from 'react-router-dom';

export function PencilIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11.5 2.5l2 2L5 13l-2.6.6L3 11l8.5-8.5z" />
    </svg>
  );
}

/* Small animated edit button used in the patient list and detail pages. */
export default function EditButton({ to }: { to: string }) {
  return (
    <Link to={to} className="btn-edit" aria-label="Edit patient">
      <PencilIcon />
      Edit
    </Link>
  );
}
