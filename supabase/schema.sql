-- ==============================================================================
-- PRAM OS v4.0 — SECURE PRODUCTION SCHEMA
-- Programa de Refuerzo Académico Minerva Mirabal (MINERD)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. TABLA: SUPERVISORES / DIRECTORES DE ÁREA
-- ============================================================
CREATE TABLE IF NOT EXISTS supervisores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    area TEXT NOT NULL CHECK (area IN ('Matemáticas', 'Lengua Española', 'General')),
    codigo_acceso TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. TABLA: MENTORES
-- ============================================================
CREATE TABLE IF NOT EXISTS mentores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    rango TEXT NOT NULL CHECK (rango IN ('Junior', 'Senior', 'Head')),
    horas_acumuladas NUMERIC(6, 2) DEFAULT 0.00,
    especialidad TEXT,
    supervisor_id UUID REFERENCES supervisores(id) ON DELETE SET NULL,
    puntos_ranking INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TABLA: ESTUDIANTES
-- ============================================================
CREATE TABLE IF NOT EXISTS estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    pin TEXT NOT NULL, -- Hashed with pgcrypto
    grado TEXT NOT NULL CHECK (grado IN ('3ro', '4to')),
    liceo_seccion TEXT NOT NULL,
    nivel_actual INT NOT NULL CHECK (nivel_actual BETWEEN 1 AND 5),
    mentor_id UUID REFERENCES mentores(id) ON DELETE SET NULL,
    nivel_pretest INT CHECK (nivel_pretest BETWEEN 1 AND 5),
    nivel_posttest INT CHECK (nivel_posttest BETWEEN 1 AND 5),
    puntos_ranking INT DEFAULT 0,
    racha_asistencia INT DEFAULT 0,
    graduado_pram BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TABLA: SESIONES (Validación Dual & Auditoría MINERD)
-- ============================================================
CREATE TABLE IF NOT EXISTS sesiones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES mentores(id) ON DELETE CASCADE,
    tema TEXT NOT NULL,
    materia TEXT NOT NULL,
    fecha_programada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_display TEXT, -- Human-readable fallback
    duracion_minutos INT NOT NULL DEFAULT 45,
    estado TEXT NOT NULL DEFAULT 'Programada' CHECK (estado IN ('Programada', 'Completada', 'Ausente_Injustificado', 'Ausente_Justificado')),
    confirmacion_mentor BOOLEAN DEFAULT FALSE,
    confirmacion_estudiante BOOLEAN DEFAULT FALSE,
    validado_por_auditoria BOOLEAN DEFAULT FALSE,
    estado_auditoria TEXT DEFAULT 'Pendiente' CHECK (estado_auditoria IN ('Pendiente', 'Aprobado_MINERD', 'Rechazado')),
    supervisor_id UUID REFERENCES supervisores(id),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. TABLA: SOLICITUDES DE REFUERZO
-- ============================================================
CREATE TABLE IF NOT EXISTS solicitudes_refuerzo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    tema TEXT NOT NULL,
    materia TEXT NOT NULL,
    fecha_solicitud TIMESTAMPTZ DEFAULT NOW(),
    estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Asignada')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. TABLA: EXÁMENES DIAGNÓSTICOS (Phygital A/B/C)
