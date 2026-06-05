"use client"
import { Search, Bell } from "lucide-react"
import { useState, useEffect } from "react"

export default function Header() {
  const [sessionInfo, setSessionInfo] = useState({ 
    name: "CHECKING SESSION...", 
    color: "bg-slate-50", 
    text: "text-slate-600", 
    border: "border-slate-100", 
    dot: "bg-slate-400" 
  })

  useEffect(() => {
    const updateSession = () => {
      const now = new Date()
      const hour = now.getHours()
      const minute = now.getMinutes()
      const minOfDay = hour * 60 + minute
      
      let name = "MARKET OPEN (QUIET)"
      let color = "bg-slate-50"
      let text = "text-slate-600"
      let border = "border-slate-100"
      let dot = "bg-slate-400"

      // Forex market closes Friday 22:00 UTC, opens Sunday 22:00 UTC
      const utcDay = now.getUTCDay()
      const utcHour = now.getUTCHours()
      const isWeekend = (utcDay === 6) || (utcDay === 5 && utcHour >= 22) || (utcDay === 0 && utcHour < 22)
      
      if (!isWeekend) {
        if (minOfDay >= 420 && minOfDay < 720) { // 07:00 - 12:00
          name = "ASIA KILLZONE"
          color = "bg-blue-50"
          text = "text-blue-600"
          border = "border-blue-100"
          dot = "bg-blue-500"
        } else if (minOfDay >= 840 && minOfDay < 1020) { // 14:00 - 17:00
          name = "LONDON KILLZONE"
          color = "bg-rose-50"
          text = "text-rose-600"
          border = "border-rose-100"
          dot = "bg-rose-500"
        } else if (minOfDay >= 1170 && minOfDay < 1350) { // 19:30 - 22:30
          name = "NEW YORK AM KILLZONE"
          color = "bg-teal-50"
          text = "text-teal-600"
          border = "border-teal-100"
          dot = "bg-teal-500"
        } else if (minOfDay >= 1380 && minOfDay < 1440) { // 23:00 - 00:00
          name = "NEW YORK LUNCH"
          color = "bg-amber-50"
          text = "text-amber-600"
          border = "border-amber-100"
          dot = "bg-amber-500"
        } else if (minOfDay >= 0 && minOfDay < 180) { // 00:00 - 03:00
          name = "NEW YORK PM KILLZONE"
          color = "bg-fuchsia-50"
          text = "text-fuchsia-600"
          border = "border-fuchsia-100"
          dot = "bg-fuchsia-500"
        }
      }

      setSessionInfo({ name: isWeekend ? "MARKET CLOSED" : `${name} ACTIVE`, color, text, border, dot })
    }

    updateSession()
    const interval = setInterval(updateSession, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between py-5 px-8 bg-white border-b border-slate-100 z-50">
      <div className={`flex items-center gap-2 ${sessionInfo.color} border ${sessionInfo.border} rounded-full px-4 py-1.5 shadow-sm transition-colors duration-500`}>
        <div className={`size-2 rounded-full ${sessionInfo.dot} ${sessionInfo.name.includes('CLOSED') ? '' : 'animate-pulse'}`}></div>
        <span className={`text-xs font-bold tracking-wider ${sessionInfo.text}`}>{sessionInfo.name}</span>
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
