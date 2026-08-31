import React from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Award,
  Calendar,
  Building,
  QrCode,
} from 'lucide-react'
import { verifyCuvCode } from '@/lib/firebase-service'
import { PrintCertificateButton } from '@/components/pram/print-certificate'

export const dynamic = 'force-dynamic'

export default async function VerifyCUVPage({
  params,
}: {
  params: Promise<{ cuv: string }>
}) {
  const { cuv } = await params
  const decodedCUV = decodeURIComponent(cuv)

  let certificado = null
  let dbError = false

  try {
    certificado = await verifyCuvCode(decodedCUV)
  } catch {
    dbError = true
  }

  const isValid = certificado !== null && certificado.estado === 'valid'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between print:bg-white print:min-h-0">
      {/* Header (Oculto en Impresión) */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-8 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Volver al Portal"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
              PRAM OS · VALIDADOR PÚBLICO CUV (DISTRITO 10-04)
            </span>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
              Verificación Oficial de Certificado
            </h1>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
        >
          Ir al Inicio
        </Link>
      </header>

      <main className="mx-auto max-w-3xl w-full px-4 py-8 sm:py-12 space-y-6 print:max-w-none print:p-0 print:m-0">
        {dbError ? (
          /* Error de conexión */
          <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-center space-y-4 max-w-lg mx-auto print:hidden">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mx-auto border border-slate-200">
              <Lock className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Acceso a auditoría CUV restringido
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                Inicia sesión como Mentor o Director para validar este certificado.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <Link
                href="/sign-in"
                className="inline-flex bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2 text-xs font-medium shadow-sm transition-all"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/"
                className="inline-flex bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg px-4 py-2 text-xs font-medium transition-all"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        ) : certificado && certificado.estado === 'valid' ? (
          <div className="space-y-6 print:space-y-0">
            {/* Banner de Verificación Exitosa (Oculto en Impresión) */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-semibold text-emerald-900">
                    Certificado Auténtico, Válido e Inmutable
                  </h2>
                  <p className="text-[11px] text-emerald-700 font-normal">
                    Este documento ha sido verificado contra el registro oficial de CUVs en Firestore (MINERD).
                  </p>
                </div>
              </div>

              <div>
                <PrintCertificateButton />
              </div>
            </div>

            {/* Tarjeta Oficial Tipo Diploma Editorial (Print-Ready) */}
            <div className="p-6 sm:p-10 bg-white rounded-xl border border-slate-300 shadow-sm relative overflow-hidden print:border-none print:shadow-none print:p-4 print:w-full">
              {/* Marca de Agua Geométrica Institucional de Fondo */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center"
                aria-hidden="true"
              >
                <svg className="size-96 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.89v4.93c0 4.61-3.12 8.92-7 10-3.88-1.08-7-5.39-7-10V8.07l7-3.89z" />
                </svg>
              </div>

              {/* Marco Interno de Precisión Institucional */}
              <div className="border-2 border-slate-200 print:border-slate-800 p-6 sm:p-10 rounded-lg space-y-6 text-center bg-white relative z-10">
                {/* 1. Encabezado e Insignia Institucional */}
                <div className="space-y-3">
                  {/* Escudo / Insignia Oficial */}
                  <div className="flex justify-center">
                    <div className="flex size-14 items-center justify-center rounded-xl bg-slate-900 p-2.5 shadow-sm text-white">
                      <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                  </div>

                  {/* Textos de Cabecera Oficial */}
                  <div className="space-y-1">
                    <p className="text-[10px] tracking-widest font-semibold text-slate-500 uppercase">
                      REPÚBLICA DOMINICANA — MINISTERIO DE EDUCACIÓN (MINERD)
                    </p>
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      PROGRAMA DE REFUERZO ACADÉMICO MINERVA MIRABAL (PRAM)
                    </p>
                    <p className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                      LICEO MINERVA MIRABAL · DISTRITO EDUCATIVO 10-04
                    </p>
                  </div>

                  <div className="pt-2">
                    <h2 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 uppercase">
                      Certificado de Acreditación de Servicio Social & Tutoría
                    </h2>
                  </div>
                </div>

                {/* 2. Cuerpo del Certificado */}
                <div className="space-y-3 py-4 border-y border-slate-200">
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    Se otorga el presente documento a:
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
                    {certificado.mentor_nombre}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-xl mx-auto leading-relaxed">
                    Por haber completado y validado satisfactoriamente un total acumulado de{' '}
                    <strong className="text-slate-900 font-bold">
                      {certificado.horas_certificadas} horas pedagógicas
                    </strong>{' '}
                    en sesiones presenciales de tutoría y nivelación escolar para estudiantes del{' '}
                    <span className="text-slate-900 font-medium">{certificado.liceo}</span>, conforme a los lineamientos institucionales del Ministerio de Educación de la República Dominicana.
                  </p>
                </div>

                {/* 3. Metadatos y Código CUV Inmutable */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs pt-1">
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      CÓDIGO ÚNICO (CUV)
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-xs break-all">
                      {certificado.cuv_codigo}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      FECHA DE EMISIÓN
                    </span>
                    <span className="font-medium text-slate-900 text-xs">
                      {certificado.fecha_emision}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      JURISDICCIÓN ACADÉMICA
                    </span>
                    <span className="font-medium text-slate-900 text-xs leading-tight block">
                      Distrito Educativo 10-04 / MINERD
                    </span>
                  </div>
                </div>

                {/* 4. Firmas Institucionales Oficiales */}
                <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                  <div className="border-t border-slate-400 pt-2 space-y-0.5">
                    <p className="font-bold text-slate-900 text-xs">
                      Dirección del Liceo Minerva Mirabal
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Supervisión Académica & Servicio Social
                    </p>
                  </div>
                  <div className="border-t border-slate-400 pt-2 space-y-0.5">
                    <p className="font-bold text-slate-900 text-xs">
                      Distrito Educativo 10-04
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Acreditación Institucional MINERD
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Estado de CUV no encontrado */
          <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-center space-y-4 max-w-lg mx-auto print:hidden">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mx-auto border border-amber-200">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Código CUV no Encontrado
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                No se encontró ningún certificado registrado bajo el identificador:{' '}
                <span className="font-mono font-bold text-slate-800">{decodedCUV}</span>.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Verifica que el código haya sido escrito exactamente como figura en el documento físico o enlace oficial.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-4 py-2 text-xs font-medium shadow-sm transition-all"
              >
                Volver al Validador
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer Institucional (Oculto en Impresión) */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 print:hidden">
        <p className="font-medium text-slate-700">
          Validación Oficial de Certificados CUV · PRAM OS · Liceo Minerva Mirabal (Distrito 10-04)
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Ministerio de Educación de la República Dominicana (MINERD)
        </p>
      </footer>
    </div>
  )
}

