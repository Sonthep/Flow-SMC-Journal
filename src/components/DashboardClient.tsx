"use client"
import { useState, useEffect } from "react"
import MetricsGrid from "./MetricsGrid"
import EquityCurveChart from "./EquityCurveChart"
import WinLossPieChart from "./WinLossPieChart"
import TradesTable from "./TradesTable"
import { Loader2 } from "lucide-react"

export default function DashboardClient() {
  const [trades, setTrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  // --- Calculations ---
  // API returns trades sorted desc (newest first).
  // For equity curve and losing streak, chronological order is better.
  const chronologicalTrades = [...trades].reverse()

  const finishedTrades = chronologicalTrades.filter(t => t.outcome === 'WIN' || t.outcome === 'LOSS' || t.outcome === 'BE' || t.outcome === 'PARTIAL_WIN')
  
  // Winrate
  let winCount = 0
  let lossCount = 0
  finishedTrades.forEach(t => {
    if (t.outcome === 'WIN') winCount++
    if (t.outcome === 'LOSS') lossCount++
  })
  const totalFinishedForWinrate = winCount + lossCount
  const winRate = totalFinishedForWinrate > 0 ? (winCount / totalFinishedForWinrate) * 100 : 0

  // Total R & Equity Curve
  let totalR = 0
  let currentBalance = 10000 // Base balance
  const equityData: { name: string; balance: number }[] = []
  
  if (finishedTrades.length === 0) {
    equityData.push({ name: 'Start', balance: 10000 })
  }

  finishedTrades.forEach((t, i) => {
    const r = t.realizedRR || 0
    totalR += r
    
    // Calculate PnL based on risk percent
    const riskAmount = currentBalance * (t.riskPercent / 100)
    if (r > 0) {
      currentBalance += riskAmount * r
    } else if (r < 0) {
      // For a loss, R is usually a negative number (e.g. -1R)
      currentBalance -= riskAmount * Math.abs(r)
    }
    
    const dateStr = new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    equityData.push({ name: `${dateStr} (#${i+1})`, balance: currentBalance })
  })

  // Avg RR
  const winningTrades = finishedTrades.filter(t => t.outcome === 'WIN' && t.realizedRR)
  const sumWinningR = winningTrades.reduce((acc, t) => acc + (t.realizedRR || 0), 0)
  const avgRR = winningTrades.length > 0 ? sumWinningR / winningTrades.length : 0

  // Max Losing Streak
  let currentLosingStreak = 0
  let maxLosingStreak = 0
  finishedTrades.forEach(t => {
    if (t.outcome === 'LOSS') {
      currentLosingStreak++
      if (currentLosingStreak > maxLosingStreak) maxLosingStreak = currentLosingStreak
    } else if (t.outcome === 'WIN') {
      currentLosingStreak = 0
    }
  })

  return (
    <>
      <div className="mb-6">
        <MetricsGrid 
          winRate={winRate} 
          totalR={totalR} 
          avgRR={avgRR} 
          maxLosingStreak={maxLosingStreak} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          {isLoading && trades.length === 0 ? (
            <div className="bg-white rounded-[1.5rem] h-[400px] flex items-center justify-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
               <Loader2 className="animate-spin text-slate-300 size-8" />
            </div>
          ) : (
            <EquityCurveChart data={equityData} currentBalance={currentBalance} />
          )}
        </div>
        
        <div className="lg:col-span-1">
          <WinLossPieChart winCount={winCount} lossCount={lossCount} winRate={winRate} />
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-10">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Executions</h2>
          <button className="text-xs font-bold text-sky-500 hover:text-sky-600 uppercase tracking-wider transition-colors">
            View All
          </button>
        </div>
        <div className="p-6">
          <TradesTable recentTrades={trades} isLoading={isLoading} onRefresh={fetchTrades} />
        </div>
      </div>
    </>
  )
}
