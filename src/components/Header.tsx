import { Search, Bell } from "lucide-react"

export default function Header() {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between py-5 px-8 bg-white border-b border-slate-100 z-50">
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 shadow-sm">
        <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-xs font-bold tracking-wider text-emerald-600">LONDON SESSION ACTIVE</span>
      </div>
      
      <div className="mt-4 sm:mt-0 flex items-center gap-4 w-full max-w-md">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="size-4 text-slate-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search Journal..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
          />
        </div>
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  )
}
