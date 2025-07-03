import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API 모니터링 테스트 | Middle Broker',
  description: '카카오 API 사용량 모니터링 및 성능 분석 테스트 페이지',
};

interface IApiMonitorTestLayoutProps {
  children: React.ReactNode;
}

export default function ApiMonitorTestLayout({ children }: IApiMonitorTestLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 