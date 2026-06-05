import { ScrollText } from "lucide-react"

export default function TradesTable() {
  const recentTrades = [
    {
      id: "1",
      asset: "XAUUSD",
      time: "11:39",
      tf: "M1",
      tags: ["SWEEP", "M1-BODY"],
      rr: "+4.81R",
      outcome: "WIN",
    },
    {
      id: "2",
      asset: "XAUUSD",
      time: "12:04",
      tf: "M1",
      tags: ["CHOCH", "OB-FILL"],
      rr: "+3.33R",
      outcome: "WIN",
    },
    {
      id: "3",
      asset: "XAUUSD",
      time: "13:15",
      tf: "M1",
      tags: ["SWEEP", "M1-WICK"],
      rr: "-1.00R",
      outcome: "LOS",
    },
    {
      id: "4",
      asset: "XAUUSD",
      time: "12:38",
      tf: "M1",
      tags: ["FVG", "BOS"],
      rr: "+4.30R",
      outcome: "WIN",
    },
    {
      id: "5",
      asset: "XAUUSD",
      time: "12:38",
      tf: "M1",
      tags: ["SWEEP", "BOS"],
      rr: "+2.33R",
      outcome: "WIN",
    },
    {
      id: "6",
      asset: "XAUUSD",
      time: "12:09",
      tf: "M1",
      tags: ["FVG", "BOS"],
      rr: "+3.33R",
      outcome: "WIN",
    },
    {
      id: "7",
      asset: "XAUUSD",
      time: "13:35",
      tf: "M1",
      tags: ["FVG", "BOS"],
      rr: "-1.00R",
      outcome: "LOS",
    }
  ]

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
            {recentTrades.map((trade) => {
              const isWin = trade.outcome === "WIN"
              return (
                <tr key={trade.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="py-3 pl-2 align-middle">
                    <div className="font-bold text-slate-800">{trade.asset}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">{trade.time} {trade.tf}</div>
                  </td>
                  <td className="py-3 align-middle text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {trade.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-slate-500 tracking-wide border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50">
                          [{tag}]
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-2 align-middle text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`font-mono font-bold ${isWin ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trade.rr}
                      </span>
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${isWin ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
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
    </div>
  )
}
