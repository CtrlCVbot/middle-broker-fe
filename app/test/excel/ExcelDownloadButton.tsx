'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { downloadExcel, ExcelConfig } from '@/utils/excel';

interface ExcelDownloadButtonProps {  
  config: ExcelConfig;
  filename?: string;
}

/**
 * 화물 목록 엑셀 다운로드 버튼 컴포넌트
 * - 클릭 시 /api/orders에서 데이터 fetch 후 엑셀 다운로드
 */
export function ExcelDownloadButton({ config, filename }: ExcelDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(config.apiEndpoint);
      if (!res.ok) throw new Error('API 요청 실패');
      const { data } = await res.json();
      await downloadExcel(data, config, filename);
    } catch (e) {
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={isLoading}>
      {isLoading ? '다운로드 중...' : '엑셀 다운로드'}
    </Button>
  );
} 