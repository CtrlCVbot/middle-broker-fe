import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { addresses } from '@/db/schema/addresses';
import { eq } from 'drizzle-orm';
import { IAddress } from '@/types/address';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const errors: { field: string; message: string }[] = [];

    // 필수 필드 검증
    if (!body.name) {
      errors.push({ field: 'name', message: '장소명은 필수입니다.' });
    }
    if (!body.roadAddress) {
      errors.push({ field: 'roadAddress', message: '도로명 주소는 필수입니다.' });
    }
    if (!body.jibunAddress) {
      errors.push({ field: 'jibunAddress', message: '지번 주소는 필수입니다.' });
    }
    if (!body.type || !['load', 'drop', 'any'].includes(body.type)) {
      errors.push({ field: 'type', message: '올바른 주소 유형을 선택해주세요.' });
    }

    // 전화번호 형식 검증 (선택 필드)
    if (body.contactPhone && !/^\d{2,3}-\d{3,4}-\d{4}$/.test(body.contactPhone)) {
      errors.push({ field: 'contactPhone', message: '올바른 전화번호 형식이 아닙니다.' });
    }

    // 우편번호 형식 검증 (선택 필드)
    if (body.postalCode && !/^\d{5}$/.test(body.postalCode)) {
      errors.push({ field: 'postalCode', message: '올바른 우편번호 형식이 아닙니다.' });
    }

    if (errors.length > 0) {
      return NextResponse.json({
        isValid: false,
        errors
      });
    }

    return NextResponse.json({
      isValid: true,
      data: body
    });
  } catch (error) {
    console.error('주소 유효성 검증 중 오류 발생:', error);
    return NextResponse.json(
      { error: '주소 유효성을 검증하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 