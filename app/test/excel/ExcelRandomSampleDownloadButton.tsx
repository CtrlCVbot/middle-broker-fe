'use client';
import { Button } from '@/components/ui/button';
import { downloadExcel, ExcelConfig } from '@/utils/excel';

interface ExcelRandomSampleDownloadButtonProps {
  config: ExcelConfig;
  generateData: (count: number) => any[];
  count?: number;
  filename?: string;
}

export function ExcelRandomSampleDownloadButton({ config, generateData, count = 20, filename }: ExcelRandomSampleDownloadButtonProps) {
  const handleDownload = () => {
    const data = generateData(count);
    downloadExcel(data, config, filename);
  };
  return (
    <Button onClick={handleDownload}>
      랜덤 샘플 엑셀 다운로드
    </Button>
  );
} 