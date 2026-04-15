/** Nút báo cáo — dùng chung cho các mode không phải Gmail. */
export function QuarantineStamp({ disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'relative w-full rounded-2xl border-2 border-red-500/85 bg-red-950/55 px-4 py-3 text-sm font-black uppercase tracking-wide text-red-100',
        'transition hover:bg-red-900/75 hover:shadow-[0_0_28px_rgba(239,68,68,0.28)]',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/70 disabled:text-slate-500',
      ].join(' ')}
    >
      Quarantine / Báo cáo lừa đảo
    </button>
  )
}
