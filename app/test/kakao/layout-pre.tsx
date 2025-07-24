import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '카카오 API 테스트 | Middle Broker',
  description: '카카오모빌리티 길찾기 API 테스트 페이지',
};

interface IKakaoTestLayoutProps {
  children: React.ReactNode;
}

export default function KakaoTestLayout({ children }: IKakaoTestLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 