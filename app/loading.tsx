export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[#152642] p-3 shadow-lg animate-pulse">
          <img
            src="/pram-logo.svg"
            alt="PRAM"
            className="size-full object-contain invert brightness-0 contrast-200"
          />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Cargando...
        </span>
      </div>
    </div>
  )
}
