import { InferModel } from 'drizzle-orm';
import { users } from '@/db/schema/users';
import { companies } from '@/db/schema/companies';

// 테이블 타입 정의
export type User = InferModel<typeof users>;
export type Company = InferModel<typeof companies>;

// ID 타입 정의
export type UserId = User['id'];
export type CompanyId = Company['id']; 