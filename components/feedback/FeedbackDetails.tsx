import { DetailItem } from './DetailItem';
import { FeedbackResult } from '../../lib/types';

type FeedbackDetailsProps = {
  details: FeedbackResult['details'];
};

export const FeedbackDetails = ({ details }: FeedbackDetailsProps) => (
  <div className="space-y-2 mb-4">
    <DetailItem
      label={`ノード: ${details.nodesCorrect ? '正解' : '不正解'}`}
      isCorrect={details.nodesCorrect}
    />
    <DetailItem
      label={`接続: ${details.edgesCorrect ? '正解' : '不正解'}`}
      isCorrect={details.edgesCorrect}
    />
    <DetailItem
      label={`リンク種類: ${details.edgeTypesCorrect ? '正解' : '不正解'}`}
      isCorrect={details.edgeTypesCorrect}
    />
    <DetailItem
      label={`矢印向き: ${details.arrowDirectionsCorrect ? '正解' : '不正解'}`}
      isCorrect={details.arrowDirectionsCorrect}
    />
  </div>
);
