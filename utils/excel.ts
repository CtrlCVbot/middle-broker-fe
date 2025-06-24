import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { faker } from '@faker-js/faker';
faker.setLocale('ko');

/**
 * 화물 목록 데이터를 엑셀 파일로 생성하여 다운로드합니다.
 * @param data 화물 목록 데이터 배열 (API 응답의 data)
 */
export async function downloadOrdersExcel(data: any[]) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('화물 목록');

    // 엑셀 컬럼 정의 (한글 컬럼명, key는 데이터의 필드명과 일치)
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 20 },
      { header: '화물명', key: 'cargoName', width: 20 },
      { header: '상태', key: 'flowStatus', width: 15 },
      { header: '상차지', key: 'pickupName', width: 20 },
      { header: '하차지', key: 'deliveryName', width: 20 },
      { header: '상차일', key: 'pickupDate', width: 15 },
      { header: '하차일', key: 'deliveryDate', width: 15 },
      // 필요에 따라 컬럼 추가
    ];

    // 데이터 매핑 및 행 추가
    data.forEach((order) => {
      worksheet.addRow({
        id: order.id,
        cargoName: order.cargoName,
        flowStatus: order.flowStatus,
        pickupName: order.pickupName,
        deliveryName: order.deliveryName,
        pickupDate: order.pickupDate,
        deliveryDate: order.deliveryDate,
        // 필요에 따라 추가 필드 매핑
      });
    });

    // 엑셀 파일 버퍼 생성 및 다운로드 트리거
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `orders_${new Date().toISOString().slice(0,10)}.xlsx`);
  } catch (error) {
    // 예외 발생 시 콘솔 출력 및 사용자 알림
    console.error('엑셀 다운로드 오류:', error);
    alert('엑셀 파일 생성 또는 다운로드 중 오류가 발생했습니다.');
  }
}

/**
 * 엑셀 파일을 파싱하여 회사 정보 배열로 변환 후 API로 업로드
 * @param file 엑셀 파일 객체
 */
export async function parseExcelFileAndUpload(file: File): Promise<string> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet);

  const res = await fetch('/api/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(json),
  });
  if (!res.ok) throw new Error('API 업로드 실패');
  return '업로드 성공';
}

/**
 * 회사 정보 샘플 데이터를 엑셀 파일로 생성하여 다운로드합니다.
 */
export async function downloadCompanySampleExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('회사정보 샘플');
  worksheet.columns = [
    { header: '회사명', key: 'name', width: 20 },
    { header: '사업자번호', key: 'bizNo', width: 15 },
    { header: '대표자명', key: 'ceo', width: 15 },
    { header: '연락처', key: 'phone', width: 15 },
    { header: '주소', key: 'address', width: 30 },
  ];
  worksheet.addRow({
    name: '샘플회사',
    bizNo: '123-45-67890',
    ceo: '홍길동',
    phone: '010-1234-5678',
    address: '서울특별시 중구 세종대로 110',
  });
  worksheet.addRow({
    name: '테스트주식회사',
    bizNo: '987-65-43210',
    ceo: '김철수',
    phone: '02-123-4567',
    address: '부산광역시 해운대구 해운대로 123',
  });
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `company_sample.xlsx`);
}

/**
 * 랜덤 회사 정보 데이터 생성
 * @param count 생성할 데이터 개수
 */
export function generateRandomCompanyData(count: number = 10) {
  const companies = [];
  for (let i = 0; i < count; i++) {
    companies.push({
      name: faker.company.name(),
      bizNo: faker.string.numeric(10).replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3'),
      ceo: faker.person.fullName(),
      phone: faker.phone.number('010-####-####'),
      address: faker.location.streetAddress(true),
      email: faker.internet.email(),
      website: faker.internet.url(),
    });
  }
  return companies;
}

/**
 * 랜덤 회사 정보 샘플 데이터를 엑셀 파일로 생성하여 다운로드합니다.
 * @param count 생성할 데이터 개수 (기본값: 10)
 */
export async function downloadRandomCompanySampleExcel(count: number = 10) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('회사정보 샘플');
  worksheet.columns = [
    { header: '회사명', key: 'name', width: 20 },
    { header: '사업자번호', key: 'bizNo', width: 15 },
    { header: '대표자명', key: 'ceo', width: 15 },
    { header: '연락처', key: 'phone', width: 15 },
    { header: '주소', key: 'address', width: 30 },
    { header: '이메일', key: 'email', width: 25 },
    { header: '웹사이트', key: 'website', width: 25 },
  ];
  const randomData = generateRandomCompanyData(count);
  randomData.forEach(company => worksheet.addRow(company));
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `company_sample_${count}rows.xlsx`);
} 