-- ============================================================
CREATE TABLE IF NOT EXISTS examenes_diagnostico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('Pre-Test', 'Checkpoint', 'Post-Test')),
    variante TEXT NOT NULL CHECK (variante IN ('A', 'B', 'C')),
    fecha TIMESTAMPTZ DEFAULT NOW(),
    resultado_nivel INT NOT NULL CHECK (resultado_nivel BETWEEN 1 AND 5),
    ai_analysis_summary TEXT,
    foto_url TEXT,
    respuestas_detectadas JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TABLA: PROFILES (Auth → Rol PRAM)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nombre TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'guest'
        CHECK (role IN ('guest', 'estudiante', 'mentor_junior', 'head_mentor', 'director')),
    estudiante_id UUID REFERENCES estudiantes(id) ON DELETE SET NULL,
    mentor_id UUID REFERENCES mentores(id) ON DELETE SET NULL,
    supervisor_id UUID REFERENCES supervisores(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. TABLA: ACTIVIDAD LOG (Auditoría de Acciones)
-- ============================================================
CREATE TABLE IF NOT EXISTS actividad_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    accion TEXT NOT NULL,
    tabla_afectada TEXT,
    registro_id TEXT,
    detalles JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_estudiantes_mentor ON estudiantes(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_estudiante ON sesiones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_mentor ON sesiones(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_auditoria ON sesiones(estado_auditoria);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON sesiones(fecha_programada);
CREATE INDEX IF NOT EXISTS idx_examenes_estudiante ON examenes_diagnostico(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_actividad_log_actor ON actividad_log(actor_id);

-- ============================================================
-- 10. ROW LEVEL SECURITY — POLÍTICAS ESTRICTAS
-- ============================================================
ALTER TABLE supervisores ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentores ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_refuerzo ENABLE ROW LEVEL SECURITY;
ALTER TABLE examenes_diagnostico ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_log ENABLE ROW LEVEL SECURITY;

-- Helper: obtener rol del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT COALESCE(
        (SELECT role FROM profiles WHERE id = auth.uid()),
        'guest'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: obtener mentor_id del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_user_mentor_id()
RETURNS UUID AS $$
    SELECT mentor_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: obtener estudiante_id del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_user_estudiante_id()
RETURNS UUID AS $$
    SELECT estudiante_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- SUPERVISORES: todos leen, solo directores modifican
CREATE POLICY "supervisores_read" ON supervisores FOR SELECT USING (true);
CREATE POLICY "supervisores_write" ON supervisores FOR ALL
    USING (get_user_role() = 'director')
    WITH CHECK (get_user_role() = 'director');

-- MENTORES: todos leen, directores y head_mentors modifican
CREATE POLICY "mentores_read" ON mentores FOR SELECT USING (true);
CREATE POLICY "mentores_write" ON mentores FOR INSERT
    WITH CHECK (get_user_role() IN ('director', 'head_mentor'));
CREATE POLICY "mentores_update" ON mentores FOR UPDATE
    USING (get_user_role() IN ('director', 'head_mentor'));

-- ESTUDIANTES
CREATE POLICY "estudiantes_read" ON estudiantes FOR SELECT USING (
    get_user_role() IN ('director', 'head_mentor', 'guest')
    OR (get_user_role() = 'mentor_junior' AND mentor_id = get_user_mentor_id())
    OR (get_user_role() = 'estudiante' AND id = get_user_estudiante_id())
);
CREATE POLICY "estudiantes_insert" ON estudiantes FOR INSERT
    WITH CHECK (get_user_role() IN ('director', 'head_mentor'));
CREATE POLICY "estudiantes_update" ON estudiantes FOR UPDATE
    USING (
        get_user_role() = 'director'
        OR (get_user_role() IN ('mentor_junior', 'head_mentor') AND mentor_id = get_user_mentor_id())
    );
CREATE POLICY "estudiantes_delete" ON estudiantes FOR DELETE
    USING (get_user_role() = 'director');

-- SESIONES
CREATE POLICY "sesiones_read" ON sesiones FOR SELECT USING (
    get_user_role() IN ('director', 'head_mentor', 'guest')
    OR (get_user_role() = 'mentor_junior' AND mentor_id = get_user_mentor_id())
    OR (get_user_role() = 'estudiante' AND estudiante_id = get_user_estudiante_id())
);
CREATE POLICY "sesiones_insert" ON sesiones FOR INSERT
    WITH CHECK (get_user_role() IN ('director', 'head_mentor', 'mentor_junior'));
CREATE POLICY "sesiones_update" ON sesiones FOR UPDATE
    USING (
        get_user_role() = 'director'
        OR (get_user_role() IN ('mentor_junior', 'head_mentor') AND mentor_id = get_user_mentor_id())
    );

-- SOLICITUDES DE REFUERZO
CREATE POLICY "solicitudes_read" ON solicitudes_refuerzo FOR SELECT USING (true);
CREATE POLICY "solicitudes_write" ON solicitudes_refuerzo FOR INSERT WITH CHECK (
    get_user_role() IN ('estudiante', 'mentor_junior', 'head_mentor', 'director')
);

-- EXÁMENES
CREATE POLICY "examenes_read" ON examenes_diagnostico FOR SELECT USING (
    get_user_role() IN ('director', 'head_mentor')
    OR (get_user_role() = 'mentor_junior' AND estudiante_id IN (
        SELECT id FROM estudiantes WHERE mentor_id = get_user_mentor_id()
    ))
    OR (get_user_role() = 'estudiante' AND estudiante_id = get_user_estudiante_id())
);
CREATE POLICY "examenes_insert" ON examenes_diagnostico FOR INSERT
    WITH CHECK (get_user_role() IN ('director', 'head_mentor', 'mentor_junior'));

-- PROFILES: cada usuario lee su perfil, directores leen todos
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT
    USING (id = auth.uid() OR get_user_role() = 'director');
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
    USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- ACTIVIDAD LOG: directores leen, sistema inserta
CREATE POLICY "log_read" ON actividad_log FOR SELECT
    USING (get_user_role() = 'director');
CREATE POLICY "log_insert" ON actividad_log FOR INSERT
    WITH CHECK (true);

-- ============================================================
-- 11. TRIGGERS: Motor de Rankings Server-Side
-- ============================================================

-- Auto-profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nombre, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'guest'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ranking Estudiante (recalc automático)
CREATE OR REPLACE FUNCTION recalcular_ranking_estudiante()
RETURNS TRIGGER AS $$
BEGIN
    NEW.puntos_ranking := (
        (COALESCE(NEW.nivel_actual, 2) - COALESCE(NEW.nivel_pretest, 2)) * 100
    ) + (
        COALESCE(NEW.racha_asistencia, 0) * 15
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ranking_estudiante ON estudiantes;
CREATE TRIGGER trg_ranking_estudiante
    BEFORE INSERT OR UPDATE OF nivel_actual, nivel_pretest, racha_asistencia
    ON estudiantes
    FOR EACH ROW EXECUTE FUNCTION recalcular_ranking_estudiante();

-- Ranking Mentor (recalc cuando cambian sus alumnos)
CREATE OR REPLACE FUNCTION recalcular_ranking_mentor()
RETURNS TRIGGER AS $$
DECLARE
    v_horas NUMERIC;
    v_delta_promedio NUMERIC;
    v_mentor_id UUID;
BEGIN
    v_mentor_id := NEW.mentor_id;
    SELECT horas_acumuladas INTO v_horas FROM mentores WHERE id = v_mentor_id;
    SELECT COALESCE(AVG(nivel_actual - COALESCE(nivel_pretest, 2)), 1.0)
        INTO v_delta_promedio
        FROM estudiantes WHERE mentor_id = v_mentor_id;
    UPDATE mentores
        SET puntos_ranking = ROUND((v_horas * 10) + (v_delta_promedio * 50))
        WHERE id = v_mentor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ranking_mentor_from_est ON estudiantes;
CREATE TRIGGER trg_ranking_mentor_from_est
    AFTER INSERT OR UPDATE OF nivel_actual, nivel_pretest, mentor_id
    ON estudiantes
    FOR EACH ROW EXECUTE FUNCTION recalcular_ranking_mentor();

CREATE OR REPLACE FUNCTION recalcular_ranking_mentor_self()
RETURNS TRIGGER AS $$
DECLARE
    v_delta_promedio NUMERIC;
BEGIN
    SELECT COALESCE(AVG(nivel_actual - COALESCE(nivel_pretest, 2)), 1.0)
        INTO v_delta_promedio
        FROM estudiantes WHERE mentor_id = NEW.id;
    NEW.puntos_ranking := ROUND((NEW.horas_acumuladas * 10) + (v_delta_promedio * 50));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ranking_mentor_self ON mentores;
CREATE TRIGGER trg_ranking_mentor_self
    BEFORE UPDATE OF horas_acumuladas
    ON mentores
    FOR EACH ROW EXECUTE FUNCTION recalcular_ranking_mentor_self();

-- ============================================================
-- 12. SEED DATA (Datos Iniciales)
-- ============================================================
INSERT INTO supervisores (id, nombre, area, codigo_acceso) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Dra. Carmen Batlle', 'Matemáticas', 'DIR-2026')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mentores (id, nombre, rango, horas_acumuladas, especialidad, supervisor_id, puntos_ranking) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Prof. Altagracia Peña', 'Head', 48.5, 'Álgebra y Razonamiento Lógico', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 585),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Lic. Marcos Santana', 'Senior', 34.0, 'Geometría y Funciones', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 440),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Ing. Sofía Castillo', 'Junior', 19.5, 'Aritmética y Números Reales', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 295)
ON CONFLICT (id) DO NOTHING;

INSERT INTO estudiantes (id, nombre, pin, grado, liceo_seccion, nivel_actual, mentor_id, nivel_pretest, nivel_posttest, puntos_ranking, racha_asistencia) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Carlos Reyes', '1234', '3ro', 'Liceo Minerva Mirabal · 3ro B', 3, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, 4, 160, 4),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Yomaira Gómez', '5678', '4to', 'Liceo Minerva Mirabal · 4to A', 2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 3, 145, 3),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Franklin Tejeda', '9012', '3ro', 'Liceo Minerva Mirabal · 3ro A', 4, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 3, 5, 230, 6)
ON CONFLICT (id) DO NOTHING;
