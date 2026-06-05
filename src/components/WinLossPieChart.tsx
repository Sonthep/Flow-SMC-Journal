"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'Wins', value: 68 },
  { name: 'Losses', value: 32 },
]
const COLORS = ['#10b981', '#f43f5e'] // Emerald and Rose

export default function WinLossPieChart() {
  return (
    <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-[400px]">
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Win Rate Distribution</h2>
      
      <div className="flex-1 w-full relative min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              formatter={(value: number) => [`${value}%`, 'Trades']}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-4 pointer-events-none">
          <span className="text-3xl font-black text-slate-800 tracking-tighter">68%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Win Rate</span>
        </div>
      </div>
      
      {/* Legend / Stats */}
      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex flex-col items-center">
          <span className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider mb-1">Winning Trades</span>
          <span className="text-lg font-bold text-emerald-600">68</span>
        </div>
        <div className="bg-rose-50 rounded-xl p-3 border border-rose-100 flex flex-col items-center">
          <span className="text-[10px] font-bold text-rose-600/80 uppercase tracking-wider mb-1">Losing Trades</span>
          <span className="text-lg font-bold text-rose-600">32</span>
        </div>
      </div>
    </div>
  )
}
