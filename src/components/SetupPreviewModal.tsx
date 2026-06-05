"use client"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Target, Image as ImageIcon, CheckSquare, Clock, ArrowRight } from "lucide-react"

interface Trade {
  id?: string
  asset?: string
  time?: string
  tf?: string
  tags?: string[]
  rr?: string
  outcome?: string
  dir?: string
  entry?: string
  sl?: string
  tp?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  trade: Trade | null
}

export default function SetupPreviewModal({ isOpen, onClose, trade }: Props) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted || !trade) return null

  const isWin = trade.outcome === "WIN"
  const isLoss = trade.outcome === "LOSS" || trade.outcome === "LOS"
  const isBuy = trade.dir === "BUY" || trade.dir === "LONG" || !trade.dir // default to BUY for demo

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9998]" 
        onClick={onClose} 
      />
      {/* Centered Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-12 pointer-events-none">
        <div className="bg-slate-50 w-full max-w-6xl max-h-full rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-6 border-b border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-4">
              <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl font-black text-lg ${isWin ? 'bg-emerald-100 text-emerald-600' : isLoss ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                {isBuy ? '↑' : '↓'}
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 -mt-1">{isBuy ? 'LONG' : 'SHRT'}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{trade.asset || 'XAUUSD'}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${isWin ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : isLoss ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {trade.outcome || 'PENDING'}
                  </span>
                  <span className={`font-mono font-bold text-lg ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-slate-500'}`}>
                    {trade.rr || '+0.00R'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock className="size-3.5" /> {trade.time || '14:30'} ({trade.tf || 'M5'})</span>
                  <span>•</span>
                  <span>{trade.id || 'TRD-001'}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-xl shadow-sm border border-slate-200 hover:border-rose-200 transition-all"
            >
              <X className="size-4" />
              Close Preview
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Image & Narrative */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Screenshot Area */}
                <div className="bg-white p-2 border border-slate-200 rounded-2xl shadow-sm">
                  <div className="bg-slate-100 rounded-xl aspect-[16/9] w-full relative overflow-hidden group">
                    <img 
                      src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop" 
                      alt="Chart Setup" 
                      className="w-full h-full object-cover grayscale-[10%]"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-slate-800 font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                        <ImageIcon className="size-4" />
                        View Full Size
                      </button>
                    </div>
                  </div>
                </div>

                {/* Narrative */}
                <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trade Narrative & Emotions</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Price swept the London high and formed a clear CHOCH on the 1-minute timeframe. I waited for the fair value gap to be mitigated before entering. Was feeling a bit FOMO initially but forced myself to wait for the candle to close. The setup was textbook A-Tier. Trade played out perfectly to the opposing liquidity pool.
                  </p>
                </div>
              </div>

              {/* Right Column: Details & Tags */}
              <div className="space-y-6">
                
                {/* Execution Data */}
                <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target className="size-4" /> Execution Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-sm text-slate-500 font-medium">Entry Price</span>
                      <span className="text-sm font-bold text-slate-800">{trade.entry || '1.08450'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-sm text-slate-500 font-medium">Stop Loss</span>
                      <span className="text-sm font-bold text-rose-500">{trade.sl || '1.08300'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-sm text-slate-500 font-medium">Take Profit</span>
                      <span className="text-sm font-bold text-emerald-500">{trade.tp || '1.08850'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-slate-500 font-medium">Risk / Size</span>
                      <span className="text-sm font-bold text-slate-800">0.5% / 10.0 Lots</span>
                    </div>
                  </div>
                </div>

                {/* Tags & Confluences */}
                <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">SMC Confluences</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(trade.tags || ['SWEEP', 'CHOCH', 'FVG']).map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded bg-sky-50 text-sky-600 border border-sky-100 text-[11px] font-bold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-t border-slate-100 pt-4">Discipline Checklist</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckSquare className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-xs font-medium text-slate-700">Setup candle fully closed</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckSquare className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-xs font-medium text-slate-700">Solid body close (No ambiguity)</span>
                    </div>
                    <div className="flex items-start gap-2 opacity-50">
                      <div className="size-4 border-2 border-slate-300 rounded mt-0.5 shrink-0"></div>
                      <span className="text-xs font-medium text-slate-500 line-through">Waited for HTF alignment</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
          
        </div>
      </div>
    </>,
    document.body
  )
}
