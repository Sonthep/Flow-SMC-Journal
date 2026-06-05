import Header from "@/components/Header"
import MetricsGrid from "@/components/MetricsGrid"
import EquityCurveChart from "@/components/EquityCurveChart"
import WinLossPieChart from "@/components/WinLossPieChart"
import TradesTable from "@/components/TradesTable"

export default function Home() {
  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex-1 overflow-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Performance Analytics</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Track your progress and verify your edge.</p>
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="mb-6">
          <MetricsGrid />
        </div>
        
        {/* Visual Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Equity Curve */}
          <div className="lg:col-span-2">
            <EquityCurveChart />
          </div>
          
          {/* Pie Chart */}
          <div className="lg:col-span-1">
            <WinLossPieChart />
          </div>
        </div>

        {/* Recent Trades Table */}
        <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-10">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Executions</h2>
            <button className="text-xs font-bold text-sky-500 hover:text-sky-600 uppercase tracking-wider transition-colors">
              View All
            </button>
          </div>
          <div className="p-6">
            <TradesTable />
          </div>
        </div>

      </main>
    </>
  )
}
