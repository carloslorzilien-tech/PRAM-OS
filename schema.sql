-- ==============================================================================
-- PRAM OS V1 — NEON POSTGRESQL SCHEMA & SEED DATA
-- Programa de Refuerzo Académico Minerva Mirabal (MINERD)
-- ==============================================================================

-- 1. TABLA: MENTORES
CREATE TABLE IF NOT EXISTS mentores (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rango TEXT NOT NULL DEFAULT 'Junior' CHECK (rango IN ('Junior', 'Senior', 'Head')),
    horas_acumuladas NUMERIC(6, 2) DEFAULT 0.00,
    meta_horas NUMERIC(6, 2) DEFAULT 60.00,
    especialidad TEXT NOT NULL,
    telefono TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: ESTUDIANTES
CREATE TABLE IF NOT EXISTS estudiantes (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    grado TEXT NOT NULL CHECK (grado IN ('3ro', '4to')),
    seccion TEXT NOT NULL,
    tutor_id TEXT REFERENCES mentores(id) ON DELETE SET NULL,
    racha_asistencia INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: SESIONES (Auditoría MINERD & Servicio Social)
CREATE TABLE IF NOT EXISTS sesiones (
    id TEXT PRIMARY KEY,
    mentor_id TEXT NOT NULL REFERENCES mentores(id) ON DELETE CASCADE,
    materia TEXT NOT NULL CHECK (materia IN ('Matemáticas', 'Lengua Española', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés', 'Informática')),
    tema TEXT NOT NULL,
    duracion_minutos INT NOT NULL DEFAULT 45 CHECK (duracion_minutos IN (30, 45, 60, 90, 120)),
    cantidad_alumnos INT NOT NULL DEFAULT 1 CHECK (cantidad_alumnos >= 1),
    fecha_sesion DATE NOT NULL DEFAULT CURRENT_DATE,
    estado TEXT NOT NULL DEFAULT 'pending' CHECK (estado IN ('pending', 'approved', 'rejected')),
    aprobado_por TEXT,
    fecha_aprobacion TIMESTAMPTZ,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: CERTIFICADOS CUV (Código Único de Verificación)
CREATE TABLE IF NOT EXISTS certificados_cuv (
    id TEXT PRIMARY KEY,
    cuv_codigo TEXT UNIQUE NOT NULL,
    mentor_id TEXT NOT NULL REFERENCES mentores(id) ON DELETE CASCADE,
    mentor_nombre TEXT NOT NULL,
    horas_certificadas NUMERIC(6, 2) NOT NULL,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    entidad_emisora TEXT NOT NULL DEFAULT 'Distrito Educativo 10-04 / MINERD',
    liceo TEXT NOT NULL DEFAULT 'Liceo Minerva Mirabal',
    estado TEXT NOT NULL DEFAULT 'valid' CHECK (estado IN ('valid', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. SCRIPT DE DATOS SEMILLA (Seed Data Inicial)
-- ==============================================================================

-- Inserción de 3 Mentores de Ejemplo
INSERT INTO mentores (id, nombre, email, rango, horas_acumuladas, meta_horas, especialidad)
VALUES 
    ('m-1', 'Prof. Altagracia Peña', 'altagracia.pena@minerd.edu.do', 'Head', 48.5, 60.0, 'Matemáticas y Razonamiento Lógico'),
    ('m-2', 'Lic. Marcos Santana', 'marcos.santana@minerd.edu.do', 'Senior', 34.0, 60.0, 'Lengua Española y Literatura'),
    ('m-3', 'Ing. Sofía Castillo', 'sofia.castillo@minerd.edu.do', 'Junior', 19.5, 60.0, 'Ciencias Naturales y Física')
ON CONFLICT (id) DO UPDATE 
SET horas_acumuladas = EXCLUDED.horas_acumuladas,
    rango = EXCLUDED.rango;

-- Inserción de 5 Sesiones Aprobadas y 2 Pendientes
INSERT INTO sesiones (id, mentor_id, materia, tema, duracion_minutos, cantidad_alumnos, fecha_sesion, estado, aprobado_por, fecha_aprobacion, notas)
VALUES
    ('s-101', 'm-1', 'Matemáticas', 'Ecuaciones Lineales y Despeje de Incógnitas', 60, 4, '2026-08-10', 'approved', 'Dra. Carmen Batlle', '2026-08-11 09:30:00Z', 'Excelente participación de los alumnos de 3ro B.'),
    ('s-102', 'm-1', 'Matemáticas', 'Fracciones Complejas y Operaciones Mixtas', 45, 3, '2026-08-12', 'approved', 'Dra. Carmen Batlle', '2026-08-13 10:15:00Z', 'Refuerzo de jerarquía de operaciones.'),
    ('s-103', 'm-2', 'Lengua Española', 'Estructura del Ensayo Argumentativo', 60, 5, '2026-08-11', 'approved', 'Dra. Carmen Batlle', '2026-08-12 11:00:00Z', 'Redacción de tesis y conectores de causa.'),
    ('s-104', 'm-2', 'Lengua Española', 'Comprensión Lectora y Figuras Literarias', 45, 4, '2026-08-14', 'approved', 'Dra. Carmen Batlle', '2026-08-15 14:20:00Z', 'Análisis de textos periodísticos dominicanos.'),
    ('s-105', 'm-3', 'Ciencias Naturales', 'Leyes de Mendel y Genética Básica', 90, 6, '2026-08-13', 'approved', 'Dra. Carmen Batlle', '2026-08-14 16:00:00Z', 'Resolución guiada de cuadros de Punnett.'),
    ('s-106', 'm-1', 'Matemáticas', 'Trigonometría: Seno, Coseno y Tangente', 60, 3, '2026-08-16', 'pending', NULL, NULL, 'Pendiente de validación ministerial.'),
    ('s-107', 'm-3', 'Ciencias Naturales', 'Ecosistemas y Conservación de Cuencas', 45, 4, '2026-08-17', 'pending', NULL, NULL, 'Sesión realizada en laboratorio de ciencias.')
ON CONFLICT (id) DO NOTHING;

-- Inserción de Certificados CUV Verificables
INSERT INTO certificados_cuv (id, cuv_codigo, mentor_id, mentor_nombre, horas_certificadas, fecha_emision, entidad_emisora, liceo, estado)
VALUES
    ('cuv-1', 'PRAM-2026-M01-8841', 'm-1', 'Prof. Altagracia Peña', 60.0, '2026-08-15', 'Dirección General de Educación Secundaria · MINERD', 'Liceo Minerva Mirabal', 'valid'),
    ('cuv-2', 'PRAM-2026-M02-9912', 'm-2', 'Lic. Marcos Santana', 45.0, '2026-08-14', 'Dirección General de Educación Secundaria · MINERD', 'Liceo Minerva Mirabal', 'valid')
ON CONFLICT (id) DO NOTHING;
