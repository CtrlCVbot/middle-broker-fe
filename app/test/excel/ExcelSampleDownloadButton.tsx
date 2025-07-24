'use client';
import { Button } from '@/components/ui/button';
import { downloadExcel, ExcelConfig } from '@/utils/excel';

interface ExcelSampleDownloadButtonProps {
  config: ExcelConfig;
  sampleData: any[];
  filename?: string;
}

export function ExcelSampleDownloadButton({ config, sampleData, filename }: ExcelSampleDownloadButtonProps) {
  const handleDownload = () => {
    downloadExcel(sampleData, config, filename);
  };
  return (
    <Button onClick={handleDownload}>
      샘플 엑셀 다운로드
    </Button>
  );
} 