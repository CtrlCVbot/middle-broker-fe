import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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