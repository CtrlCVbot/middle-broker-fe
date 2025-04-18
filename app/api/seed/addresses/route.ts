import { NextResponse } from 'next/server';
import { db } from '@/db';
import { addresses } from '@/db/schema/addresses';
import { mockAddresses } from '@/utils/mock-data';

export async function GET() {
  try {
    // 이미 등록된 데이터가 있는지 확인
    const existingAddresses = await db.select({ id: addresses.id }).from(addresses);
    
    if (existingAddresses.length > 0) {
      return NextResponse.json({
        success: false,
        message: '이미 주소 데이터가 존재합니다. 중복 등록을 방지하기 위해 처리되지 않았습니다.',
        count: existingAddresses.length
      }, { status: 400 });
    }
    
    // mockAddresses 데이터 형식 변환 (Date 객체를 ISO 문자열로 변환)
    const formattedAddresses = mockAddresses.map(address => {
      // DB 스키마에 맞게 데이터 변환
      return {
        id: address.id,
        name: address.name,
        type: address.type,
        roadAddress: address.roadAddress,
        jibunAddress: address.jibunAddress,
        detailAddress: address.detailAddress,
        postalCode: address.postalCode,
        contactName: address.contactName,
        contactPhone: address.contactPhone,
        memo: address.memo,
        isFrequent: address.isFrequent,
        metadata: address.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null
      };
    });
    
    // 모든 주소 데이터 한 번에 삽입
    const insertedAddresses = await db.insert(addresses).values(formattedAddresses).returning({ id: addresses.id });
    
    return NextResponse.json({
      success: true,
      message: '주소 목업 데이터가 성공적으로 DB에 추가되었습니다.',
      count: insertedAddresses.length,
      insertedIds: insertedAddresses.map(addr => addr.id)
    });
    
  } catch (error) {
    console.error('주소 시드 데이터 추가 중 오류 발생:', error);
    
    return NextResponse.json({
      success: false,
      message: '주소 목업 데이터 추가 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 