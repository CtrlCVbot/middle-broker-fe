'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { parseExcelFileAndUpload } from '@/utils/excel';

export function ExcelUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setResult(null);
    try {
      const res = await parseExcelFileAndUpload(file);
      setResult(res);
    } catch (err) {
      setResult('업로드 실패: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx,.xls"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button onClick={() => inputRef.current?.click()} disabled={isLoading}>
        {isLoading ? '업로드 중...' : '엑셀 업로드'}
      </Button>
      {result && <div className="mt-2 text-sm">{result}</div>}
    </div>
  );
} 