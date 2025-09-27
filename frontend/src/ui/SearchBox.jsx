// vims_project/frontend/src/ui/SearchBox.jsx

export default function SearchBox({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Search..."}
      className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500/20"
    />
  );
}
