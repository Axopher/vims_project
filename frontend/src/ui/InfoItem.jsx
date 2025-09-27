export default function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value ?? "-"}</p>
    </div>
  );
}
