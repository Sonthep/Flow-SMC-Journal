"use client"

import Header from "@/components/Header"
import { Play, SkipForward, Rewind, Pause, Maximize2, Settings2, Crosshair, BarChart2 } from "lucide-react"

export default function BacktestingPage() {
  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto flex-1 flex flex-col overflow-hidden h-[calc(100vh-80px)]">
        
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">Advanced Simulator</h2>
            <div className="bg-sky-50 text-sky-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-sky-100">
              Live Session
            </div>
          </div>
          
          {/* Simulator Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button className="p-2 text-slate-400 hover:text-slate-700 transition-colors"><Rewind className="size-4" /></button>
            <button className="p-2 text-sky-500 hover:text-sky-600 transition-colors"><Pause className="size-4" /></button>
            <button className="p-2 text-slate-400 hover:text-slate-700 transition-colors"><Play className="size-4 fill-current" /></button>
            <button className="p-2 text-slate-400 hover:text-slate-700 transition-colors"><SkipForward className="size-4" /></button>
            <div className="w-px h-4 bg-slate-200 mx-2"></div>
            <span className="text-xs font-bold text-slate-600 px-2">1x Speed</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          
          {/* Chart Area (Left Side - 3 Columns) */}
          <div className="lg:col-span-3 bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden relative">
            
            {/* Chart Toolbar */}
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">EURUSD</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sky-500 font-bold text-sm">1M</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500 font-medium text-xs">OANDA</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Crosshair className="size-4 cursor-pointer hover:text-slate-700 transition-colors" />
                <BarChart2 className="size-4 cursor-pointer hover:text-slate-700 transition-colors" />
                <Settings2 className="size-4 cursor-pointer hover:text-slate-700 transition-colors" />
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <Maximize2 className="size-4 cursor-pointer hover:text-slate-700 transition-colors" />
              </div>
            </div>

            {/* Mock Candlestick Chart Area */}
            <div className="flex-1 relative bg-slate-50/30 overflow-hidden flex items-center justify-center">
              {/* Background Grid Lines */}
              <div className="absolute inset-0" style={{ backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)' }}></div>
              
              {/* Price Axis (Right) */}
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-white border-l border-slate-100 flex flex-col justify-between py-10 text-[10px] text-slate-400 font-mono text-center z-10">
                <span>1.08600</span>
                <span>1.08550</span>
                <span>1.08500</span>
                <span className="text-sky-500 font-bold bg-sky-50 py-1 border-y border-sky-100">1.08472</span>
                <span>1.08400</span>
                <span>1.08350</span>
                <span>1.08300</span>
              </div>

              {/* Mock Candles SVG */}
              <div className="absolute inset-0 right-16 px-10 pt-20">
                <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
                  {/* Bearish Candle */}
                  <line x1="50" y1="100" x2="50" y2="180" stroke="#f43f5e" strokeWidth="2" />
                  <rect x="44" y="120" width="12" height="40" fill="#f43f5e" />
                  
                  {/* Bullish Candle */}
                  <line x1="90" y1="150" x2="90" y2="220" stroke="#10b981" strokeWidth="2" />
                  <rect x="84" y="160" width="12" height="50" fill="#10b981" />
                  
                  {/* Bearish Candle */}
                  <line x1="130" y1="180" x2="130" y2="260" stroke="#f43f5e" strokeWidth="2" />
                  <rect x="124" y="200" width="12" height="40" fill="#f43f5e" />

                  {/* Bullish Candle - Big push */}
                  <line x1="170" y1="120" x2="170" y2="250" stroke="#10b981" strokeWidth="2" />
                  <rect x="164" y="140" width="12" height="100" fill="#10b981" />

                  {/* Small Bearish */}
                  <line x1="210" y1="130" x2="210" y2="160" stroke="#f43f5e" strokeWidth="2" />
                  <rect x="204" y="135" width="12" height="15" fill="#f43f5e" />

                  {/* Doji */}
                  <line x1="250" y1="120" x2="250" y2="170" stroke="#10b981" strokeWidth="2" />
                  <rect x="244" y="145" width="12" height="2" fill="#10b981" />

                  {/* Current Active Candle */}
                  <line x1="290" y1="100" x2="290" y2="150" stroke="#10b981" strokeWidth="2" />
                  <rect x="284" y="110" width="12" height="35" fill="#10b981" className="animate-pulse" />

                  {/* Mock SMC Zone Box */}
                  <rect x="250" y="80" width="200" height="30" fill="rgba(14, 165, 233, 0.1)" stroke="rgba(14, 165, 233, 0.3)" strokeWidth="1" strokeDasharray="4 4" />
                  <text x="255" y="100" fontSize="10" fill="#0ea5e9" fontWeight="bold">15m Order Block</text>
                </svg>

                {/* Current Price Line */}
                <div className="absolute left-0 right-0 border-t border-dashed border-sky-400" style={{ top: '40%' }}>
                  <div className="absolute right-0 translate-x-full bg-sky-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-l -mt-2">
                    1.08472
                  </div>
                </div>
              </div>
            </div>

            {/* Time Axis (Bottom) */}
            <div className="h-8 bg-white border-t border-slate-100 flex items-center justify-around px-10 text-[10px] text-slate-400 font-mono pr-16">
              <span>08:00</span>
              <span>08:15</span>
              <span>08:30</span>
              <span>08:45</span>
              <span>09:00</span>
              <span>09:15</span>
            </div>
          </div>

          {/* Execution Panel (Right Side - 1 Column) */}
          <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto">
            
            {/* Order Entry */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 shrink-0">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Order Entry</h3>
              
              <div className="flex items-center gap-2 mb-4 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button className="flex-1 py-2 rounded-lg text-xs font-bold transition-all bg-white text-slate-800 shadow-sm border border-slate-200">Market</button>
                <button className="flex-1 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-800">Limit</button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-500">Risk %</span>
                    <span className="font-bold text-slate-800">1.0% ($1,000)</span>
                  </div>
                  <input type="range" className="w-full accent-sky-500" min="0.1" max="5" step="0.1" defaultValue="1" />
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">SL</span>
                    <input type="number" defaultValue="1.08400" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-800 font-mono" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">7.2 Pips</span>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">TP</span>
                    <input type="number" defaultValue="1.08688" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-800 font-mono" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">3.0 RR</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 font-bold py-3 rounded-xl transition-colors shadow-sm flex flex-col items-center justify-center gap-0.5">
                    <span className="text-sm">SELL</span>
                    <span className="text-[9px] opacity-80 uppercase tracking-wider">Market</span>
                  </button>
                  <button className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-600 font-bold py-3 rounded-xl transition-colors shadow-sm flex flex-col items-center justify-center gap-0.5">
                    <span className="text-sm">BUY</span>
                    <span className="text-[9px] opacity-80 uppercase tracking-wider">Market</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Open Positions */}
            <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 flex flex-col min-h-[200px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Position</h3>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                <Crosshair className="size-8 mb-2 opacity-20" />
                <p className="text-xs font-medium">No active positions</p>
                <p className="text-[10px]">Execute a trade to view it here.</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
