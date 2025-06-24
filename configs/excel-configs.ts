import { ExcelConfig } from '../utils/excel';

export const companyExcelConfig: ExcelConfig = {
  columns: [
    { header: '회사명', key: 'name', width: 20 },
    { header: '사업자번호', key: 'businessNumber', width: 15 },
    { header: '대표자명', key: 'ceoName', width: 15 },
    { header: '업체유형', key: 'type', width: 10 },
    { header: '상태', key: 'status', width: 10 },
    { header: '우편번호', key: 'addressPostal', width: 10 },
    { header: '도로명주소', key: 'addressRoad', width: 20 },
    { header: '상세주소', key: 'addressDetail', width: 20 },
    { header: '대표전화', key: 'contactTel', width: 15 },
    { header: '휴대폰', key: 'contactMobile', width: 15 },
    { header: '이메일', key: 'contactEmail', width: 20 },
  ],
  apiEndpoint: '/api/companies',
  headerMapping: {
    '회사명': 'name',
    '사업자번호': 'businessNumber',
    '대표자명': 'ceoName',
    '업체유형': 'type',
    '상태': 'status',
    '우편번호': 'address.postal',
    '도로명주소': 'address.road',
    '상세주소': 'address.detail',
    '대표전화': 'contact.tel',
    '휴대폰': 'contact.mobile',
    '이메일': 'contact.email',
  },
  defaultValues: { type: 'shipper', status: 'active' },
};

export const orderExcelConfig: ExcelConfig = {
  columns: [
    { header: 'ID', key: 'id', width: 20 },
    { header: '화물명', key: 'cargoName', width: 20 },
    { header: '상태', key: 'flowStatus', width: 15 },
    { header: '상차지', key: 'pickupName', width: 20 },
    { header: '하차지', key: 'deliveryName', width: 20 },
    { header: '상차일', key: 'pickupDate', width: 15 },
    { header: '하차일', key: 'deliveryDate', width: 15 },
  ],
  apiEndpoint: '/api/orders',
  headerMapping: {
    'ID': 'id',
    '화물명': 'cargoName',
    '상태': 'flowStatus',
    '상차지': 'pickupName',
    '하차지': 'deliveryName',
    '상차일': 'pickupDate',
    '하차일': 'deliveryDate',
  },
}; 