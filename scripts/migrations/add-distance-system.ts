import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

/**
 * 거리 시스템 마이그레이션 실행 함수
 * 
 * 실행하는 작업:
 * 1. Enum 타입 생성
 * 2. distance_cache 테이블 생성
 * 3. kakao_api_usage 테이블 생성
 * 4. orders 테이블에 필드 추가
 * 5. 성능 최적화 인덱스 생성
 * 6. 업데이트 트리거 생성
 */
async function runDistanceSystemMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  }

  const sql_client = postgres(connectionString);
  const db = drizzle(sql_client);

  try {
    console.log('🚀 거리 시스템 마이그레이션 시작...');

    // 1. Enum 타입 생성
    console.log('📝 Enum 타입 생성 중...');
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_priority') THEN
          CREATE TYPE route_priority AS ENUM ('RECOMMEND', 'TIME', 'DISTANCE');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'calculation_method') THEN
          CREATE TYPE calculation_method AS ENUM ('api', 'cached', 'manual');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kakao_api_type') THEN
          CREATE TYPE kakao_api_type AS ENUM ('directions', 'search-address');
        END IF;
      END $$;
    `);

    // 2. distance_cache 테이블 생성
    console.log('🗄️ distance_cache 테이블 생성 중...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS distance_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pickup_address_id UUID NOT NULL REFERENCES addresses(id),
        delivery_address_id UUID NOT NULL REFERENCES addresses(id),
        pickup_coordinates JSONB NOT NULL,
        delivery_coordinates JSONB NOT NULL,
        distance_km DECIMAL(10,2) NOT NULL,
        duration_minutes INTEGER NOT NULL,
        route_priority route_priority NOT NULL DEFAULT 'RECOMMEND',
        kakao_response JSONB,
        is_valid BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 3. kakao_api_usage 테이블 생성
    console.log('📊 kakao_api_usage 테이블 생성 중...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS kakao_api_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        api_type kakao_api_type NOT NULL,
        endpoint VARCHAR(200),
        request_params JSONB NOT NULL,
        response_status INTEGER NOT NULL,
        response_time_ms INTEGER NOT NULL,
        success BOOLEAN NOT NULL,
        error_message VARCHAR(500),
        result_count INTEGER,
        user_id UUID REFERENCES users(id),
        ip_address VARCHAR(45) NOT NULL,
        user_agent VARCHAR(500),
        estimated_cost INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 4. orders 테이블에 필드 추가 (존재하지 않는 경우에만)
    console.log('🔄 orders 테이블 필드 추가 중...');
    
    // 필드 존재 여부 확인 후 추가
    const addColumnIfNotExists = async (tableName: string, columnName: string, columnDefinition: string) => {
      await db.execute(sql`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = '${tableName}' AND column_name = '${columnName}') THEN
            EXECUTE 'ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}';
          END IF;
        END $$;
      `);
    };

    await addColumnIfNotExists('orders', 'actual_distance_km', 'DECIMAL(10,2)');
    await addColumnIfNotExists('orders', 'actual_duration_minutes', 'INTEGER');
    await addColumnIfNotExists('orders', 'distance_calculation_method', 'calculation_method DEFAULT \'api\'');
    await addColumnIfNotExists('orders', 'distance_calculated_at', 'TIMESTAMP');
    await addColumnIfNotExists('orders', 'distance_cache_id', 'UUID');
    await addColumnIfNotExists('orders', 'distance_metadata', 'JSONB');

    // 5. 인덱스 생성 (존재하지 않는 경우에만)
    console.log('🔍 인덱스 생성 중...');
    
    const createIndexIfNotExists = async (indexName: string, createStatement: string) => {
      await db.execute(sql`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = '${indexName}') THEN
            EXECUTE '${createStatement}';
          END IF;
        END $$;  
      `);
    };

    // distance_cache 인덱스
    await createIndexIfNotExists(
      'idx_distance_cache_address_pair',
      'CREATE INDEX idx_distance_cache_address_pair ON distance_cache (pickup_address_id, delivery_address_id, route_priority)'
    );
    
    await createIndexIfNotExists(
      'idx_distance_cache_latest',
      'CREATE INDEX idx_distance_cache_latest ON distance_cache (pickup_address_id, delivery_address_id, created_at DESC)'
    );
    
    await createIndexIfNotExists(
      'idx_distance_cache_valid',
      'CREATE INDEX idx_distance_cache_valid ON distance_cache (is_valid, created_at DESC) WHERE is_valid = true'
    );

    await createIndexIfNotExists(
      'idx_distance_cache_coordinates',
      'CREATE INDEX idx_distance_cache_coordinates ON distance_cache USING GIN (pickup_coordinates, delivery_coordinates)'
    );

    // kakao_api_usage 인덱스
    await createIndexIfNotExists(
      'idx_kakao_api_usage_type_date',
      'CREATE INDEX idx_kakao_api_usage_type_date ON kakao_api_usage (api_type, created_at DESC)'
    );
    
    await createIndexIfNotExists(
      'idx_kakao_api_usage_user_date',
      'CREATE INDEX idx_kakao_api_usage_user_date ON kakao_api_usage (user_id, created_at DESC)'
    );
    
    await createIndexIfNotExists(
      'idx_kakao_api_usage_success_date',
      'CREATE INDEX idx_kakao_api_usage_success_date ON kakao_api_usage (success, created_at DESC)'
    );

    await createIndexIfNotExists(
      'idx_kakao_api_usage_performance',
      'CREATE INDEX idx_kakao_api_usage_performance ON kakao_api_usage (response_time_ms, created_at DESC)'
    );

    await createIndexIfNotExists(
      'idx_kakao_api_usage_daily_stats',
      'CREATE INDEX idx_kakao_api_usage_daily_stats ON kakao_api_usage (DATE(created_at), api_type, success)'
    );

    await createIndexIfNotExists(
      'idx_kakao_api_usage_errors',
      'CREATE INDEX idx_kakao_api_usage_errors ON kakao_api_usage (response_status, created_at DESC) WHERE success = false'
    );

    // orders 테이블 추가 인덱스
    await createIndexIfNotExists(
      'idx_orders_distance_method',
      'CREATE INDEX idx_orders_distance_method ON orders (distance_calculation_method, created_at DESC)'
    );
    
    await createIndexIfNotExists(
      'idx_orders_actual_distance',
      'CREATE INDEX idx_orders_actual_distance ON orders (actual_distance_km, created_at DESC) WHERE actual_distance_km IS NOT NULL'
    );

    // 6. 업데이트 트리거 생성 (distance_cache의 updated_at 자동 갱신)
    console.log('⚡ 트리거 생성 중...');
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_distance_cache_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await db.execute(sql`
      DROP TRIGGER IF EXISTS update_distance_cache_updated_at ON distance_cache;
      CREATE TRIGGER update_distance_cache_updated_at
          BEFORE UPDATE ON distance_cache
          FOR EACH ROW
          EXECUTE FUNCTION update_distance_cache_updated_at();
    `);

    console.log('✅ 거리 시스템 마이그레이션 완료!');
    console.log('📋 생성된 테이블:');
    console.log('   - distance_cache (거리 캐시)');
    console.log('   - kakao_api_usage (API 사용량 기록)');
    console.log('📋 수정된 테이블:');
    console.log('   - orders (거리 관련 필드 추가)');
    console.log('📋 생성된 인덱스: 12개');
    console.log('📋 생성된 트리거: 1개');

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    throw error;
  } finally {
    await sql_client.end();
  }
}

/**
 * 마이그레이션 롤백 함수 (필요시 사용)
 */
async function rollbackDistanceSystemMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  }

  const sql_client = postgres(connectionString);
  const db = drizzle(sql_client);

  try {
    console.log('🔄 거리 시스템 마이그레이션 롤백 시작...');

    // 트리거 삭제
    await db.execute(sql`DROP TRIGGER IF EXISTS update_distance_cache_updated_at ON distance_cache;`);
    await db.execute(sql`DROP FUNCTION IF EXISTS update_distance_cache_updated_at();`);

    // 테이블 삭제
    await db.execute(sql`DROP TABLE IF EXISTS distance_cache CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS kakao_api_usage CASCADE;`);

    // orders 테이블에서 추가된 필드 삭제
    await db.execute(sql`
      ALTER TABLE orders 
      DROP COLUMN IF EXISTS actual_distance_km,
      DROP COLUMN IF EXISTS actual_duration_minutes,
      DROP COLUMN IF EXISTS distance_calculation_method,
      DROP COLUMN IF EXISTS distance_calculated_at,
      DROP COLUMN IF EXISTS distance_cache_id,
      DROP COLUMN IF EXISTS distance_metadata;
    `);

    // Enum 타입 삭제
    await db.execute(sql`DROP TYPE IF EXISTS route_priority CASCADE;`);
    await db.execute(sql`DROP TYPE IF EXISTS calculation_method CASCADE;`);
    await db.execute(sql`DROP TYPE IF EXISTS kakao_api_type CASCADE;`);

    console.log('✅ 거리 시스템 마이그레이션 롤백 완료!');

  } catch (error) {
    console.error('❌ 마이그레이션 롤백 실패:', error);
    throw error;
  } finally {
    await sql_client.end();
  }
}

// 실행
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'rollback') {
    rollbackDistanceSystemMigration()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    runDistanceSystemMigration()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}

export { runDistanceSystemMigration, rollbackDistanceSystemMigration }; 