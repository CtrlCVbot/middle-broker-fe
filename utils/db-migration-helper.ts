import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { DbSchemaChecker } from './db-schema-checker';

/**
 * 안전한 데이터베이스 마이그레이션을 위한 유틸리티 클래스
 */
export class DbMigrationHelper {
  /**
   * 제약조건을 안전하게 삭제
   */
  static async safeDropConstraint(tableName: string, constraintName: string): Promise<void> {
    try {
      const exists = await DbSchemaChecker.constraintExists(tableName, constraintName);
      if (!exists) {
        console.log(`Constraint '${constraintName}' does not exist on table '${tableName}'`);
        return;
      }

      await db.execute(sql`
        ALTER TABLE ${sql.identifier(tableName)} 
        DROP CONSTRAINT IF EXISTS ${sql.identifier(constraintName)};
      `);
      console.log(`Successfully dropped constraint '${constraintName}' from table '${tableName}'`);
    } catch (error) {
      console.error(`Failed to drop constraint '${constraintName}':`, error);
      throw error;
    }
  }

  /**
   * 컬럼을 안전하게 추가
   */
  static async safeAddColumn(
    tableName: string,
    columnName: string,
    columnDefinition: string
  ): Promise<void> {
    try {
      const columns = await DbSchemaChecker.getTableColumns(tableName);
      const columnExists = columns.some(col => col.column_name === columnName);

      if (columnExists) {
        console.log(`Column '${columnName}' already exists in table '${tableName}'`);
        return;
      }

      await db.execute(sql`
        ALTER TABLE ${sql.identifier(tableName)}
        ADD COLUMN IF NOT EXISTS ${sql.identifier(columnName)} ${sql.raw(columnDefinition)};
      `);
      console.log(`Successfully added column '${columnName}' to table '${tableName}'`);
    } catch (error) {
      console.error(`Failed to add column '${columnName}':`, error);
      throw error;
    }
  }

  /**
   * 테이블을 안전하게 생성
   */
  static async safeCreateTable(
    tableName: string,
    tableDefinition: string
  ): Promise<void> {
    try {
      const exists = await DbSchemaChecker.tableExists(tableName);
      if (exists) {
        console.log(`Table '${tableName}' already exists`);
        return;
      }

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ${sql.identifier(tableName)} (
          ${sql.raw(tableDefinition)}
        );
      `);
      console.log(`Successfully created table '${tableName}'`);
    } catch (error) {
      console.error(`Failed to create table '${tableName}':`, error);
      throw error;
    }
  }

  /**
   * 인덱스를 안전하게 생성
   */
  static async safeCreateIndex(
    tableName: string,
    indexName: string,
    indexDefinition: string
  ): Promise<void> {
    try {
      const exists = await db.execute<{ exists: boolean }>(sql`
        SELECT EXISTS (
          SELECT 1
          FROM pg_indexes
          WHERE tablename = ${tableName}
          AND indexname = ${indexName}
        ) as exists;
      `);

      if (exists[0]?.exists) {
        console.log(`Index '${indexName}' already exists on table '${tableName}'`);
        return;
      }

      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS ${sql.identifier(indexName)}
        ON ${sql.identifier(tableName)} ${sql.raw(indexDefinition)};
      `);
      console.log(`Successfully created index '${indexName}' on table '${tableName}'`);
    } catch (error) {
      console.error(`Failed to create index '${indexName}':`, error);
      throw error;
    }
  }

  /**
   * 외래 키를 안전하게 추가
   */
  static async safeAddForeignKey(
    tableName: string,
    constraintName: string,
    foreignKeyDefinition: string
  ): Promise<void> {
    try {
      const exists = await DbSchemaChecker.constraintExists(tableName, constraintName);
      if (exists) {
        console.log(`Foreign key constraint '${constraintName}' already exists on table '${tableName}'`);
        return;
      }

      await db.execute(sql`
        ALTER TABLE ${sql.identifier(tableName)}
        ADD CONSTRAINT ${sql.identifier(constraintName)}
        FOREIGN KEY ${sql.raw(foreignKeyDefinition)};
      `);
      console.log(`Successfully added foreign key '${constraintName}' to table '${tableName}'`);
    } catch (error) {
      console.error(`Failed to add foreign key '${constraintName}':`, error);
      throw error;
    }
  }
} 