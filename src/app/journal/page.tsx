"use client"

import { useState, useEffect, useMemo } from "react"
import Header from "@/components/Header"
import { Search, Download, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, X, Loader2, TrendingUp, TrendingDown, Clock } from "lucide-react"
import SetupPreviewModal from "@/components/SetupPreviewModal"
import { useToast } from "@/components/Toast"

const PAGE_SIZE = 10

export default function JournalPage() {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)
  
  const [trades, setTrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOutcome, setFilterOutcome] = useState<string>("ALL")
  const [filterDirection, setFilterDirection] = useState<string>("ALL")
  const [filterSession, setFilterSession] = useState<string>("ALL")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterOutcome, filterDirection, viewMode])

  // Month Navigation
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const currentMonthTrades = useMemo(() => {
    return trades.filter(t => {
      const d = new Date(t.createdAt)
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()
    })
  }, [trades, currentMonth])

  const { monthlyNetRR, monthlyWinRate } = useMemo(() => {
    const finished = currentMonthTrades.filter(t => ['WIN','LOSS','BE','PARTIAL_WIN'].includes(t.outcome))
    let netRR = 0, wins = 0
    finished.forEach(t => {
      if (t.realizedRR) netRR += t.realizedRR
      if (t.outcome === 'WIN') wins++
    })
    return {
      monthlyNetRR: netRR,
      monthlyWinRate: finished.length > 0 ? (wins / finished.length) * 100 : 0
    }
  }, [currentMonthTrades])

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    let firstDayOfWeek = firstDayOfMonth.getDay()
    if (firstDayOfWeek === 0) firstDayOfWeek = 7
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
      const finishedDayTrades = dayTrades.filter(t => ['WIN','LOSS','BE','PARTIAL_WIN'].includes(t.outcome))
      let dayNetRR = null
      if (finishedDayTrades.length > 0) {
        dayNetRR = finishedDayTrades.reduce((acc, t) => acc + (t.realizedRR || 0), 0)
      }
      currentWeek.push({ day: i, netRR: dayNetRR, trades: dayTrades.length, isCurrentMonth: true, date: new Date(year, month, i) })
      if (currentWeek.length === 7) { calendar.push(currentWeek); currentWeek = [] }
    }
    let nextMonthDay = 1
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push({ day: nextMonthDay++, netRR: null, trades: 0, isCurrentMonth: false, date: null })
    }
    if (currentWeek.length === 7) calendar.push(currentWeek)
    return calendar
  }, [currentMonth, currentMonthTrades])

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  const selectedDayTrades = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = selectedDate.toDateString()
    return trades.filter(t => new Date(t.createdAt).toDateString() === dateStr)
  }, [selectedDate, trades])

  // ─── List View: Filtered + Paginated ───
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      const matchSearch = searchQuery === "" ||
        (t.pair || "XAUUSD").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.journalNote || "").toLowerCase().includes(searchQuery.toLowerCase())
      const matchOutcome = filterOutcome === "ALL" || t.outcome === filterOutcome
      const matchDirection = filterDirection === "ALL" || t.direction === filterDirection
      const matchSession = filterSession === "ALL" || t.session === filterSession
      return matchSearch && matchOutcome && matchDirection && matchSession
    })
  }, [trades, searchQuery, filterOutcome, filterDirection, filterSession])

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / PAGE_SIZE))
  const paginatedTrades = filteredTrades.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const hasActiveFilters = filterOutcome !== "ALL" || filterDirection !== "ALL" || filterSession !== "ALL" || searchQuery !== ""

  const getTagsFromTrade = (trade: any): string[] => {
    const tags: string[] = []
    if (trade.hasChoch) tags.push("CHOCH")
    if (trade.entryZone === "FVG") tags.push("FVG"); else tags.push("OB")
    if (trade.sweepType === "EXTERNAL_MAJOR") tags.push("EXT-SWEEP"); else tags.push("INT-SWEEP")
    return tags
  }

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
            <button
                onClick={() => {
                  if (filteredTrades.length === 0) { toast("No trades to export", "info"); return; }
                  const headers = ["Date","Pair","Direction","Session","Outcome","Entry","SL","TP","Risk%","Realized RR","Title","Narrative"]
                  const rows = filteredTrades.map(t => [
                    new Date(t.createdAt).toLocaleDateString('th-TH'),
                    t.pair || "XAUUSD",
                    t.direction || "",
                    (t.session || "").replace(/_/g, ' '),
                    t.outcome || "",
                    t.entryPrice ?? "",
                    t.stopLoss ?? "",
                    t.takeProfit ?? "",
                    t.riskPercent ?? "",
                    t.realizedRR ?? "",
                    (t.title || "").replace(/,/g, ';'),
                    (t.journalNote || "").replace(/,/g, ';').replace(/\n/g, ' '),
                  ])
                  const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
                  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url; a.download = `trades_${new Date().toISOString().slice(0,10)}.csv`; a.click()
                  URL.revokeObjectURL(url)
                  toast(`Exported ${filteredTrades.length} trades`, "success")
                }}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              <Download className="size-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 flex flex-col overflow-hidden">

          {/* ─── Filter Bar ─── */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap flex-1">

                {/* Search — always visible */}
                <div className="relative min-w-[180px] max-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search pairs, notes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters — only in List mode */}
                {viewMode === "list" && (<>

                {/* Outcome Filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["ALL", "WIN", "LOSS", "BE", "PENDING"] as const).map(outcome => (
                    <button
                      key={outcome}
                      onClick={() => setFilterOutcome(outcome)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                        filterOutcome === outcome
                          ? outcome === "WIN"     ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                          : outcome === "LOSS"    ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                          : outcome === "BE"      ? "bg-amber-400 text-white border-amber-400 shadow-sm"
                          : outcome === "PENDING" ? "bg-slate-600 text-white border-slate-600 shadow-sm"
                          : "bg-sky-500 text-white border-sky-500 shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {outcome === "ALL" ? "All" : outcome}
                    </button>
                  ))}
                </div>

                {/* Direction Filter */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFilterDirection("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                      filterDirection === "ALL" ? "bg-sky-500 text-white border-sky-500 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                  >Both</button>
                  <button
                    onClick={() => setFilterDirection("BUY")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                      filterDirection === "BUY" ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                  ><TrendingUp className="size-3" /> Long</button>
                  <button
                    onClick={() => setFilterDirection("SELL")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                      filterDirection === "SELL" ? "bg-rose-500 text-white border-rose-500 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                  ><TrendingDown className="size-3" /> Short</button>
                </div>

                {/* Session Filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {([
                    { value: "ALL",      label: "All Sessions" },
                    { value: "ASIA",     label: "Asia" },
                    { value: "LONDON",   label: "London" },
                    { value: "NY_AM",    label: "NY AM" },
                    { value: "NY",       label: "NY" },
                    { value: "NY_LUNCH", label: "Lunch" },
                    { value: "NY_PM",    label: "NY PM" },
                  ]).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setFilterSession(value)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-all border ${
                        filterSession === value
                          ? "bg-violet-500 text-white border-violet-500 shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={() => { setFilterOutcome("ALL"); setFilterDirection("ALL"); setFilterSession("ALL"); setSearchQuery("") }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors px-2 py-1.5"
                  >
                    <X className="size-3" /> Reset
                  </button>
                )}
                </>)}
              </div>

              {/* Right side: calendar nav OR results count */}
              {viewMode === "calendar" ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="size-4 text-slate-500" /></button>
                    <span className="text-sm font-bold text-slate-700 w-32 text-center">{monthName}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight className="size-4 text-slate-500" /></button>
                  </div>
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
              ) : (
                <p className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  <span className="font-bold text-slate-600">{filteredTrades.length}</span> trades found
                </p>
              )}
            </div>
          </div>

          {/* ─── Body ─── */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-300 size-8" />
            </div>
          ) : viewMode === "calendar" ? (
            <div className="flex-1 flex flex-col p-6 bg-slate-50/50 overflow-auto">
              <div className="grid grid-cols-7 gap-4 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest py-2">{day}</div>
                ))}
              </div>
              <div className="flex-1 grid gap-4 min-h-[600px]" style={{ gridTemplateRows: `repeat(${calendarData.length}, 1fr)` }}>
                {calendarData.map((week, wIndex) => (
                  <div key={wIndex} className="grid grid-cols-7 gap-4">
                    {week.map((dayData, dIndex) => {
                      const isWin = dayData.netRR !== null && dayData.netRR > 0
                      const isLoss = dayData.netRR !== null && dayData.netRR < 0
                      return (
                        <div
                          key={dIndex}
                          onClick={() => dayData.trades > 0 && setSelectedDate(dayData.date)}
                          className={`relative rounded-2xl p-4 flex flex-col transition-all min-h-[110px]
                            ${!dayData.isCurrentMonth ? 'opacity-30 bg-transparent border-transparent' : 'bg-white shadow-sm border border-slate-100 hover:shadow-md hover:border-sky-200 hover:-translate-y-0.5'}
                            ${isWin ? 'bg-gradient-to-br from-white to-emerald-50/30' : ''}
                            ${isLoss ? 'bg-gradient-to-br from-white to-rose-50/30' : ''}
                            ${dayData.trades > 0 ? 'cursor-pointer' : ''}
                          `}
                        >
                          <span className={`text-sm font-bold ${dayData.isCurrentMonth ? 'text-slate-500' : 'text-slate-400'}`}>{dayData.day}</span>
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
            /* ─── LIST VIEW ─── */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-white sticky top-0 z-10 shadow-sm">
                    <tr className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                      <th className="p-4 pl-6 border-b border-slate-100">Trade / Date</th>
                      <th className="p-4 border-b border-slate-100">Asset & Dir</th>
                      <th className="p-4 border-b border-slate-100">Entry / Exit</th>
                      <th className="p-4 border-b border-slate-100">Session</th>
                      <th className="p-4 border-b border-slate-100">Strategy Tags</th>
                      <th className="p-4 border-b border-slate-100 text-right pr-6">Result</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-50">
                    {paginatedTrades.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="size-8 text-slate-200" />
                            <p className="font-medium">No trades found</p>
                            <p className="text-xs text-slate-300">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedTrades.map(trade => {
                      const isWin = trade.outcome === "WIN"
                      const isLoss = trade.outcome === "LOSS"
                      const tags = getTagsFromTrade(trade)
                      const date = new Date(trade.createdAt)
                      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })

                      return (
                        <tr
                          key={trade.id}
                          onClick={() => setSelectedTrade(trade)}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        >
                          <td className="p-4 pl-6 align-middle">
                            <div className="font-mono font-bold text-xs text-slate-400">{trade.id.slice(0, 8).toUpperCase()}</div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
                              <Clock className="size-3" />
                              {dateStr} · {timeStr}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="font-bold text-slate-800">{trade.pair || 'XAUUSD'}</div>
                            <div className={`text-[10px] uppercase font-bold tracking-wider mt-1 flex items-center gap-1 ${trade.direction === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {trade.direction === 'BUY' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                              {trade.direction === 'BUY' ? 'LONG' : 'SHORT'}
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="text-slate-600 font-medium tabular-nums">{trade.entryPrice}</div>
                            <div className="text-slate-400 text-xs mt-0.5 tabular-nums">→ {trade.takeProfit}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wide">
                              {(trade.session || 'LONDON').replace(/_/g, ' ')}
                            </span>
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
                              {trade.realizedRR !== null && trade.realizedRR !== undefined
                                ? `${trade.realizedRR > 0 ? '+' : ''}${Number(trade.realizedRR).toFixed(2)}R`
                                : '---'}
                            </div>
                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              isWin ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : isLoss ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : trade.outcome === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {trade.outcome}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* ─── PAGINATION ─── */}
              {totalPages > 1 && (
                <div className="border-t border-slate-100 bg-white px-6 py-3 flex items-center justify-between flex-shrink-0">
                  <p className="text-xs text-slate-400 font-medium">
                    Showing{" "}
                    <span className="font-bold text-slate-600">{Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredTrades.length)}</span>
                    –
                    <span className="font-bold text-slate-600">{Math.min(currentPage * PAGE_SIZE, filteredTrades.length)}</span>
                    {" "}of{" "}
                    <span className="font-bold text-slate-600">{filteredTrades.length}</span> trades
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="size-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...")
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, i) =>
                        p === "..." ? (
                          <span key={`e-${i}`} className="px-2 text-slate-300 text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p as number)}
                            className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-bold transition-all border ${
                              currentPage === p
                                ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
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
                <div className="flex items-center justify-center p-12 text-slate-400 font-medium">No trades recorded for this day.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {selectedDayTrades.map(trade => {
                    const isWin = trade.outcome === "WIN"
                    const isLoss = trade.outcome === "LOSS"
                    const isBuy = trade.direction === "BUY"
                    const tags = getTagsFromTrade(trade)
                    const timeStr = new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    return (
                      <div
                        key={trade.id}
                        onClick={() => setSelectedTrade(trade)}
                        className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white flex flex-col cursor-pointer group"
                      >
                        <div className="h-[140px] bg-slate-100 w-full relative overflow-hidden border-b border-slate-100 flex items-center justify-center">
                          {trade.contextImgUrl ? (
                            <img src={trade.contextImgUrl} alt="Chart" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                          <div className="text-[11px] text-slate-500 font-medium">{timeStr} • {(trade.session || 'LONDON').replace('_', ' ')}</div>
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
