type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (color: string) => void;
};

export const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => (
  <div className="flex items-center gap-2">
    <label className="text-xs flex-1">{label}</label>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-12 h-8 border border-slate-300 rounded cursor-pointer"
    />
  </div>
);
