# PRAM OS · Programa de Refuerzo Académico Minerva Mirabal
> Sistema de gestión pedagógica, validación de Servicio Social Estudiantil (60 Horas MINERD) y certificación inmutable CUV.  
> **Liceo Minerva Mirabal · Distrito Educativo 10-04, Santo Domingo Este, República Dominicana.**

Desarrollado por **Carlos Lorzilien** ([@carloslorzilien-tech](https://github.com/carloslorzilien-tech)).

---

## ¿Por qué creé PRAM OS?

En las escuelas públicas dominicanas, el **Servicio Social Estudiantil (60 Horas obligatorias del MINERD)** y las tutorías de refuerzo entre pares se han llevado históricamente con cuadernos de asistencia o fotocopias sueltas. En la práctica escolar real, eso trae tres problemas graves:

1. **Pérdida de evidencia:** Las hojas se rompen, se extravían y nadie sabe con certeza cuántas horas completó cada alumno tutor.
2. **Falta de rigor pedagógico:** Firmar una hoja no demuestra si el estudiante tutor realmente explicó el tema, ni si el alumno que recibió la ayuda mejoró su rendimiento.
3. **Sobrecarga para la Dirección:** Los coordinadores pedagógicos y directores no tienen tiempo de revisar cientos de firmas a mano al final del año escolar.

**PRAM OS** nació dentro del Liceo Minerva Mirabal para solucionar esto con tecnología real, accesible y adaptada a nuestro contexto escolar.

---

## El Modelo Phygital: La Realidad de la Escuela Pública

PRAM OS no intenta digitalizar a la fuerza lo que no debe ser digitalizado. En una escuela pública no podemos exigirle a los muchachos que hagan pruebas matemáticas en tablets o laptops con internet inestable.

Por eso diseñé un flujo **Phygital (Físico + Digital)** que toma menos de 30 segundos:

```
                                  FLUJO PHYGITAL PRAM OS
  
  [ 1. PAPEL ]                  [ 2. FOTO EN DRIVE ]            [ 3. NUBE & CUV ]
  El estudiante resuelve        El tutor califica en papel,     La nota se asienta en
  la prueba física oficial      toma una foto clara con el      PRAM OS. Dirección audita
  F-PRAM-01 a mano.     ──────► celular y la sube en 5 seg  ──► y emite el Certificado
                                a la carpeta de Google Drive.    CUV inmutable (código QR).
```

- **Soporte Físico:** Las pruebas en papel F-PRAM-01 se guardan en el archivo de evidencias del liceo (folder de palanca con separador por alumno).
- **Audit Trail Digital:** Las fotos en Google Drive permiten que cualquier inspector o evaluador del Distrito 10-04 verifique los exámenes desde cualquier lugar sin tener que abrir el archivador físico.
- **Certificación CUV:** El software emite un código criptográfico único que valida las horas del tutor sin posibilidad de falsificación.

---

## Módulos del Sistema

| Ruta | Descripción |
| :--- | :--- |
| **`/` (Portal Público)** | Métricas de impacto en tiempo real (Horas acumuladas, alumnos atendidos, sesiones y tasa de asistencia) y buscador directo de certificados CUV. |
| **`/dashboard/mentor`** | Panel del tutor con seguimiento de su meta de 60 horas, registro de tutorías en 4 campos ($<30$ segundos) y módulo "Mis Alumnos" para asentar notas de exámenes. |
| **`/dashboard/director`** | Bandeja de auditoría ministerial en tiempo real. La Dirección aprueba sesiones, audita el progreso delta ($\Delta$) de los estudiantes y genera actas institucionales. |
| **`/verify/[cuv]`** | Validador público oficial de certificados CUV. Muestra las firmas de la Dirección y el sello institucional del MINERD, listo para imprimir en PDF (`@media print`). |
| **`/recursos`** | Guía visual de uso en 3 pasos para docentes, formato oficial de evaluación F-PRAM-01 imprimible y enlace directo al repositorio oficial de evidencias en Google Drive. |

---

## Stack Tecnológico

Elegí cada herramienta pensando en velocidad, bajo consumo de datos móviles y estabilidad:

- **Frontend:** [Next.js 16 (App Router)](https://nextjs.org/) con React 19 y TypeScript estricto.
- **Estilos & UI:** [Tailwind CSS v4](https://tailwindcss.com/) siguiendo un sistema de diseño institucional, sobrio y sin distracciones visuales.
- **Base de Datos & Backend:** [Firebase Firestore](https://firebase.google.com/) con listeners en tiempo real (`onSnapshot`) y transacciones atómicas (`writeBatch`).
- **Autenticación:** Firebase Authentication con Google OAuth (acceso en 1 clic y persistencia local de sesión en navegadores móviles).
- **PWA (Progressive Web App):** Empaquetado con [Serwist](https://github.com/serwist/serwist) para instalación como app nativa en Android e iOS.
- **Iconografía:** [Lucide React](https://lucide.dev/).

---

## Seguridad y Reglas de Base de Datos (`firestore.rules`)

La integridad de los datos está blindada mediante políticas de seguridad a nivel de base de datos:

- **Control de Acceso basado en Roles (RBAC):** Solo las cuentas autorizadas por la Dirección pueden registrar tutorías.
- **Privilegios de Dirección:** Únicamente el correo del director (`carlos.lorzilien@gmail.com`) tiene permisos de aprobación y emisión de CUV.
- **Inmutabilidad de Evaluaciones:** La subcolección `/students/{studentId}/evaluaciones` tiene bloqueadas las modificaciones y eliminaciones (`allow update, delete: if false;`). Una vez que un tutor asienta una nota, nadie puede alterarla.
- **Protección de Certificados CUV:** La colección `/cuvs` es de lectura pública (para verificación), pero su creación está restringida a la transacción atómica de aprobación de la Dirección.

---

## Cómo Ejecutar el Proyecto en Local

### Prerrequisitos
- Node.js 20 o superior
- npm o pnpm

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/carloslorzilien-tech/PRAM-OS.git
   cd PRAM-OS
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env.local
   ```
   Rellena `.env.local` con tus credenciales de Firebase:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

5. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## Demarcación y Contexto Institucional

- **Centro Educativo:** Liceo Minerva Mirabal
- **Distrito Educativo:** 10-04
- **Regional:** 10 (Santo Domingo)
- **Marco Normativo:** Programa de Servicio Social Estudiantil (Orden Departamental del MINERD)

---

## Autor

**Carlos Lorzilien**  
Estudiante y Desarrollador Principal de PRAM OS  
Santo Domingo, República Dominicana  
GitHub: [@carloslorzilien-tech](https://github.com/carloslorzilien-tech) · Contacto: `carlos.lorzilien@gmail.com`
