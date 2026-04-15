import { Bell, Smartphone } from 'lucide-react'

export default function PhoneOtpWidget({ visible, code }) {
  if (!visible) return null
  return (
    <div className="pointer-events-none absolute bottom-16 right-6 z-[25] w-64 rounded-2xl border border-sky-400/40 bg-slate-900/95 p-3 text-sky-100 shadow-[0_0_30px_rgba(14,165,233,0.25)]">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-sky-300">
        <Smartphone className="h-4 w-4" />
        OTP Preview
      </div>
      <p className="text-xs text-slate-300">Thiết bị nhận mã vừa có thông báo mới.</p>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-950/30 px-3 py-2">
        <Bell className="h-4 w-4 text-sky-300" />
        <span className="font-mono text-lg tracking-[0.2em] text-sky-100">{code || '------'}</span>
      </div>
    </div>
  )
}

