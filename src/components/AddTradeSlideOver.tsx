"use client"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import SniperEntryForm from "@/components/SniperEntryForm"

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function AddTradeSlideOver({ isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/10 z-[9998] animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      {/* Side panel */}
      <div className="fixed inset-y-0 left-0 w-full max-w-2xl bg-slate-50 z-[9999] flex flex-col shadow-2xl border-r border-slate-200 animate-in slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white sticky top-0 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-sky-100 text-sky-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Log New Trade</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Entry Form</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        
        {/* Content Area - Scrollable */}
        <div className="p-6 flex-1 overflow-y-auto">
          <SniperEntryForm className="border border-slate-200 shadow-sm p-6 bg-white rounded-2xl" />
        </div>
        
      </div>
    </>,
    document.body
  )
}
