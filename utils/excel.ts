import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { fakerKO } from '@faker-js/faker';
import { companyExcelConfig } from '@/configs/excel-configs';

const faker = fakerKO;

export interface ExcelConfig {
  columns: Array<{ header: string; key: string; width?: number }>;
  apiEndpoint: string;
  headerMapping: Record<string, string>;
  defaultValues?: Record<string, any>;
}

export function mapExcelRowToApi(row: any, headerMapping: Record<string, string>, defaultValues?: Record<string, any>) {
  const result: any = { ...(defaultValues || {}) };
  for (const [header, value] of Object.entries(row)) {
    const apiField = headerMapping[header];
    if (!apiField) continue;
    // 중첩 필드 지원 (address.postal 등)
    if (apiField.includes('.')) {
      const [parent, child] = apiField.split('.');
      result[parent] = result[parent] || {};
      result[parent][child] = value;
    } else {
      result[apiField] = value;
    }
  }
  return result;
}

export async function downloadExcel<T>(data: T[], config: ExcelConfig, filename?: string) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    worksheet.columns = config.columns;
    data.forEach((row) => worksheet.addRow(row));
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), filename || `export_${new Date().toISOString().slice(0,10)}.xlsx`);
  } catch (error) {
    console.error('엑셀 다운로드 오류:', error);
    alert('엑셀 파일 생성 또는 다운로드 중 오류가 발생했습니다.');
  }
}

export async function uploadExcel(file: File, config: ExcelConfig): Promise<any> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet);
  const mapped = json.map(row => mapExcelRowToApi(row, config.headerMapping, config.defaultValues));
  const res = await fetch(config.apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapped),
  });
  if (!res.ok) throw new Error('API 업로드 실패');
  return res.json();
}


// =========================
// 회사 관련 엑셀 함수
// =========================
/**
 * 랜덤 회사 정보 데이터 생성
 * @param count 생성할 데이터 개수
 */
export function generateRandomCompanyData(count: number) {
  // 실제 구현에서는 faker 등 활용
  return Array.from({ length: count }, (_, i) => ({
    name: faker.company.name(),
    businessNumber: faker.string.numeric(10).replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3'),
    ceoName: faker.person.fullName(),
    //type: 'shipper',
    //status: 'active',
    addressPostal: '',
    addressRoad: faker.location.streetAddress(true), 
    addressDetail: '',
    contactTel: '031-' + faker.string.numeric(4) + '-' + faker.string.numeric(4), 
    contactMobile: '010-' + faker.string.numeric(4) + '-' + faker.string.numeric(4), 
    contactEmail: generateSimpleEmail() 
  }));
}

function generateSimpleEmail() {
  //const name = faker.person.firstName().toLowerCase();
  //const id = faker.number.int({ min: 100, max: 999 });
  const id = faker.string.alphanumeric(4)
  return `faker${id}@example.com`;
}

