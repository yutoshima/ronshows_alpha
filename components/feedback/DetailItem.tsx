type DetailItemProps = {
  label: string;
  isCorrect: boolean;
};

export const DetailItem = ({ label, isCorrect }: DetailItemProps) => (
  <div
    className={`flex items-center gap-2 p-2 rounded ${
      isCorrect ? 'bg-green-50' : 'bg-red-50'
    }`}
  >
    <span
      className={`font-bold ${
        isCorrect ? 'text-green-600' : 'text-red-600'
      }`}
    >
      {isCorrect ? '✓' : '×'}
    </span>
    <span className="text-sm text-slate-700">{label}</span>
  </div>
);
