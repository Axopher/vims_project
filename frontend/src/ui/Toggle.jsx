// src/ui/Toggle.jsx
export default function Toggle({ enabled, onChange, label }) {
  return (
    <div className="flex items-center space-x-3">
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
          enabled ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </div>
  );
}
