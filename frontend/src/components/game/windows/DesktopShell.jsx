import { HardDrive, Mail, Menu, Monitor, Network, Trash2 } from 'lucide-react'

function Taskbar({ onReportPhishing }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 h-12 border-t border-slate-700/60 bg-slate-900/85 px-3 backdrop-blur-md">
      <div className="flex h-full items-center gap-2 text-slate-300">
        <button type="button" className="rounded-md bg-slate-800/80 p-1.5 hover:bg-slate-700/90">
          <Menu className="h-4 w-4" />
        </button>
        <Monitor className="h-4 w-4 text-cyan-300" />
        <Mail className="h-4 w-4 text-cyan-200" />
        <Network className="h-4 w-4 text-sky-300" />
        <div className="ml-auto flex items-center gap-3">
          <div className="text-[11px] font-mono text-slate-300">SECURE DESKTOP MODE</div>
          <button
            type="button"
            onClick={onReportPhishing}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500 animate-pulse"
          >
            BÁO CÁO PHISHING
          </button>
        </div>
      </div>
    </div>
  )
}

export function DesktopEnvironment({ children, onReportPhishing }) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_10%,#1e3a8a_0%,#0b1220_35%,#050b14_70%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4px_4px]" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(2,6,23,0)_0px,rgba(2,6,23,0)_2px,rgba(7,15,30,0.35)_3px)] opacity-35" />
      <div className="absolute left-4 top-5 z-[2] space-y-4 text-xs text-slate-200/90">
        <div className="flex w-20 flex-col items-center gap-1 rounded-lg bg-slate-900/20 p-2 text-center">
          <HardDrive className="h-6 w-6 text-cyan-200" />
          <span>My Computer</span>
        </div>
        <div className="flex w-20 flex-col items-center gap-1 rounded-lg bg-slate-900/20 p-2 text-center">
          <Trash2 className="h-6 w-6 text-slate-200" />
          <span>Recycle Bin</span>
        </div>
        <div className="flex w-20 flex-col items-center gap-1 rounded-lg bg-slate-900/20 p-2 text-center">
          <Network className="h-6 w-6 text-violet-200" />
          <span>CyberShield Network</span>
        </div>
      </div>
      {children}
      <Taskbar onReportPhishing={onReportPhishing} />
    </div>
  )
}

export function AppWindow({ children, title, className = '', onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className={[
        'relative bg-slate-900 border border-slate-700 shadow-2xl rounded-lg overflow-hidden flex flex-col cursor-grab active:cursor-grabbing',
        className,
      ].join(' ')}
    >
      <div className="h-10 bg-slate-800 flex items-center px-4 window-header border-b border-slate-700">
        <div className="mr-3 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </div>
        <p className="truncate text-xs font-medium text-slate-200">
          {title || 'Inbox - hr.department@company.com - Google Chrome'}
        </p>
      </div>
      {children}
    </div>
  )
}
