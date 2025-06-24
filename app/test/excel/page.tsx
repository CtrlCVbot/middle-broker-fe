import { ExcelDownloadButton } from './ExcelDownloadButton';
import { ExcelUploadButton } from './ExcelUploadButton';
import { ExcelSampleDownloadButton } from './ExcelSampleDownloadButton';
import { ExcelRandomSampleDownloadButton } from './ExcelRandomSampleDownloadButton';

/**
 * 화물 목록 엑셀 다운로드 테스트 페이지
 * - 엑셀 다운로드 버튼 및 간단한 설명 제공
 */
export default function ExcelTestPage() {
  return (
    <div className="p-8 space-y-8">
      <section>
        <h1 className="text-xl font-bold mb-2">화물 목록 엑셀 다운로드</h1>
        <p className="mb-2 text-gray-600">아래 버튼을 클릭하면 화물 목록 데이터를 엑셀 파일로 다운로드할 수 있습니다.</p>
        <ExcelDownloadButton />
      </section>
      <section>
        <h2 className="text-lg font-bold mb-2">회사 정보 엑셀 업로드</h2>
        <p className="mb-2 text-gray-600">엑셀 파일을 선택해 회사 정보를 일괄 업로드할 수 있습니다.</p>
        <ExcelUploadButton />
      </section>
      <section>
        <h2 className="text-lg font-bold mb-2">회사 정보 샘플 엑셀 다운로드</h2>
        <p className="mb-2 text-gray-600">API 요구사항에 맞는 고정 샘플 데이터를 엑셀로 다운로드할 수 있습니다.</p>
        <ExcelSampleDownloadButton />
      </section>
      <section>
        <h2 className="text-lg font-bold mb-2">회사 정보 랜덤 샘플 엑셀 다운로드</h2>
        <p className="mb-2 text-gray-600">faker를 활용해 랜덤한 회사 정보 샘플 데이터를 엑셀로 다운로드할 수 있습니다.</p>
        <ExcelRandomSampleDownloadButton />
      </section>
    </div>
  );
} 