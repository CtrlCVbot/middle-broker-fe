import { ExcelDownloadButton } from './ExcelDownloadButton';

/**
 * 화물 목록 엑셀 다운로드 테스트 페이지
 * - 엑셀 다운로드 버튼 및 간단한 설명 제공
 */
export default function ExcelTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">화물 목록 엑셀 다운로드 테스트</h1>
      <p className="mb-4 text-gray-600">아래 버튼을 클릭하면 화물 목록 데이터를 엑셀 파일로 다운로드할 수 있습니다.</p>
      <ExcelDownloadButton />
    </div>
  );
} 