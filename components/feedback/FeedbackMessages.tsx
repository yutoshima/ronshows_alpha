type FeedbackMessagesProps = {
  messages: string[];
};

export const FeedbackMessages = ({ messages }: FeedbackMessagesProps) => {
  if (messages.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
      <div className="text-xs font-bold text-slate-600 mb-2">フィードバック:</div>
      <div className="space-y-1">
        {messages.map((msg, i) => (
          <p key={i} className="text-sm text-slate-700">
            • {msg}
          </p>
        ))}
      </div>
    </div>
  );
};
