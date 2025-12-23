type FeedbackHeaderProps = {
  correct: boolean;
  score: number;
};

export const FeedbackHeader = ({ correct, score }: FeedbackHeaderProps) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`text-4xl ${correct ? 'text-green-500' : 'text-red-500'}`}>
      {correct ? '✓' : '×'}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-800">
        {correct ? '正解です！' : '不正解です'}
      </h3>
      <div className="text-lg text-slate-600">スコア: {score}/100</div>
    </div>
  </div>
);
