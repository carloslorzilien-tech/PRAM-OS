# PRAM OS (Programa de Refuerzo Académico Minerva Mirabal)

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MINERD-slate?style=flat-square)](https://www.ministeriodeeducacion.gob.do/)

**PRAM OS** es el sistema operativo educativo e institucional para la gestión pedagógica, validación ministerial de tutorías y acreditación de servicio social estudiantil (60 horas) para estudiantes de 3ro y 4to de bachillerato, diseñado bajo lineamientos del **Ministerio de Educación de la República Dominicana (MINERD)** para el **Liceo Minerva Mirabal (Distrito 10-04)**.

---

## 🏛️ Filosofía Visual y Estándar de Diseño (@rules)

Inspirado en la claridad tipográfica de **Claude** y la funcionalidad académica de **Khan Academy**:
- **Paleta de Superficies:** Fondo `bg-slate-50` (#F8FAFC), contenedores y tarjetas en blanco puro `bg-white border border-slate-200 shadow-sm rounded-xl`.
- **Acento Institucional:** Deep Navy / Slate (`bg-slate-900` / `#0F172A`).
- **Acento de Verificación:** Verde Esmeralda Académico (`bg-emerald-50 text-emerald-700 border-emerald-200`).
- **Estados de Auditoría:** `Pendiente de Auditoría` (`bg-amber-50 text-amber-700 border-amber-200`) y `Aprobado / Inmutable` (`bg-emerald-50 text-emerald-700 border-emerald-200`).
- **Contadores de Alto Impacto:** Métricas numéricas en formato grande (`text-4xl` a `text-5xl font-bold tracking-tight text-slate-900`) con efecto animado *count-up* en 1.2 segundos.
- **Cero Bloat y Cero Emojis:** 100% vectorizado con íconos de precisión de `lucide-react` (14px–16px) e isotipo oficial **"M"** de PRAM.

---

## 🚀 Arquitectura de Rutas y Funcionalidades

### 1. Portal Público de Impacto (`/`)
- **Grid de 4 KPIs Gigantes Animados:** Horas Certificadas Totales, Estudiantes Atendidos, Sesiones Validadas y Tasa de Asistencia (%).
- **Módulo de Verificación CUV:** Búsqueda y redirección directa hacia expedientes inmutables.
- **Cuadro de Honor de Mentores:** Top 10 tutores clasificados por horas aportadas con barras de progreso hacia las 60 horas.
- **Manejo Día-0 (Cold Start):** Insignias informativas de estado cuando las métricas están en conteo inicial.

### 2. Panel del Tutor / Mentor (`/dashboard/mentor`)
- **Seguimiento a las 60 Horas:** Barra de progreso visual hacia la meta del Servicio Social Estudiantil MINERD.
- **Formulario de Registro Rápido (< 30s):** Formulario optimizado de 4 campos clave (Materia, Duración, Tema, Alumnos, Fecha) con inserción server-side en Neon PostgreSQL.
- **Historial de Sesiones:** Listado en tiempo real con estados de validación (`Pendiente` / `Aprobado`).

### 3. Panel de Dirección y Auditoría (`/dashboard/director`)
- **Bandeja de Entrada Ministerial:** Tabla con sesiones pendientes de firma de la Dra. Carmen Batlle.
- **Botón `[ Aprobar y Bloquear ]`:** Acción atómica que actualiza la sesión a `approved` e incrementa inmediatamente las horas acumuladas del mentor.
- **Botón `[ Imprimir Expediente Institucional ]`:** Generación de reporte formal con estilos `@media print` nativos del navegador.

### 4. Biblioteca de Materiales y Recursos (`/recursos`)
- **Plantilla Oficial de Asistencia (F-PRAM-01):** Formato físico institucional imprimible con tabla para 10 estudiantes y casillas de firma de supervisión.
- **Enlaces Curriculares:** Conexión directa a Khan Academy, mallas curriculares del MINERD y Olimpíadas Académicas.

### 5. Validador de Certificados CUV (`/verify/[cuv]`)
- **Diploma Oficial Verificado:** Consulta en Neon PostgreSQL por código CUV (ej: `PRAM-2026-M01-8841`).
- Muestra el nombre del mentor, total de horas, liceo, fecha de emisión y sello ministerial.
- Botón directo para **Imprimir / Guardar como PDF** (`@media print`).

### 6. Simulador Demo de Roles (`/demo`)
- Selector de pestañas interactivas para alternar en vivo entre la **Vista Pública**, la **Vista del Tutor** y la **Vista de Dirección** sin necesidad de iniciar sesión.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Renderizado híbrido SSR/RSC y Server Actions |
| **Base de Datos** | Neon PostgreSQL Serverless | Base de datos relacional en la nube |
| **Autenticación** | Clerk (`@clerk/nextjs`) | Gestión segura de identidad con fallback autónomo |
| **Estilos** | Tailwind CSS v4 + Vanilla CSS | Sistema de diseño institucional basado en tokens |
| **PWA** | Serwist (`@serwist/next`) | Service Worker y funcionamiento offline |
| **Tipografía** | Plus Jakarta Sans & JetBrains Mono | Legibilidad académica y cifras tabulares |
| **Íconos** | Lucide React | Iconografía vectorial uniforme de 14px-16px |

---

## 🗄️ Esquema de Base de Datos (`schema.sql`)

```sql
-- Mentores y Servicio Social
CREATE TABLE mentores (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rango TEXT NOT NULL DEFAULT 'Junior' CHECK (rango IN ('Junior', 'Senior', 'Head')),
    horas_acumuladas NUMERIC(6, 2) DEFAULT 0.00,
    meta_horas NUMERIC(6, 2) DEFAULT 60.00,
    especialidad TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sesiones Pedagógicas y Auditoría
CREATE TABLE sesiones (
    id TEXT PRIMARY KEY,
    mentor_id TEXT NOT NULL REFERENCES mentores(id) ON DELETE CASCADE,
    materia TEXT NOT NULL,
    tema TEXT NOT NULL,
    duracion_minutos INT NOT NULL DEFAULT 45,
    cantidad_alumnos INT NOT NULL DEFAULT 1,
    fecha_sesion DATE NOT NULL DEFAULT CURRENT_DATE,
    estado TEXT NOT NULL DEFAULT 'pending' CHECK (estado IN ('pending', 'approved', 'rejected')),
    aprobado_por TEXT,
    fecha_aprobacion TIMESTAMPTZ,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificados Inmutables CUV
CREATE TABLE certificados_cuv (
    id TEXT PRIMARY KEY,
    cuv_codigo TEXT UNIQUE NOT NULL,
    mentor_id TEXT NOT NULL REFERENCES mentores(id) ON DELETE CASCADE,
    mentor_nombre TEXT NOT NULL,
    horas_certificadas NUMERIC(6, 2) NOT NULL,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    entidad_emisora TEXT NOT NULL,
    liceo TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'valid' CHECK (estado IN ('valid', 'revoked'))
);
```

---

## 📦 Instalación y Puesta en Marcha Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/carloslorzilien-tech/PRAM-OS.git
cd PRAM-OS
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` basado en `.env.example`:
```env
# Neon PostgreSQL
DATABASE_URL="postgresql://usuario:password@host/neondb?sslmode=require&channel_binding=require"
POSTGRES_URL="postgresql://usuario:password@host/neondb?sslmode=require&channel_binding=require"

# Clerk Auth (Opcional - La app funciona en Modo Autónomo si faltan)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

### 4. Migración de Base de Datos
```bash
node scripts/migrate-neon.mjs
```

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔒 Seguridad y Protección (.gitignore)

El proyecto cuenta con un blindaje estricto en `.gitignore` para garantizar que **ningún secreto o contraseña** de Neon o Clerk sea enviado al repositorio público de GitHub.

---

## 📄 Créditos y Licencia

Desarrollado para el **Programa de Refuerzo Académico Minerva Mirabal (PRAM)**.
República Dominicana · 2026.
