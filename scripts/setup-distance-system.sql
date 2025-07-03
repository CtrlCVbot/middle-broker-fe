-- 거리 시스템 설정 SQL 스크립트
-- 실행 전에 백업을 권장합니다

-- 1. Enum 타입 생성 (존재하지 않는 경우에만)
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

-- 2. distance_cache 테이블 생성
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

-- 3. kakao_api_usage 테이블 생성
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

-- 4. orders 테이블에 필드 추가 (존재하지 않는 경우에만)
DO $$ BEGIN
    -- actual_distance_km
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'actual_distance_km'
    ) THEN
        ALTER TABLE orders ADD COLUMN actual_distance_km DECIMAL(10,2);
    END IF;
    
    -- actual_duration_minutes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'actual_duration_minutes'
    ) THEN
        ALTER TABLE orders ADD COLUMN actual_duration_minutes INTEGER;
    END IF;
    
    -- distance_calculation_method
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'distance_calculation_method'
    ) THEN
        ALTER TABLE orders ADD COLUMN distance_calculation_method calculation_method DEFAULT 'api';
    END IF;
    
    -- distance_calculated_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'distance_calculated_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN distance_calculated_at TIMESTAMP;
    END IF;
    
    -- distance_cache_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'distance_cache_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN distance_cache_id UUID;
    END IF;
    
    -- distance_metadata
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'distance_metadata'
    ) THEN
        ALTER TABLE orders ADD COLUMN distance_metadata JSONB;
    END IF;
END $$;

-- 5. 인덱스 생성 (존재하지 않는 경우에만)
DO $$ BEGIN
    -- distance_cache 인덱스들
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_distance_cache_address_pair') THEN
        CREATE INDEX idx_distance_cache_address_pair 
        ON distance_cache (pickup_address_id, delivery_address_id, route_priority);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_distance_cache_latest') THEN
        CREATE INDEX idx_distance_cache_latest 
        ON distance_cache (pickup_address_id, delivery_address_id, created_at DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_distance_cache_valid') THEN
        CREATE INDEX idx_distance_cache_valid 
        ON distance_cache (is_valid, created_at DESC) WHERE is_valid = true;
    END IF;
    
    -- 좌표 기반 조회 인덱스 (원래 스키마 구조 유지)
    -- 주의: JSON 필드에 대한 복합 인덱스는 PostgreSQL에서 제한이 있을 수 있습니다
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_distance_cache_coordinates') THEN
        -- JSON 필드 인덱스는 필요시 별도로 생성하거나 GIN 인덱스 사용 고려
        -- CREATE INDEX idx_distance_cache_coordinates ON distance_cache (pickup_coordinates, delivery_coordinates);
        RAISE NOTICE 'JSON 좌표 인덱스는 수동으로 생성이 필요할 수 있습니다.';
    END IF;
    
    -- kakao_api_usage 인덱스들
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kakao_api_usage_type_date') THEN
        CREATE INDEX idx_kakao_api_usage_type_date 
        ON kakao_api_usage (api_type, created_at DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kakao_api_usage_user_date') THEN
        CREATE INDEX idx_kakao_api_usage_user_date 
        ON kakao_api_usage (user_id, created_at DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kakao_api_usage_success_date') THEN
        CREATE INDEX idx_kakao_api_usage_success_date 
        ON kakao_api_usage (success, created_at DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kakao_api_usage_performance') THEN
        CREATE INDEX idx_kakao_api_usage_performance 
        ON kakao_api_usage (response_time_ms, created_at DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kakao_api_usage_daily_stats') THEN
        CREATE INDEX idx_kakao_api_usage_daily_stats 
        ON kakao_api_usage (DATE(created_at), api_type, success);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kakao_api_usage_errors') THEN
        CREATE INDEX idx_kakao_api_usage_errors 
        ON kakao_api_usage (response_status, created_at DESC) WHERE success = false;
    END IF;
    
    -- orders 테이블 추가 인덱스
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_distance_method') THEN
        CREATE INDEX idx_orders_distance_method 
        ON orders (distance_calculation_method, created_at DESC) 
        WHERE distance_calculation_method IS NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_actual_distance') THEN
        CREATE INDEX idx_orders_actual_distance 
        ON orders (actual_distance_km, created_at DESC) 
        WHERE actual_distance_km IS NOT NULL;
    END IF;
END $$;

-- 6. 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION update_distance_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_distance_cache_updated_at ON distance_cache;
CREATE TRIGGER update_distance_cache_updated_at
    BEFORE UPDATE ON distance_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_distance_cache_updated_at();

-- 완료 메시지
SELECT '✅ 거리 시스템 설정 완료!' as status; 