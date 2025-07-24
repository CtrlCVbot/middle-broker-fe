import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z, ZodError } from 'zod';
//import { getDispatchDetail, updateDispatch, deleteDispatch } from '@/services/broker-dispatch-service';
import { updateDispatchSchema } from '@/types/broker-dispatch';
//import { authOptions } from '@/lib/auth';

// id 파라미터 검증 스키마
const dispatchIdSchema = z.string().uuid('유효한 배차 ID 형식이 아닙니다.');

