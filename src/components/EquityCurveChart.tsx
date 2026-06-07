"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { name: string; balance: number }[]
  currentBalance: number
}

export default function EquityCurveChart({ data, currentBalance }: Props) {
  return (
    <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Equity Curve</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">{data.length} Trades</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Balance</p>
          <p className="text-xl font-bold text-slate-800">${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
            <YAxis 
              domain={['dataMin - 500', 'dataMax + 500']} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
              formatter={(value: number) => [`$${value}`, 'Balance']}
            />
            <Area type="monotone" dataKey="balance" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
