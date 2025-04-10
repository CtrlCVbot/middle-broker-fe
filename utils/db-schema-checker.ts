import { sql } from 'drizzle-orm';
import { db } from '@/db';

interface TableInfo extends Record<string, unknown> {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface ConstraintInfo extends Record<string, unknown> {
  table_name: string;
  constraint_name: string;
  constraint_type: string;
}

/**
 * 데이터베이스 스키마 정보를 확인하는 유틸리티 클래스
 */
export class DbSchemaChecker {
  /**
   * 테이블의 컬럼 정보를 조회
   */
  static async getTableColumns(tableName: string): Promise<TableInfo[]> {
    const columns = await db.execute<TableInfo>(sql`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    return columns;
  }

  /**
   * 테이블의 제약조건 정보를 조회
   */
  static async getTableConstraints(tableName: string): Promise<ConstraintInfo[]> {
    const constraints = await db.execute<ConstraintInfo>(sql`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_name = ${tableName}
      AND tc.table_schema = 'public'
      ORDER BY tc.constraint_name;
    `);
    return constraints;
  }

  /**
   * 테이블 존재 여부 확인
   */
  static async tableExists(tableName: string): Promise<boolean> {
    const result = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = ${tableName}
        AND table_schema = 'public'
      ) as exists;
    `);
    return result[0]?.exists ?? false;
  }

  /**
   * 제약조건 존재 여부 확인
   */
  static async constraintExists(tableName: string, constraintName: string): Promise<boolean> {
    const result = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = ${tableName}
        AND constraint_name = ${constraintName}
        AND table_schema = 'public'
      ) as exists;
    `);
    return result[0]?.exists ?? false;
  }

  /**
   * 테이블 정보 전체 출력
   */
  static async printTableInfo(tableName: string): Promise<void> {
    console.log(`\n=== Table: ${tableName} ===`);
    
    // 테이블 존재 확인
    const exists = await this.tableExists(tableName);
    if (!exists) {
      console.log(`Table '${tableName}' does not exist.`);
      return;
    }

    // 컬럼 정보 출력
    console.log('\nColumns:');
    const columns = await this.getTableColumns(tableName);
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      if (col.column_default) {
        console.log(`    Default: ${col.column_default}`);
      }
    });

    // 제약조건 정보 출력
    console.log('\nConstraints:');
    const constraints = await this.getTableConstraints(tableName);
    constraints.forEach(con => {
      console.log(`  ${con.constraint_name} (${con.constraint_type})`);
    });
  }
} 