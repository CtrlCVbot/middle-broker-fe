'use client';
import { Button } from '@/components/ui/button';
import { downloadRandomCompanySampleExcel } from '@/utils/excel';

export function ExcelRandomSampleDownloadButton() {
  return (
    <Button onClick={() => downloadRandomCompanySampleExcel(20)}>
      랜덤 샘플 엑셀 다운로드
    </Button>
  );
} 