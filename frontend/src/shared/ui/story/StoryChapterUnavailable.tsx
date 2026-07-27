import { Link } from 'react-router';

import { ChapterFrame } from '@/shared/ui/ChapterFrame';
import { PageFrame } from '@/shared/ui/PageFrame';
import { AtlasDataUnavailable } from '@/shared/ui/atlas';

interface StoryChapterUnavailableProps {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  reason: string;
}

export function StoryChapterUnavailable({
  id,
  orderNumber,
  title,
  description,
  reason,
}: StoryChapterUnavailableProps) {
  return (
    <ChapterFrame id={id} orderNumber={orderNumber}>
      <PageFrame>
        <div className="py-8 md:py-12">
          <AtlasDataUnavailable
            title={title}
            description={description}
            reason={reason}
            testId={`story-${id}-data-unavailable`}
            actions={(
              <>
                <Link className="atlas-action-primary" to="/data">데이터 승인 상태 확인</Link>
                <Link className="atlas-action-secondary" to="/method">분석 계약 확인</Link>
                <Link className="atlas-action-secondary" to="/atlas">전체 Atlas로 이동</Link>
              </>
            )}
          />
        </div>
      </PageFrame>
    </ChapterFrame>
  );
}
