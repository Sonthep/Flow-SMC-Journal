"use client"

import { useState } from "react"
import Header from "@/components/Header"
import { Search, Filter, Download, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from "lucide-react"

export default function JournalPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar")

  // List View Trades Data
  const trades = [
    { id: "TRD-1102", date: "2026-06-05", pair: "EUR/USD", dir: "SELL", entry: "1.08450", exit: "1.08200", rr: "+2.5R", outcome: "WIN", tags: ["SMC Expansion", "London Open"] },
    { id: "TRD-1101", date: "2026-06-04", pair: "XAU/USD", dir: "BUY", entry: "2024.10", exit: "2022.00", rr: "-1.0R", outcome: "LOSS", tags: ["Liquidity Sweep", "NY Session"] },
    { id: "TRD-1100", date: "2026-06-04", pair: "GBP/USD", dir: "BUY", entry: "1.26400", exit: "1.26900", rr: "+4.1R", outcome: "WIN", tags: ["SMC Expansion", "Order Block"] },
    { id: "TRD-1099", date: "2026-06-03", pair: "USD/JPY", dir: "SELL", entry: "148.500", exit: "148.500", rr: "0.0R", outcome: "BE", tags: ["Order Block", "Asia High"] },
    { id: "TRD-1098", date: "2026-06-02", pair: "EUR/USD", dir: "BUY", entry: "1.07900", exit: "1.08250", rr: "+3.2R", outcome: "WIN", tags: ["FVG", "London Open"] },
  ]

  // Mock Calendar Data for June 2026 (starting Monday June 1)
  // Format: [week1, week2, ...] where each week is an array of 7 days
  const calendarData = [
    [
      { day: 1, netRR: -1.0, trades: 1, isCurrentMonth: true },
      { day: 2, netRR: 3.2, trades: 1, isCurrentMonth: true },
      { day: 3, netRR: 0.0, trades: 1, isCurrentMonth: true },
      { day: 4, netRR: 3.1, trades: 2, isCurrentMonth: true },
      { day: 5, netRR: 2.5, trades: 1, isCurrentMonth: true },
      { day: 6, netRR: null, trades: 0, isCurrentMonth: true },
      { day: 7, netRR: null, trades: 0, isCurrentMonth: true },
    ],
    [
      { day: 8, netRR: 1.5, trades: 2, isCurrentMonth: true },
      { day: 9, netRR: -2.0, trades: 3, isCurrentMonth: true },
      { day: 10, netRR: 4.2, trades: 1, isCurrentMonth: true },
      { day: 11, netRR: null, trades: 0, isCurrentMonth: true },
      { day: 12, netRR: -0.5, trades: 1, isCurrentMonth: true },
      { day: 13, netRR: null, trades: 0, isCurrentMonth: true },
      { day: 14, netRR: null, trades: 0, isCurrentMonth: true },
    ],
    [
      { day: 15, netRR: 5.0, trades: 2, isCurrentMonth: true },
      { day: 16, netRR: -1.0, trades: 1, isCurrentMonth: true },
      { day: 17, netRR: 2.1, trades: 1, isCurrentMonth: true },
      { day: 18, netRR: 1.0, trades: 2, isCurrentMonth: true },
      { day: 19, netRR: -1.5, trades: 2, isCurrentMonth: true },
      { day: 20, netRR: null, trades: 0, isCurrentMonth: true },
      { day: 21, netRR: null, trades: 0, isCurrentMonth: true },
    ],
    [
      { day: 22, netRR: 0.0, trades: 1, isCurrentMonth: true },
      { day: 23, netRR: 2.8, trades: 1, isCurrentMonth: true },
      { day: 24, netRR: -2.0, trades: 2, isCurrentMonth: true },
      { day: 25, netRR: 4.5, trades: 2, isCurrentMonth: true },
      { day: 26, netRR: 1.2, trades: 1, isCurrentMonth: true },
      { day: 27, netRR: null, trades: 0, isCurrentMonth: true },
      { day: 28, netRR: null, trades: 0, isCurrentMonth: true },
    ],
    [
      { day: 29, netRR: 3.0, trades: 1, isCurrentMonth: true },
      { day: 30, netRR: -1.0, trades: 1, isCurrentMonth: true },
      { day: 1, netRR: null, trades: 0, isCurrentMonth: false },
      { day: 2, netRR: null, trades: 0, isCurrentMonth: false },
      { day: 3, netRR: null, trades: 0, isCurrentMonth: false },
      { day: 4, netRR: null, trades: 0, isCurrentMonth: false },
      { day: 5, netRR: null, trades: 0, isCurrentMonth: false },
    ],
  ]

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto flex-1 overflow-auto flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Trading Journal</h2>
          
          <div className="flex items-center gap-3">
            {/* View Toggles */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
              <button 
                onClick={() => setViewMode("calendar")}
                className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${viewMode === "calendar" ? "bg-sky-50 text-sky-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                <CalendarIcon className="size-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-sky-50 text-sky-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                <List className="size-4" />
              </button>
            </div>

            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="size-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 flex flex-col overflow-hidden">
          
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input type="text" placeholder="Search pairs, tags..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
              </div>
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:border-sky-500 transition-colors w-48">
                <ChevronLeft className="size-4 text-slate-400 hover:text-slate-600" />
                <span className="text-sm font-bold text-slate-700">June 2026</span>
                <ChevronRight className="size-4 text-slate-400 hover:text-slate-600" />
              </div>
            </div>
            
            {viewMode === "calendar" && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Monthly R:R</p>
                  <p className="text-sm font-bold text-emerald-500">+18.4R</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</p>
                  <p className="text-sm font-bold text-slate-700">62.5%</p>
                </div>
              </div>
            )}
          </div>

          {/* Calendar View */}
          {viewMode === "calendar" && (
            <div className="flex-1 flex flex-col p-6 bg-slate-50/50 overflow-auto">
              <div className="grid grid-cols-7 gap-4 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="flex-1 grid grid-rows-5 gap-4 min-h-[600px]">
                {calendarData.map((week, wIndex) => (
                  <div key={wIndex} className="grid grid-cols-7 gap-4">
                    {week.map((dayData, dIndex) => {
                      const isWin = dayData.netRR !== null && dayData.netRR > 0;
                      const isLoss = dayData.netRR !== null && dayData.netRR < 0;
                      const isBE = dayData.netRR === 0;
                      
                      return (
                        <div 
                          key={dIndex} 
                          className={`
                            relative rounded-2xl p-4 flex flex-col transition-all cursor-pointer min-h-[110px]
                            ${!dayData.isCurrentMonth ? 'opacity-30 bg-transparent border-transparent' : 'bg-white shadow-sm border border-slate-100 hover:shadow-md hover:border-sky-200'}
                            ${isWin ? 'bg-gradient-to-br from-white to-emerald-50/30' : ''}
                            ${isLoss ? 'bg-gradient-to-br from-white to-rose-50/30' : ''}
                          `}
                        >
                          <span className={`text-sm font-bold ${dayData.isCurrentMonth ? 'text-slate-500' : 'text-slate-400'}`}>
                            {dayData.day}
                          </span>
                          
                          {dayData.trades > 0 && (
                            <div className="mt-auto flex flex-col items-center justify-center absolute inset-0 pt-4">
                              <div className={`text-xl font-bold tracking-tight ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-slate-400'}`}>
                                {dayData.netRR! > 0 ? '+' : ''}{dayData.netRR}R
                              </div>
                              <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                                {dayData.trades} {dayData.trades === 1 ? 'Trade' : 'Trades'}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List View Table */}
          {viewMode === "list" && (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                    <th className="p-4 pl-6 border-b border-slate-100">Trade ID / Date</th>
                    <th className="p-4 border-b border-slate-100">Asset & Dir</th>
                    <th className="p-4 border-b border-slate-100">Entry / Exit</th>
                    <th className="p-4 border-b border-slate-100">Strategy Tags</th>
                    <th className="p-4 border-b border-slate-100 text-right pr-6">Result</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {trades.map(trade => {
                    const isWin = trade.outcome === "WIN";
                    const isLoss = trade.outcome === "LOSS";
                    
                    return (
                      <tr key={trade.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-4 pl-6 align-middle">
                          <div className="font-bold text-slate-700">{trade.id}</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">{trade.date}</div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="font-bold text-slate-800">{trade.pair}</div>
                          <div className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${trade.dir === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {trade.dir}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="text-slate-600 font-medium">{trade.entry}</div>
                          <div className="text-slate-400 text-xs mt-0.5">&rarr; {trade.exit}</div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {trade.tags.map(tag => (
                              <span key={tag} className="text-[10px] font-bold text-slate-500 tracking-wide border border-slate-200 px-1.5 py-0.5 rounded bg-white group-hover:bg-slate-50">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 pr-6 align-middle text-right">
                          <div className={`font-mono font-bold text-[15px] mb-1 ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-slate-400'}`}>
                            {trade.rr}
                          </div>
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            isWin ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                            isLoss ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                            'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {trade.outcome}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
                <button className="flex items-center gap-1 text-slate-400 hover:text-slate-800 font-semibold text-sm transition-colors">
                  <ChevronLeft className="size-4" /> Previous
                </button>
                <button className="flex items-center gap-1 text-slate-400 hover:text-slate-800 font-semibold text-sm transition-colors">
                  Next <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
