'use client';

import { ExcelDownloadButton } from './ExcelDownloadButton';
import { ExcelUploadButton } from './ExcelUploadButton';
import { ExcelSampleDownloadButton } from './ExcelSampleDownloadButton';
import { ExcelRandomSampleDownloadButton } from './ExcelRandomSampleDownloadButton';
import { companyExcelConfig, orderExcelConfig } from '@/configs/excel-configs';
import { useState } from 'react';
import { generateRandomCompanyData } from '@/utils/excel';

// 샘플/랜덤 데이터 생성 함수 예시
const companySampleData = [
  {
    name: '샘플회사',
    businessNumber: '123-45-67890',
    ceoName: '홍길동',
    type: 'shipper',
    status: 'active',
    address: { postal: '', road: '', detail: '' },
    contact: { tel: '', mobile: '', email: '' },
  },
  {
    name: '테스트주식회사',
    businessNumber: '987-65-43210',
    ceoName: '김철수',
    type: 'carrier',
    status: 'active',
    address: { postal: '', road: '', detail: '' },
    contact: { tel: '', mobile: '', email: '' },
  },
];



/**
 * 화물 목록 엑셀 다운로드 테스트 페이지
 * - 엑셀 다운로드 버튼 및 간단한 설명 제공
 */
export default function ExcelTestPage() {
  const [orderData, setOrderData] = useState<any[]>([]);

  // 예시: 화물 데이터 fetch (실제 구현에서는 useEffect 등 활용)
  // useEffect(() => { fetch ... setOrderData(...) }, [])

  return (
    <div className="p-8 space-y-8">
      <section>
        <h1 className="text-xl font-bold mb-2">화물 목록 엑셀 다운로드</h1>
        <p className="mb-2 text-gray-600">아래 버튼을 클릭하면 화물 목록 데이터를 엑셀 파일로 다운로드할 수 있습니다.</p>
        <ExcelDownloadButton config={orderExcelConfig} filename="orders.xlsx" />
      </section>
      <section>
        <h2 className="text-lg font-bold mb-2">회사 정보 엑셀 업로드</h2>
        <p className="mb-2 text-gray-600">엑셀 파일을 선택해 회사 정보를 일괄 업로드할 수 있습니다.</p>
        <ExcelUploadButton config={companyExcelConfig} />
      </section>
      <section>
        <h2 className="text-lg font-bold mb-2">회사 정보 샘플 엑셀 다운로드</h2>
        <p className="mb-2 text-gray-600">API 요구사항에 맞는 고정 샘플 데이터를 엑셀로 다운로드할 수 있습니다.</p>
        <ExcelSampleDownloadButton config={companyExcelConfig} sampleData={companySampleData} filename="company_sample.xlsx" />
      </section>
      <section>
        <h2 className="text-lg font-bold mb-2">회사 정보 랜덤 샘플 엑셀 다운로드</h2>
        <p className="mb-2 text-gray-600">faker를 활용해 랜덤한 회사 정보 샘플 데이터를 엑셀로 다운로드할 수 있습니다.</p>
        <ExcelRandomSampleDownloadButton config={companyExcelConfig} generateData={generateRandomCompanyData} count={20} filename="company_random.xlsx" />
      </section>
    </div>
  );
} 