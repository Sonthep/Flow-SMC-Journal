"use client"

import { useState, useEffect, useMemo } from "react"
import Header from "@/components/Header"
import { Search, Filter, Download, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, X, Loader2 } from "lucide-react"
import SetupPreviewModal from "@/components/SetupPreviewModal"

export default function JournalPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)
  
  const [trades, setTrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Start with current month
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trades')
      const data = await res.json()
      if (data.success) {
        setTrades(data.trades)
      }
    } catch (err) {
      console.error("Error fetching trades:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrades()
    const interval = setInterval(fetchTrades, 10000)
    return () => clearInterval(interval)
  }, [])

  // Month Navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Calculate Monthly Stats
  const currentMonthTrades = useMemo(() => {
    return trades.filter(t => {
      const d = new Date(t.createdAt)
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()
    })
  }, [trades, currentMonth])

  const { monthlyNetRR, monthlyWinRate } = useMemo(() => {
    const finished = currentMonthTrades.filter(t => t.outcome === 'WIN' || t.outcome === 'LOSS' || t.outcome === 'BE' || t.outcome === 'PARTIAL_WIN')
    let netRR = 0
    let wins = 0
    finished.forEach(t => {
      if (t.realizedRR) netRR += t.realizedRR
      if (t.outcome === 'WIN') wins++
    })
    return {
      monthlyNetRR: netRR,
      monthlyWinRate: finished.length > 0 ? (wins / finished.length) * 100 : 0
    }
  }, [currentMonthTrades])

  // Calendar Logic (Monday Start)
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    // JS getDay(): Sun=0, Mon=1...
    let firstDayOfWeek = firstDayOfMonth.getDay()
    if (firstDayOfWeek === 0) firstDayOfWeek = 7 // Make Sun=7
    
    const prevMonthDays = firstDayOfWeek - 1
    
    const calendar: any[][] = []
    let currentWeek: any[] = []
    
    const prevMonthLastDate = new Date(year, month, 0).getDate()
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      currentWeek.push({ day: prevMonthLastDate - i, netRR: null, trades: 0, isCurrentMonth: false, date: null })
    }
    
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const currentDateStr = new Date(year, month, i).toDateString()
      const dayTrades = currentMonthTrades.filter(t => new Date(t.createdAt).toDateString() === currentDateStr)
      
      const finishedDayTrades = dayTrades.filter(t => t.outcome === 'WIN' || t.outcome === 'LOSS' || t.outcome === 'BE' || t.outcome === 'PARTIAL_WIN')
      
      let dayNetRR = null
      if (finishedDayTrades.length > 0) {
        dayNetRR = finishedDayTrades.reduce((acc, t) => acc + (t.realizedRR || 0), 0)
      }
      
      currentWeek.push({
        day: i,
        netRR: dayNetRR,
        trades: dayTrades.length,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      })
      
      if (currentWeek.length === 7) {
        calendar.push(currentWeek)
        currentWeek = []
      }
    }
    
    let nextMonthDay = 1
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push({ day: nextMonthDay++, netRR: null, trades: 0, isCurrentMonth: false, date: null })
    }
    if (currentWeek.length === 7) {
      calendar.push(currentWeek)
    }
    
    return calendar
  }, [currentMonth, currentMonthTrades])

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  // Daily trades modal data
  const selectedDayTrades = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = selectedDate.toDateString()
    return trades.filter(t => new Date(t.createdAt).toDateString() === dateStr)
  }, [selectedDate, trades])

  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto flex-1 overflow-auto flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Trading Journal</h2>
          
          <div className="flex items-center gap-3">
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
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                  <ChevronLeft className="size-4 text-slate-500" />
                </button>
                <span className="text-sm font-bold text-slate-700 w-32 text-center">{monthName}</span>
                <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                  <ChevronRight className="size-4 text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Monthly R:R</p>
                <p className={`text-sm font-bold ${monthlyNetRR > 0 ? 'text-emerald-500' : monthlyNetRR < 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                  {monthlyNetRR > 0 ? '+' : ''}{monthlyNetRR.toFixed(2)}R
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</p>
                <p className="text-sm font-bold text-slate-700">{monthlyWinRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-300 size-8" />
            </div>
          ) : viewMode === "calendar" ? (
            <div className="flex-1 flex flex-col p-6 bg-slate-50/50 overflow-auto">
              <div className="grid grid-cols-7 gap-4 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="flex-1 grid gap-4 min-h-[600px]" style={{ gridTemplateRows: `repeat(${calendarData.length}, 1fr)` }}>
                {calendarData.map((week, wIndex) => (
                  <div key={wIndex} className="grid grid-cols-7 gap-4">
                    {week.map((dayData, dIndex) => {
                      const isWin = dayData.netRR !== null && dayData.netRR > 0;
                      const isLoss = dayData.netRR !== null && dayData.netRR < 0;
                      
                      return (
                        <div 
                          key={dIndex} 
                          onClick={() => dayData.trades > 0 && setSelectedDate(dayData.date)}
                          className={`
                            relative rounded-2xl p-4 flex flex-col transition-all min-h-[110px]
                            ${!dayData.isCurrentMonth ? 'opacity-30 bg-transparent border-transparent' : 'bg-white shadow-sm border border-slate-100 hover:shadow-md hover:border-sky-200 hover:-translate-y-0.5'}
                            ${isWin ? 'bg-gradient-to-br from-white to-emerald-50/30' : ''}
                            ${isLoss ? 'bg-gradient-to-br from-white to-rose-50/30' : ''}
                            ${dayData.trades > 0 ? 'cursor-pointer' : ''}
                          `}
                        >
                          <span className={`text-sm font-bold ${dayData.isCurrentMonth ? 'text-slate-500' : 'text-slate-400'}`}>
                            {dayData.day}
                          </span>
                          
                          {dayData.trades > 0 && (
                            <div className="mt-auto flex flex-col items-center justify-center absolute inset-0 pt-4">
                              <div className={`text-xl font-bold tracking-tight ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-slate-400'}`}>
                                {dayData.netRR! > 0 ? '+' : ''}{dayData.netRR?.toFixed(1)}R
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
          ) : (
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
                  {currentMonthTrades.map(trade => {
                    const isWin = trade.outcome === "WIN";
                    const isLoss = trade.outcome === "LOSS";
                    
                    const tags = []
                    if (trade.hasChoch) tags.push("CHOCH")
                    if (trade.entryZone === "FVG") tags.push("FVG")
                    else tags.push("OB")
                    if (trade.sweepType === "EXTERNAL_MAJOR") tags.push("EXT-SWEEP")
                    else tags.push("INT-SWEEP")
                    
                    const date = new Date(trade.createdAt)
                    const dateStr = date.toLocaleDateString()
                    const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})

                    return (
                      <tr key={trade.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-4 pl-6 align-middle">
                          <div className="font-bold text-slate-700">{trade.id.slice(0, 8).toUpperCase()}</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">{dateStr} • {timeStr}</div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="font-bold text-slate-800">{trade.pair || 'XAUUSD'}</div>
                          <div className={`text-[10px] uppercase font-bold tracking-wider mt-1 ${trade.direction === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {trade.direction}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="text-slate-600 font-medium">{trade.entryPrice}</div>
                          <div className="text-slate-400 text-xs mt-0.5">&rarr; {trade.takeProfit}</div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {tags.map(tag => (
                              <span key={tag} className="text-[10px] font-bold text-slate-500 tracking-wide border border-slate-200 px-1.5 py-0.5 rounded bg-white group-hover:bg-slate-50">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 pr-6 align-middle text-right">
                          <div className={`font-mono font-bold text-[15px] mb-1 ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-slate-400'}`}>
                            {trade.realizedRR ? `${trade.realizedRR > 0 ? '+' : ''}${trade.realizedRR}R` : '---'}
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
                  {currentMonthTrades.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        No trades found for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      {/* Daily Trades Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDate(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-sky-100 text-sky-600 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">
                  {selectedDate.getDate()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">Daily Execution Log</h3>
                  <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                    {selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDate(null)} className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm border border-slate-200 transition-colors">
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-auto p-6 bg-slate-50">
              {selectedDayTrades.length === 0 ? (
                <div className="flex items-center justify-center p-12 text-slate-400 font-medium">
                  No trades recorded for this day.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {selectedDayTrades.map(trade => {
                    const isWin = trade.outcome === "WIN";
                    const isLoss = trade.outcome === "LOSS";
                    const isBuy = trade.direction === "BUY";
                    
                    const tags = []
                    if (trade.hasChoch) tags.push("CHOCH")
                    if (trade.entryZone === "FVG") tags.push("FVG")
                    else tags.push("OB")
                    if (trade.sweepType === "EXTERNAL_MAJOR") tags.push("EXT-SWEEP")
                    else tags.push("INT-SWEEP")
                    
                    const timeStr = new Date(trade.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                    
                    return (
                      <div 
                        key={trade.id} 
                        onClick={() => {
                          setSelectedTrade({
                            id: trade.id,
                            asset: trade.pair || 'XAUUSD',
                            dir: trade.direction,
                            outcome: trade.outcome,
                            rr: trade.realizedRR ? `${trade.realizedRR > 0 ? '+' : ''}${trade.realizedRR}R` : '---',
                            entry: trade.entryPrice,
                            sl: trade.stopLoss,
                            tp: trade.takeProfit,
                            tags: tags,
                            time: timeStr,
                            tf: trade.timeframe || "M5",
                            imageUrl: trade.contextImgUrl
                          })
                        }}
                        className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white flex flex-col cursor-pointer group"
                      >
                        <div className="h-[140px] bg-slate-100 w-full relative overflow-hidden border-b border-slate-100 flex items-center justify-center">
                          {trade.contextImgUrl ? (
                            <img 
                              src={trade.contextImgUrl} 
                              alt="Chart" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="text-slate-300 text-xs font-bold uppercase tracking-wider">No Image</div>
                          )}
                          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded">
                            {trade.pair || 'XAUUSD'}
                          </div>
                          {trade.realizedRR !== null && (
                            <div className={`absolute bottom-2 right-2 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-sm ${isWin ? 'bg-emerald-500/90' : isLoss ? 'bg-rose-500/90' : 'bg-slate-500/90'}`}>
                              {trade.realizedRR > 0 ? '+' : ''}{trade.realizedRR}R
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col gap-3 flex-1">
                          <div className="text-[11px] text-slate-500 font-medium">
                            {timeStr} • {trade.session || 'LONDON'}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isWin ? 'bg-emerald-100 text-emerald-700' : isLoss ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                              {trade.outcome}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isBuy ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {isBuy ? 'Bullish' : 'Bearish'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                              {trade.timeframe || 'M5'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <SetupPreviewModal 
        isOpen={!!selectedTrade} 
        onClose={() => setSelectedTrade(null)} 
        trade={selectedTrade} 
      />
    </>
  )
}
