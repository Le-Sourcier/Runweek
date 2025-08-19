export const ToggleSwitch = ({ checked, onChange, disabled = false }: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <label
        className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors ${disabled
          ? 'bg-gray-300 cursor-not-allowed'
          : checked
            ? "bg-primary"
            : "bg-muted"
          }`}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${checked ? "translate-x-6" : ""
            }`}
        ></span>
      </label>
    </div>
  )
};