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
  direction?: string
  entryPrice?: number
  stopLoss?: number
  takeProfit?: number
  riskPercent?: number
  realizedRR?: number | null
  entry?: string
  sl?: string
  tp?: string
  contextImgUrl?: string | null
  entryImgUrl?: string | null
  imageUrls?: string[]
  pair?: string
  title?: string | null
  journalNote?: string
  createdAt?: string | Date
  hasChoch?: boolean
  sweepType?: string
  entryZone?: string
  valueZone?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
  trade: Trade | null
}

export default function SetupPreviewModal({ isOpen, onClose, onUpdate, trade }: Props) {
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editOutcome, setEditOutcome] = useState("PENDING")
  const [editRR, setEditRR] = useState("")
  const [editNote, setEditNote] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [fullScreenImg, setFullScreenImg] = useState<string>("")
  
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (trade) {
      setEditOutcome(trade.outcome || "PENDING")
      setEditRR(trade.realizedRR !== null && trade.realizedRR !== undefined ? String(trade.realizedRR) : "")
      setEditNote(trade.journalNote || "")
      setEditTitle(trade.title || "")
      setIsEditing(false)
    }
  }, [trade, isOpen])

  const handleOutcomeChange = (status: string) => {
    setEditOutcome(status);
    if (status === 'WIN') {
      if (trade?.entryPrice && trade?.stopLoss && trade?.takeProfit) {
        const targetRR = Math.abs(trade.takeProfit - trade.entryPrice) / Math.abs(trade.entryPrice - trade.stopLoss);
        setEditRR(targetRR.toFixed(2));
      }
    } else if (status === 'LOSS') {
      setEditRR("-1");
    } else if (status === 'BE') {
      setEditRR("0");
    } else {
      setEditRR("");
    }
  }

  const handleUpdate = async () => {
    if (!trade?.id) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/trades/${trade.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome: editOutcome,
          realizedRR: editRR ? parseFloat(editRR) : null,
          journalNote: editNote,
          title: editTitle
        })
      });
      if (res.ok) {
        setIsEditing(false);
        if (onUpdate) onUpdate();
      } else {
        alert("Failed to update trade");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating trade");
    } finally {
      setIsSaving(false);
    }
  }

  const handleDelete = async () => {
    if (!trade?.id || !confirm("Are you sure you want to delete this trade?")) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/trades/${trade.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (onUpdate) onUpdate();
        onClose();
      } else {
        alert("Failed to delete trade");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting trade");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen || !mounted || !trade) return null

  const isWin = trade.outcome === "WIN"
  const isLoss = trade.outcome === "LOSS" || trade.outcome === "LOS"
  const isBuy = trade.dir === "BUY" || trade.dir === "LONG" || trade.direction === "BUY" || !trade.dir

  const date = trade.createdAt ? new Date(trade.createdAt) : new Date()
  const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok', hour12: false })

  // Compute tier based on available data
  const setupTier = (() => {
    let count = 0;
    if (trade.tags) {
      count = trade.tags.length;
    } else {
      if (trade.hasChoch) count++;
      if (trade.sweepType === 'EXTERNAL_MAJOR') count += 2;
      else if (trade.sweepType) count++;
      if (trade.entryZone) count++;
      if (trade.valueZone === 'DISCOUNT' || trade.valueZone === 'PREMIUM') count++;
    }
    
    if (count >= 5) return { grade: "S-Tier", desc: "A+ High Probability", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" };
    if (count >= 4) return { grade: "A-Tier", desc: "Solid Setup", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" };
    if (count >= 2) return { grade: "B-Tier", desc: "Moderate Risk", color: "text-sky-600", bg: "bg-sky-100", border: "border-sky-200" };
    return { grade: "C-Tier", desc: "Low Probability / Scalp", color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" };
  })();

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
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{trade.pair || trade.asset || 'XAUUSD'}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${isWin ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : isLoss ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {trade.outcome || 'PENDING'}
                  </span>
                  <span className={`font-mono font-bold text-lg ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-slate-500'}`}>
                    {(() => {
                      if (trade.realizedRR != null) {
                        return trade.realizedRR > 0 ? `+${trade.realizedRR}R` : `${trade.realizedRR}R`
                      }
                      if ((trade.outcome === 'PENDING' || !trade.outcome) && trade.entryPrice && trade.stopLoss && trade.takeProfit) {
                        const targetRR = (Math.abs(trade.takeProfit - trade.entryPrice) / Math.abs(trade.entryPrice - trade.stopLoss)).toFixed(2)
                        return `Tgt: ${targetRR}R`
                      }
                      return '+0.00R'
                    })()}
                  </span>
                </div>
                
                {trade.title && (
                  <div className="text-xl font-bold text-slate-700 mb-2 tracking-tight">
                    {trade.title}
                  </div>
                )}
                
                {/* BIG TIER BADGE */}
                <div className={`mt-2 mb-3 flex items-center gap-3 px-4 py-1.5 rounded-xl border-2 ${setupTier.bg} ${setupTier.border} w-max`}>
                  <span className={`text-xl font-black uppercase tracking-wider ${setupTier.color}`}>{setupTier.grade}</span>
                  <span className={`text-sm font-bold uppercase ${setupTier.color} opacity-80 border-l-2 border-current pl-3`}>{setupTier.desc}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock className="size-3.5" /> {timeString}</span>
                  <span>•</span>
                  <span className="truncate max-w-[120px]">{trade.id || 'TRD-001'}</span>
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
                <div className="bg-white p-2 border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-3">
                  {(trade.imageUrls && trade.imageUrls.length > 0) ? (
                    trade.imageUrls.map((url, idx) => (
                      <div key={idx} className="bg-slate-100 rounded-xl aspect-[16/9] w-full relative overflow-hidden group">
                        <img 
                          src={url} 
                          alt={`Chart Setup ${idx + 1}`} 
                          className="w-full h-full object-cover grayscale-[10%] cursor-pointer hover:grayscale-0 transition-all duration-300"
                          onClick={() => {
                            setFullScreenImg(url);
                            setIsFullScreen(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center pointer-events-none">
                          <button 
                            onClick={() => {
                              setFullScreenImg(url);
                              setIsFullScreen(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-slate-800 font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 pointer-events-auto"
                          >
                            <ImageIcon className="size-4" />
                            View Full Size
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-100 rounded-xl aspect-[16/9] w-full relative overflow-hidden group">
                      <img 
                        src={trade.contextImgUrl || trade.entryImgUrl || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop"} 
                        alt="Chart Setup" 
                        className="w-full h-full object-cover grayscale-[10%] cursor-pointer hover:grayscale-0 transition-all duration-300"
                        onClick={() => {
                          setFullScreenImg(trade.contextImgUrl || trade.entryImgUrl || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop");
                          setIsFullScreen(true);
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center pointer-events-none">
                        <button 
                          onClick={() => {
                            setFullScreenImg(trade.contextImgUrl || trade.entryImgUrl || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop");
                            setIsFullScreen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-slate-800 font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 pointer-events-auto"
                        >
                          <ImageIcon className="size-4" />
                          View Full Size
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Narrative */}
                <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trade Narrative & Emotions</h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {trade.journalNote || <span className="text-slate-400 italic">No narrative provided.</span>}
                  </p>
                </div>

                {/* Edit Section */}
                {!isEditing ? (
                  <div className="flex gap-3">
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-sky-50 text-sky-600 font-bold rounded-xl text-sm border border-sky-100 hover:bg-sky-100 transition-colors">
                      Edit Result & Notes
                    </button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm border border-rose-100 hover:bg-rose-100 transition-colors">
                      Delete Trade
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 border border-slate-200 rounded-2xl shadow-inner space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Update Result</h3>
                    
                    <div>
                      <span className="text-xs font-medium text-slate-500 mb-2 block">Outcome:</span>
                      <div className="flex gap-2">
                        {['PENDING', 'WIN', 'LOSS', 'BE'].map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleOutcomeChange(status)}
                            className={`px-3 py-1 rounded border text-xs font-bold transition-colors ${
                              editOutcome === status 
                                ? status === 'WIN' ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                  : status === 'LOSS' ? 'bg-rose-50 border-rose-200 text-rose-600'
                                  : status === 'BE' ? 'bg-amber-50 border-amber-200 text-amber-600'
                                  : 'bg-slate-800 border-slate-800 text-white'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-slate-500 mb-2 block">Realized RR:</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={editRR}
                        onChange={(e) => setEditRR(e.target.value)}
                        placeholder="e.g. 2.5 or -1"
                        className="bg-white border border-slate-200 rounded px-3 py-1.5 text-sm w-32 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-medium text-slate-500 mb-2 block">Setup Title:</span>
                      <input 
                        type="text" 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 mb-4 text-sm font-bold focus:outline-none focus:border-sky-500"
                      />
                      <span className="text-xs font-medium text-slate-500 mb-2 block">Trade Narrative & Emotions:</span>
                      <textarea 
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        rows={4}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button onClick={handleUpdate} disabled={isSaving} className="px-5 py-2 bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-colors disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-5 py-2 bg-white text-slate-600 font-bold rounded-xl text-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
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
                      <span className="text-sm font-bold text-slate-800">{trade.entryPrice || trade.entry || '1.08450'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-sm text-slate-500 font-medium">Stop Loss</span>
                      <span className="text-sm font-bold text-rose-500">{trade.stopLoss || trade.sl || '1.08300'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <span className="text-sm text-slate-500 font-medium">Take Profit</span>
                      <span className="text-sm font-bold text-emerald-500">{trade.takeProfit || trade.tp || '1.08850'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-slate-500 font-medium">Risk</span>
                      <span className="text-sm font-bold text-slate-800">{trade.riskPercent || '0.5'}%</span>
                    </div>
                  </div>
                </div>

                {/* Tags & Confluences */}
                <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">SMC Confluences</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(() => {
                      const tags = []
                      if (trade.tags) return trade.tags;
                      if (trade.hasChoch) tags.push("CHOCH")
                      if (trade.entryZone) tags.push(trade.entryZone)
                      if (trade.sweepType) tags.push(trade.sweepType.replace('_', ' '))
                      if (trade.valueZone) tags.push(trade.valueZone)
                      return tags.length > 0 ? tags : ['NO TAGS']
                    })().map(tag => (
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

      {/* Full Screen Image Modal */}
      {isFullScreen && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/95 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsFullScreen(false)}
        >
          <button 
            onClick={() => setIsFullScreen(false)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[10001]"
          >
            <X className="size-6" />
          </button>
          <img 
            src={fullScreenImg} 
            alt="Chart Setup Full Size" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl relative z-[10001]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>,
    document.body
  )
}
