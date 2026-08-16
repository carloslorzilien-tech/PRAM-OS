-- ==============================================================================
-- PRAM OS — Migration Script v4.1
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ==============================================================================

-- ============================================================
-- 1. HASH DE PINes EXISTENTES (Solo correr una vez)
-- ============================================================
-- Verificar extensión pgcrypto activa
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hashear todos los PINes en texto plano que aún no estén hasheados
-- (bcrypt hash tiene prefijo $2b$ o $2a$ — safe to run multiple times)
UPDATE estudiantes
SET pin = crypt(pin, gen_salt('bf', 10))
WHERE pin NOT LIKE '$2%';

-- Función server-side para verificar PIN (evita exponer el hash al frontend)
CREATE OR REPLACE FUNCTION public.verificar_pin(p_estudiante_id UUID, p_pin TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM estudiantes
        WHERE id = p_estudiante_id
        AND pin = crypt(p_pin, pin)
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- 2. COLUMNA DE FECHA REAL EN SESIONES (TIMESTAMPTZ)
-- ============================================================
-- Añadir columna de fecha verdadera si no existe
ALTER TABLE sesiones 
ADD COLUMN IF NOT EXISTS fecha_real TIMESTAMPTZ;

-- Backfill: para sesiones existentes, usar created_at como fecha real
UPDATE sesiones 
SET fecha_real = created_at
WHERE fecha_real IS NULL;

-- Índice para queries por rango de fecha
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha_real ON sesiones(fecha_real);

-- ============================================================
-- 3. PERMISOS: Verificar que profiles esté habilitado para RLS
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. LOG DE VERIFICACIÓN
-- ============================================================
-- Consultar para confirmar que los PINes están hasheados:
-- SELECT id, nombre, LEFT(pin, 7) as pin_prefix FROM estudiantes;
-- (Debe mostrar '$2b$10$' como prefijo)

-- Consultar para confirmar fecha_real:
-- SELECT id, tema, fecha_real FROM sesiones LIMIT 5;
