"use client"
import { useState, useEffect } from "react"
import { ScrollText, Loader2 } from "lucide-react"
import SetupPreviewModal from "./SetupPreviewModal"

export default function TradesTable() {
  const [recentTrades, setRecentTrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trades');
      const data = await res.json();
      if (data.success) {
        setRecentTrades(data.trades);
      }
    } catch (err) {
      console.error("Error fetching trades:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTrades();
    
    // Simple polling every 10 seconds to keep dashboard fresh
    const interval = setInterval(fetchTrades, 10000);
    return () => clearInterval(interval);
  }, [])

  return (
    <div className="bg-white rounded-[1.5rem] p-6 flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ScrollText className="size-5 text-sky-500" strokeWidth={2.5} />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">RECENT TRADES STREAM</h2>
        </div>
        <button className="text-sky-500 text-xs font-bold hover:text-sky-600 transition-colors">
          [View All]
        </button>
      </div>

      <div className="flex-1 overflow-auto pr-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              <th className="pb-3 pl-2">ASSET/TIME</th>
              <th className="pb-3 text-center">SETUP TAGS</th>
              <th className="pb-3 text-right pr-2">REALIZED RR/STATUS</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Loading trades...</span>
                  </div>
                </td>
              </tr>
            ) : recentTrades.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400">
                  No trades recorded yet. Log your first setup!
                </td>
              </tr>
            ) : recentTrades.map((trade) => {
              const isWin = trade.outcome === "WIN"
              const isLoss = trade.outcome === "LOSS"
              const isPending = trade.outcome === "PENDING"
              
              const date = new Date(trade.createdAt)
              const timeString = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
              
              // Map tags
              const tags = []
              if (trade.hasChoch) tags.push("CHOCH")
              if (trade.entryZone === "FVG") tags.push("FVG")
              else tags.push("OB")
              if (trade.sweepType === "EXTERNAL_MAJOR") tags.push("EXT-SWEEP")
              else tags.push("INT-SWEEP")
              
              return (
                <tr 
                  key={trade.id} 
                  onClick={() => setSelectedTrade(trade)}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="py-3 pl-2 align-middle">
                    <div className="font-bold text-slate-800">{trade.pair || trade.asset}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">{timeString}</div>
                  </td>
                  <td className="py-3 align-middle text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold text-slate-500 tracking-wide border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50">
                          [{tag}]
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-2 align-middle text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`font-mono font-bold ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-slate-500'}`}>
                        {trade.realizedRR ? `${trade.realizedRR > 0 ? '+' : ''}${trade.realizedRR}R` : '---'}
                      </span>
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${isWin ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : isLoss ? 'bg-rose-50 text-rose-600 border-rose-200' : isPending ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {trade.outcome}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <SetupPreviewModal 
        isOpen={!!selectedTrade} 
        onClose={() => setSelectedTrade(null)} 
        trade={selectedTrade} 
      />
    </div>
  )
}
