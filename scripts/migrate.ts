import { DbSchemaChecker } from '../utils/db-schema-checker';
import { DbMigrationHelper } from '../utils/db-migration-helper';

async function main() {
  try {
    console.log('Starting database migration...');

    // 1. 현재 스키마 상태 확인
    console.log('\nChecking current schema state...');
    await DbSchemaChecker.printTableInfo('users');
    await DbSchemaChecker.printTableInfo('companies');

    // 2. users 테이블 마이그레이션
    console.log('\nMigrating users table...');
    
    // auth_id 제약조건 제거 시도
    await DbMigrationHelper.safeDropConstraint('users', 'users_auth_id_unique');

    // 필요한 컬럼 추가
    await DbMigrationHelper.safeAddColumn(
      'users',
      'system_access_level',
      'VARCHAR(50) NOT NULL DEFAULT \'user\''
    );

    await DbMigrationHelper.safeAddColumn(
      'users',
      'email_verified',
      'BOOLEAN NOT NULL DEFAULT false'
    );

    // 3. companies 테이블 마이그레이션
    console.log('\nMigrating companies table...');
    
    // 테이블이 없다면 생성
    await DbMigrationHelper.safeCreateTable(
      'companies',
      `
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      name VARCHAR(255) NOT NULL,
      business_number VARCHAR(20) NOT NULL UNIQUE,
      ceo_name VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'shipper',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      address JSONB NOT NULL,
      contact JSONB NOT NULL,
      business_info JSONB
      `
    );

    // 인덱스 생성
    await DbMigrationHelper.safeCreateIndex(
      'companies',
      'idx_companies_business_number',
      'USING btree (business_number)'
    );

    // 4. 외래 키 관계 설정
    console.log('\nSetting up foreign key relationships...');
    
    await DbMigrationHelper.safeAddForeignKey(
      'users',
      'fk_users_company',
      '(company_id) REFERENCES companies(id)'
    );

    console.log('\nMigration completed successfully!');
    
    // 5. 최종 스키마 상태 확인
    console.log('\nFinal schema state:');
    await DbSchemaChecker.printTableInfo('users');
    await DbSchemaChecker.printTableInfo('companies');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 