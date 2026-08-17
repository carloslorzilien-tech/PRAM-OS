import React from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Printer,
  Calendar,
  Building,
  Award,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { getCUVDetails } from '@/lib/db'
import { PrintCertificateButton } from '@/components/pram/print-certificate'

export const dynamic = 'force-dynamic'

export default async function VerifyCUVPage({
  params,
}: {
  params: Promise<{ cuv: string }>
}) {
  const { cuv } = await params
  const decodedCUV = decodeURIComponent(cuv)
  const certificado = await getCUVDetails(decodedCUV)

  const isValid = certificado !== null && certificado.estado === 'valid'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-8 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Volver al Portal"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex size-8 items-center justify-center rounded-lg bg-slate-900 p-1 shadow-sm shrink-0">
            <img
              src="/pram-logo.svg"
              alt="PRAM Logo"
              className="size-full object-contain invert brightness-0 contrast-200"
            />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Validador de Autenticidad MINERD
            </span>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
              Verificación de Certificado CUV
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

      <main className="mx-auto max-w-3xl w-full px-4 py-8 sm:py-12 space-y-6">
        {isValid ? (
          <div className="space-y-6">
            {/* Banner de Verificación Exitosa */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-semibold text-emerald-900">
                    Certificado Auténtico e Inmutable
                  </h2>
                  <p className="text-[11px] text-emerald-700 font-normal">
                    Este documento ha sido validado contra el registro oficial de Neon PostgreSQL.
                  </p>
                </div>
              </div>

              <div className="print:hidden">
                <PrintCertificateButton />
              </div>
            </div>

            {/* Tarjeta Tipo Diploma Oficial (Apta para pantalla e impresión) */}
            <div className="p-8 sm:p-12 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden print:border-none print:shadow-none print:p-0">
              {/* Marca de agua / Borde ornamental sutil */}
              <div className="border-4 border-double border-slate-200 p-6 sm:p-10 rounded-lg space-y-8 text-center bg-radial from-slate-50/50 via-white to-white">
                <div className="space-y-2">
                  <div className="inline-flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white font-mono font-bold text-base mb-2">
                    PRAM
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    República Dominicana · Ministerio de Educación (MINERD)
                  </h2>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Programa de Refuerzo Académico Minerva Mirabal (PRAM OS)
                  </h3>
                </div>

                <div className="space-y-3 py-4 border-y border-slate-100">
                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    Certifica que:
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    {certificado.mentor_nombre}
                  </p>
                  <p className="text-xs text-slate-600 font-normal max-w-lg mx-auto leading-relaxed">
                    Ha cumplido satisfactoriamente con la totalidad de{' '}
                    <strong className="text-slate-900 font-semibold">
                      {certificado.horas_certificadas} horas
                    </strong>{' '}
                    de tutoría pedagógica y refuerzo escolar para estudiantes de educación secundaria en el{' '}
                    <span className="text-slate-900 font-medium">{certificado.liceo}</span>.
                  </p>
                </div>

                {/* Metadatos y Código CUV */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs pt-2">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Código Único (CUV)
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-xs break-all">
                      {certificado.cuv_codigo}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Fecha de Emisión
                    </span>
                    <span className="font-medium text-slate-900">
                      {certificado.fecha_emision}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Entidad Emisora
                    </span>
                    <span className="font-medium text-slate-900 text-[11px] leading-tight block">
                      {certificado.entidad_emisora}
                    </span>
                  </div>
                </div>

                {/* Firmas Institucionales */}
                <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                  <div className="border-t border-slate-300 pt-2">
                    <p className="font-semibold text-slate-900">Dra. Carmen Batlle</p>
                    <p className="text-[10px] text-slate-500">Dirección y Supervisión Académica</p>
                  </div>
                  <div className="border-t border-slate-300 pt-2">
                    <p className="font-semibold text-slate-900">Distrito Educativo 08-03</p>
                    <p className="text-[10px] text-slate-500">Acreditación MINERD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Estado de CUV no encontrado o inválido */
          <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-center space-y-4 max-w-lg mx-auto">
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
              Verifica que el código haya sido escrito exactamente como figura en el documento físico.
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

      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 print:hidden">
        <p className="font-normal">
          Validación Oficial de Certificados PRAM OS · Ministerio de Educación de la República Dominicana
        </p>
      </footer>
    </div>
  )
}
