interface Props {
  winRate: number
  totalR: number
  avgRR: number
  maxLosingStreak: number
  totalTrades: number
  profitFactor: number
  bestSession?: string
}

export default function MetricsGrid({ winRate, totalR, avgRR, maxLosingStreak, totalTrades, profitFactor, bestSession }: Props) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-slate-800">TRADING DASHBOARD</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Trades */}
        <div className="bg-white rounded-[1.25rem] p-5 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
          <h3 className="text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Total Trades</h3>
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{totalTrades}</div>
          <div className="text-slate-400 text-xs mt-1 font-medium">executions</div>
        </div>

        {/* Winrate */}
        <div className="bg-white rounded-[1.25rem] p-5 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
          <h3 className="text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Win Rate</h3>
          <div className={`text-3xl font-extrabold tracking-tight ${winRate >= 55 ? 'text-emerald-500' : winRate >= 45 ? 'text-amber-500' : 'text-rose-500'}`}>
            {winRate.toFixed(1)}%
          </div>
          <div className="text-slate-400 text-xs mt-1 font-medium">{totalR > 0 ? '+' : ''}{totalR.toFixed(2)}R total</div>
        </div>

        {/* Avg RR */}
        <div className="bg-white rounded-[1.25rem] p-5 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
          <h3 className="text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Avg R:R</h3>
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight">1 : {avgRR.toFixed(1)}</div>
          <div className="text-slate-400 text-xs mt-1 font-medium">per winning trade</div>
        </div>

        {/* Profit Factor */}
        <div className="bg-white rounded-[1.25rem] p-5 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
          <h3 className="text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Profit Factor</h3>
          <div className={`text-3xl font-extrabold tracking-tight ${profitFactor >= 2 ? 'text-emerald-500' : profitFactor >= 1 ? 'text-amber-500' : 'text-rose-500'}`}>
            {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
          </div>
          <div className="text-slate-400 text-xs mt-1 font-medium">gross win / loss</div>
        </div>

        {/* Best Session */}
        <div className="bg-white rounded-[1.25rem] p-5 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
          <h3 className="text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Best Session</h3>
          <div className="text-2xl font-extrabold text-violet-500 tracking-tight">
            {bestSession ? bestSession.replace(/_/g, ' ') : '—'}
          </div>
          <div className="text-slate-400 text-xs mt-1 font-medium">highest win rate</div>
        </div>

        {/* Max Losing Streak */}
        <div className="bg-white rounded-[1.25rem] p-5 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
          <h3 className="text-slate-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider">Max DD Streak</h3>
          <div className="flex items-center gap-2 justify-center">
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{maxLosingStreak}</div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              maxLosingStreak >= 5 ? 'bg-rose-50 text-rose-600 border-rose-200' : 
              maxLosingStreak >= 3 ? 'bg-amber-50 text-amber-600 border-amber-200' :
              'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              {maxLosingStreak >= 5 ? 'DANGER' : maxLosingStreak >= 3 ? 'CAUTION' : 'OK'}
            </span>
          </div>
          <div className="text-slate-400 text-xs mt-1 font-medium">consecutive losses</div>
        </div>

      </div>
    </div>
  )
}
