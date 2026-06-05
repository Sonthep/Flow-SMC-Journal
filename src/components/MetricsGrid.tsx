export default function MetricsGrid() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-slate-800">TRADING DASHBOARD</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Winrate Card */}
        <div className="bg-white rounded-[1.5rem] p-6 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center items-center justify-center">
          <h3 className="text-slate-500 text-[11px] font-bold mb-2 uppercase tracking-wider">WINRATE</h3>
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight">68.2%</div>
          <div className="text-slate-400 text-sm mt-1 font-medium">(11.31R Total)</div>
        </div>

        {/* Avg RR Ratio Card */}
        <div className="bg-white rounded-[1.5rem] p-6 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center items-center justify-center">
          <h3 className="text-slate-500 text-[11px] font-bold mb-2 uppercase tracking-wider">AVG RR RATIO</h3>
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight">1 : 4.5</div>
        </div>

        {/* Max Losing Streak Card */}
        <div className="bg-white rounded-[1.5rem] p-6 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center items-center justify-center">
          <h3 className="text-slate-500 text-[11px] font-bold mb-2 uppercase tracking-wider">MAX LOSING STREAK</h3>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-extrabold text-slate-800 tracking-tight">3 / 5</div>
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-sm border border-emerald-200">SAFETY OK</span>
          </div>
        </div>
      </div>
    </div>
  )
}
