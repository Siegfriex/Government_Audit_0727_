interface AtlasRouteErrorProps {
  error: Error;
  onRetry: () => void;
}

export function AtlasRouteError({ error, onRetry }: AtlasRouteErrorProps) {
  return (
    <AtlasErrorState
      title="Atlas 계약 데이터를 확인하지 못했습니다"
      description="오류가 발생해도 개발용 또는 legacy bundle로 대체하지 않습니다. 네트워크 또는 데이터 계약 상태를 확인한 뒤 다시 시도하세요."
      technicalDetail={error.message}
      onRetry={onRetry}
    />
  );
}
import { AtlasErrorState } from '@/shared/ui/atlas';
