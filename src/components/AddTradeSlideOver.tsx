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
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[9998]" 
        onClick={onClose} 
      />
      {/* Full-screen panel */}
      <div className="fixed inset-0 bg-slate-50 z-[9999] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-xl shadow-sm border border-slate-200 hover:border-rose-200 transition-all"
          >
            <X className="size-4" />
            Close Window
          </button>
        </div>
        
        {/* Content Area - Scrollable */}
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <SniperEntryForm className="border border-slate-200 shadow-xl p-8 bg-white rounded-3xl" />
          </div>
        </div>
        
      </div>
    </>,
    document.body
  )
}
