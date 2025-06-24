'use client';
import { Button } from '@/components/ui/button';
import { downloadCompanySampleExcel } from '@/utils/excel';

export function ExcelSampleDownloadButton() {
  return (
    <Button onClick={downloadCompanySampleExcel}>
      샘플 엑셀 다운로드
    </Button>
  );
} 