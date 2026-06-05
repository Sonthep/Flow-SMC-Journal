"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, LineChart, Settings, HelpCircle, LogOut, PlusCircle } from "lucide-react"
import AddTradeSlideOver from "./AddTradeSlideOver"

export default function Sidebar() {
  const pathname = usePathname()
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false)

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Journal", href: "/journal", icon: BookOpen },
    { name: "Backtesting", href: "/backtesting", icon: LineChart },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen shrink-0 hidden lg:flex relative z-10">
      {/* Logo Area */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
            <div className="size-6 rounded-full bg-sky-200"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">Flow SMC</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Elite Trading</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-sky-50 text-sky-500 font-bold shadow-sm" 
                  : "text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-sm">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-4 border-t border-slate-100 mt-auto">
        <button 
          onClick={() => setIsAddTradeOpen(true)}
          className="w-full bg-sky-400 hover:bg-sky-500 text-white font-bold py-3.5 px-4 rounded-xl transition-colors focus:outline-none shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 text-sm tracking-wide"
        >
          <PlusCircle className="size-4" />
          New Trade
        </button>
        
        <div className="pt-2 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
            <HelpCircle className="size-4.5" />
            <span className="text-sm font-medium">Support</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors">
            <LogOut className="size-4.5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Global Add Trade Modal */}
      <AddTradeSlideOver isOpen={isAddTradeOpen} onClose={() => setIsAddTradeOpen(false)} />
    </div>
  )
}
